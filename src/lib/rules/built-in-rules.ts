import type { GuiaType, ValidationError } from '@/types/tiss';
import type { ValidationRule, ValidationContext } from './rule-types';

/**
 * Regra de validação de campos obrigatórios por tipo de guia
 * Migrada de validateRequiredFields()
 */
export class RequiredFieldsRule implements ValidationRule {
    id = 'required-fields';
    name = 'Campos Obrigatórios';
    description = 'Valida a presença de campos obrigatórios conforme o tipo de guia TISS';
    priority = 100; // Alta prioridade
    enabled = true;

    private requiredFieldsByType: Record<GuiaType, string[]> = {
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

    appliesTo(context: ValidationContext): boolean {
        // Aplica para todos os tipos conhecidos
        return context.guiaType !== 'unknown';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const requiredFields = this.requiredFieldsByType[context.guiaType];
        const xmlString = JSON.stringify(context.parsedXml).toLowerCase();

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
}

/**
 * Regra de validação do namespace TISS
 * Migrada de validateTISSNamespace()
 */
export class TISSNamespaceRule implements ValidationRule {
    id = 'tiss-namespace';
    name = 'Namespace TISS';
    description = 'Valida a presença do namespace ANS e versão TISS';
    priority = 10; // Executa cedo
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true; // Aplica para todos
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        // Check for TISS namespace
        if (!context.xmlContent.includes('ans.gov.br')) {
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
        if (!context.xmlContent.includes('4.02') && !context.xmlContent.includes('v4_02')) {
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
}

/**
 * Regra de validação de encoding UTF-8
 * Migrada de validateXMLStructure()
 */
export class UTF8EncodingRule implements ValidationRule {
    id = 'utf8-encoding';
    name = 'Encoding UTF-8';
    description = 'Valida se o arquivo está em UTF-8';
    priority = 5; // Muito alta prioridade
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true; // Aplica para todos
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        // Check for BOM
        if (context.xmlContent.charCodeAt(0) === 0xFEFF) {
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

        // Check encoding
        const encodingMatch = context.xmlContent.match(/encoding=['"]([\w-]+)['"]/i);
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

        return errors;
    }
}

/**
 * Regra de validação da declaração XML
 * Migrada de validateXMLStructure()
 */
export class XMLDeclarationRule implements ValidationRule {
    id = 'xml-declaration';
    name = 'Declaração XML';
    description = 'Valida a presença da declaração XML';
    priority = 1; // Prioridade máxima
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true; // Aplica para todos
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        // Check XML declaration
        if (!context.xmlContent.trim().startsWith('<?xml')) {
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

        return errors;
    }
}

/**
 * Regra de validação de tipo de guia desconhecido
 */
export class UnknownGuiaTypeRule implements ValidationRule {
    id = 'unknown-guia-type';
    name = 'Tipo de Guia';
    description = 'Alerta quando o tipo de guia não pode ser identificado';
    priority = 20;
    enabled = true;

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'unknown';
    }

    validate(_context: ValidationContext): ValidationError[] {
        return [{
            id: crypto.randomUUID(),
            line: 1,
            column: 1,
            message: 'Tipo de guia não identificado automaticamente',
            severity: 'warning',
            code: 'W004',
        }];
    }
}
