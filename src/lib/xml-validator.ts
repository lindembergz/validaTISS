import { XMLParser, XMLValidator as FastXMLValidator } from 'fast-xml-parser';
import { GuiaType, ValidationError, ValidationResult, ValidationStatus } from '@/types/tiss';
import { validateAgainstXSD } from './xsd-validator';
import type { XSDValidationOptions } from './schema-config';
import { globalRuleEngine, type ValidationContext } from './rules';

const TISS_NAMESPACE = 'http://www.ans.gov.br/padroes/tiss/schemas';
const TISS_VERSION = '4.02.00';

interface XMLValidationOptions {
  validateSchema?: boolean;
  extractMetadata?: boolean;
  xsdValidation?: XSDValidationOptions;
}

export function detectGuiaType(xmlContent: string): GuiaType {
  // IMPORTANTE: Verificar lote de guias PRIMEIRO, antes de tipos individuais
  // pois um lote pode conter múltiplas guias individuais
  if (xmlContent.includes('loteGuias') || xmlContent.includes('mensagemTISS')) {
    return 'tissLoteGuias';
  }

  // Agora verificar tipos de guias individuais
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

/**
 * @deprecated Use globalRuleEngine with XMLDeclarationRule and UTF8EncodingRule instead
 * Mantida para compatibilidade com código existente
 */
export function validateXMLStructure(xmlContent: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Use fast-xml-parser for basic syntax validation
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

/**
 * @deprecated Use globalRuleEngine with TISSNamespaceRule instead
 * Mantida para compatibilidade com código existente
 */
export function validateTISSNamespace(xmlContent: string): ValidationError[] {
  // Esta função agora é implementada pela TISSNamespaceRule
  // Mantida apenas para compatibilidade
  return [];
}

/**
 * @deprecated Use globalRuleEngine with RequiredFieldsRule instead
 * Mantida para compatibilidade com código existente
 */
export function validateRequiredFields(parsedXml: any, guiaType: GuiaType): ValidationError[] {
  // Esta função agora é implementada pela RequiredFieldsRule
  // Mantida apenas para compatibilidade
  return [];
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

  // Step 1: Validate basic XML syntax (mantém validação de sintaxe direta)
  const syntaxErrors = validateXMLStructure(cleanContent);
  syntaxErrors.forEach(err => {
    if (err.severity === 'error') errors.push(err);
    else warnings.push(err);
  });

  // Se há erro de sintaxe crítico, não continuar
  if (errors.some(e => e.code === 'E002')) {
    const processingTime = performance.now() - startTime;
    return {
      id: crypto.randomUUID(),
      fileName,
      fileSize,
      guiaType: 'unknown',
      status: 'invalid',
      errors,
      warnings,
      validatedAt: new Date(),
      processingTime,
      xmlContent: cleanContent,
    };
  }

  // Step 2: Detect guia type
  const guiaType = detectGuiaType(cleanContent);

  // Step 3: Parse XML and extract metadata
  let parsedXml: any = null;
  let metadata: ValidationResult['metadata'] = {};

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

  // Step 4: Execute rules engine
  if (parsedXml) {
    const context: ValidationContext = {
      xmlContent: cleanContent,
      parsedXml,
      guiaType,
      metadata,
    };

    try {
      const ruleResult = await globalRuleEngine.execute(context);
      errors.push(...ruleResult.errors);
      warnings.push(...ruleResult.warnings);

      console.log(`✓ Motor de regras executou ${ruleResult.executedRules.length} regras em ${ruleResult.executionTime.toFixed(2)}ms`);
    } catch (err) {
      console.error('Erro ao executar motor de regras:', err);
      warnings.push({
        id: crypto.randomUUID(),
        line: 1,
        column: 1,
        message: 'Erro ao executar motor de regras customizadas',
        severity: 'warning',
        code: 'W999',
      });
    }
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
