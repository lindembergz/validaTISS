import { XMLParser, XMLValidator as FastXMLValidator } from 'fast-xml-parser';
import { GuiaType, ValidationError, ValidationResult, ValidationStatus } from '@/types/tiss';
import { validateAgainstXSD } from './xsd-validator';
import type { XSDValidationOptions } from './schema-config';

const TISS_NAMESPACE = 'http://www.ans.gov.br/padroes/tiss/schemas';
const TISS_VERSION = '4.02.00';

interface XMLValidationOptions {
  validateSchema?: boolean;
  extractMetadata?: boolean;
  xsdValidation?: XSDValidationOptions;
}

export function detectGuiaType(xmlContent: string): GuiaType {
  if (xmlContent.includes('guiaSP-SADT') || xmlContent.includes('guiaSPSADT')) {
    return 'tissGuiaSP_SADT';
  }
  if (xmlContent.includes('guiaConsulta')) {
    return 'tissGuiaConsulta';
  }
  if (xmlContent.includes('guiaHonorarios') || xmlContent.includes('honorarioIndividual')) {
    return 'tissGuiaHonorarioIndividual';
  }
  if (xmlContent.includes('guiaInternacao') || xmlContent.includes('solicitacaoInternacao')) {
    return 'tissGuiaInternacao';
  }
  if (xmlContent.includes('guiaOdonto') || xmlContent.includes('odontologia')) {
    return 'tissGuiaOdontologia';
  }
  if (xmlContent.includes('loteGuias') || xmlContent.includes('mensagemTISS')) {
    return 'tissLoteGuias';
  }
  return 'unknown';
}

export function extractMetadata(parsedXml: any): ValidationResult['metadata'] {
  const metadata: ValidationResult['metadata'] = {};

  try {
    // Navigate through common TISS structure
    const content = parsedXml?.mensagemTISS || parsedXml;

    // Extract registroANS
    const findValue = (obj: any, keys: string[]): string | undefined => {
      for (const key of keys) {
        if (obj?.[key]) return String(obj[key]);
        for (const prop in obj) {
          if (typeof obj[prop] === 'object') {
            const result = findValue(obj[prop], [key]);
            if (result) return result;
          }
        }
      }
      return undefined;
    };

    metadata.registroANS = findValue(content, ['registroANS', 'codigoOperadora']);
    metadata.numeroGuia = findValue(content, ['numeroGuiaPrestador', 'numeroGuiaOperadora', 'numeroGuia']);
    metadata.dataEmissao = findValue(content, ['dataEmissaoGuia', 'dataAtendimento', 'dataSolicitacao']);
    metadata.beneficiario = findValue(content, ['nomeBeneficiario', 'nomeSocial']);
    metadata.prestador = findValue(content, ['nomePrestador', 'nomeContratado']);
  } catch {
    // Silently fail metadata extraction
  }

  return metadata;
}

export function validateXMLStructure(xmlContent: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for BOM
  if (xmlContent.charCodeAt(0) === 0xFEFF) {
    errors.push({
      id: crypto.randomUUID(),
      line: 1,
      column: 1,
      message: 'O arquivo contém BOM (Byte Order Mark). Recomenda-se remover.',
      severity: 'warning',
      code: 'W001',
      suggestion: 'Salve o arquivo como UTF-8 sem BOM',
    });
  }

  // Check XML declaration
  if (!xmlContent.trim().startsWith('<?xml')) {
    errors.push({
      id: crypto.randomUUID(),
      line: 1,
      column: 1,
      message: 'Declaração XML ausente ou inválida',
      severity: 'error',
      code: 'E001',
      suggestion: 'Adicione: <?xml version="1.0" encoding="UTF-8"?>',
    });
  }

  // Check encoding
  const encodingMatch = xmlContent.match(/encoding=['"]([\w-]+)['"]/i);
  if (encodingMatch && encodingMatch[1].toUpperCase() !== 'UTF-8') {
    errors.push({
      id: crypto.randomUUID(),
      line: 1,
      column: 1,
      message: `Encoding "${encodingMatch[1]}" detectado. O padrão TISS requer UTF-8.`,
      severity: 'warning',
      code: 'W002',
      suggestion: 'Altere o encoding para UTF-8',
    });
  }

  // Use fast-xml-parser for basic validation
  const validationResult = FastXMLValidator.validate(xmlContent, {
    allowBooleanAttributes: true,
  });

  if (validationResult !== true) {
    const err = validationResult.err;
    errors.push({
      id: crypto.randomUUID(),
      line: err.line || 1,
      column: err.col || 1,
      message: err.msg || 'Erro de sintaxe XML',
      severity: 'error',
      code: 'E002',
    });
  }

  return errors;
}

export function validateTISSNamespace(xmlContent: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for TISS namespace
  if (!xmlContent.includes('ans.gov.br')) {
    errors.push({
      id: crypto.randomUUID(),
      line: 1,
      column: 1,
      message: 'Namespace TISS da ANS não encontrado',
      severity: 'error',
      code: 'E003',
      suggestion: `Adicione o namespace: xmlns="http://www.ans.gov.br/padroes/tiss/schemas"`,
    });
  }

  // Check version
  if (!xmlContent.includes('4.02') && !xmlContent.includes('v4_02')) {
    errors.push({
      id: crypto.randomUUID(),
      line: 1,
      column: 1,
      message: 'Versão TISS 4.02.00 não identificada no arquivo',
      severity: 'warning',
      code: 'W003',
      suggestion: 'Verifique se o XML está no padrão TISS versão 4.02.00',
    });
  }

  return errors;
}

export function validateRequiredFields(parsedXml: any, guiaType: GuiaType): ValidationError[] {
  const errors: ValidationError[] = [];

  const requiredFieldsByType: Record<GuiaType, string[]> = {
    tissGuiaSP_SADT: [
      'registroANS',
      'numeroGuiaPrestador',
      'dataAtendimento',
      'codigoProcedimento',
    ],
    tissGuiaConsulta: [
      'registroANS',
      'numeroGuiaPrestador',
      'dataAtendimento',
      'tipoConsulta',
    ],
    tissGuiaHonorarioIndividual: [
      'registroANS',
      'numeroGuiaPrestador',
      'dataRealizacao',
    ],
    tissGuiaInternacao: [
      'registroANS',
      'numeroGuiaPrestador',
      'dataAdmissao',
      'caraterInternacao',
    ],
    tissGuiaOdontologia: [
      'registroANS',
      'numeroGuiaPrestador',
      'dataAtendimento',
    ],
    tissLoteGuias: [
      'registroANS',
      'numeroLote',
      'dataEnvio',
    ],
    unknown: [],
  };

  const requiredFields = requiredFieldsByType[guiaType];
  const xmlString = JSON.stringify(parsedXml).toLowerCase();

  for (const field of requiredFields) {
    if (!xmlString.includes(field.toLowerCase())) {
      errors.push({
        id: crypto.randomUUID(),
        line: 0,
        column: 0,
        message: `Campo obrigatório ausente: ${field}`,
        severity: 'error',
        code: '0001',
        field,
        suggestion: `Adicione o campo ${field} conforme especificação TISS`,
      });
    }
  }

  return errors;
}

export async function validateXML(
  xmlContent: string,
  fileName: string,
  fileSize: number,
  options: XMLValidationOptions = {}
): Promise<ValidationResult> {
  const startTime = performance.now();
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Remove BOM if present
  const cleanContent = xmlContent.replace(/^\uFEFF/, '');

  // Step 1: Validate XML structure
  const structureErrors = validateXMLStructure(cleanContent);
  structureErrors.forEach(err => {
    if (err.severity === 'error') errors.push(err);
    else warnings.push(err);
  });

  // Step 2: Detect guia type
  const guiaType = detectGuiaType(cleanContent);

  if (guiaType === 'unknown') {
    warnings.push({
      id: crypto.randomUUID(),
      line: 1,
      column: 1,
      message: 'Tipo de guia não identificado automaticamente',
      severity: 'warning',
      code: 'W004',
    });
  }

  // Step 3: Validate TISS namespace
  const namespaceErrors = validateTISSNamespace(cleanContent);
  namespaceErrors.forEach(err => {
    if (err.severity === 'error') errors.push(err);
    else warnings.push(err);
  });

  // Step 4: Parse XML and extract metadata
  let parsedXml: any = null;
  let metadata: ValidationResult['metadata'] = {};

  if (errors.filter(e => e.code === 'E002').length === 0) {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
        parseAttributeValue: true,
        trimValues: true,
      });
      parsedXml = parser.parse(cleanContent);

      if (options.extractMetadata !== false) {
        metadata = extractMetadata(parsedXml);
      }
    } catch (err) {
      errors.push({
        id: crypto.randomUUID(),
        line: 1,
        column: 1,
        message: `Erro ao processar XML: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
        severity: 'error',
        code: 'E004',
      });
    }
  }

  // Step 5: Validate required fields
  if (parsedXml && guiaType !== 'unknown') {
    const fieldErrors = validateRequiredFields(parsedXml, guiaType);
    fieldErrors.forEach(err => {
      if (err.severity === 'error') errors.push(err);
      else warnings.push(err);
    });
  }

  // Step 6: Validate against XSD schema
  if (options.xsdValidation?.enabled !== false && guiaType !== 'unknown') {
    try {
      const xsdErrors = await validateAgainstXSD(
        cleanContent,
        guiaType,
        options.xsdValidation
      );
      xsdErrors.forEach(err => {
        if (err.severity === 'error') errors.push(err);
        else warnings.push(err);
      });
    } catch (err) {
      warnings.push({
        id: crypto.randomUUID(),
        line: 1,
        column: 1,
        message: `Validação XSD falhou: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
        severity: 'warning',
        code: 'XSD011',
      });
    }
  }

  // Determine final status
  let status: ValidationStatus = 'valid';
  if (errors.length > 0) {
    status = 'invalid';
  } else if (warnings.length > 0) {
    status = 'warning';
  }

  const processingTime = performance.now() - startTime;

  return {
    id: crypto.randomUUID(),
    fileName,
    fileSize,
    guiaType,
    status,
    errors,
    warnings,
    validatedAt: new Date(),
    processingTime,
    xmlContent: cleanContent,
    metadata,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
