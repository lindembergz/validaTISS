/**
 * Regras de validação estrutural baseadas nos schemas XSD TISS 4.02.00
 * Extraídas dos arquivos XSD oficiais e implementadas como regras TypeScript nativas
 * 
 * Schemas fonte:
 * - tissV4_02_00.xsd
 * - tissComplexTypesV4_02_00.xsd  
 * - tissSimpleTypesV4_02_00.xsd
 * - tissGuiasV4_02_00.xsd
 */

import type { ValidationError } from '@/types/tiss';
import type { ValidationRule, ValidationContext } from './rule-types';

/**
 * Extrai valor de um campo do XML parseado
 */
function getFieldValue(obj: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let current = obj;

    for (const part of parts) {
        if (!current) return undefined;

        // Remove namespace prefix
        const cleanPart = part.replace(/^[^:]+:/, '');

        // Procura o campo (case insensitive)
        const key = Object.keys(current).find(k =>
            k.replace(/^[^:]+:/, '').toLowerCase() === cleanPart.toLowerCase()
        );

        if (!key) return undefined;
        current = current[key];
    }

    return current;
}

/**
 * Verifica se um campo existe no XML
 */
function fieldExists(obj: any, fieldPath: string): boolean {
    return getFieldValue(obj, fieldPath) !== undefined;
}

/**
 * Regra: Validação de Estrutura do Cabeçalho
 * Baseada em: tissComplexTypesV4_02_00.xsd - ct_cabecalho
 */
export class CabecalhoStructureRule implements ValidationRule {
    id = 'xsd-cabecalho-structure';
    name = 'Estrutura do Cabeçalho TISS';
    description = 'Valida estrutura obrigatória do cabeçalho conforme XSD';
    priority = 10;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const xml = context.parsedXml;

        // Verifica existência do cabeçalho
        if (!fieldExists(xml, 'mensagemTISS.cabecalho')) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'Elemento obrigatório ausente: cabecalho',
                severity: 'error',
                code: 'XSD001',
                field: 'cabecalho',
                suggestion: 'O cabeçalho é obrigatório em todas as mensagens TISS',
            });
            return errors;
        }

        // Campos obrigatórios do cabeçalho
        const requiredFields = [
            { path: 'mensagemTISS.cabecalho.identificacaoTransacao', name: 'identificacaoTransacao' },
            { path: 'mensagemTISS.cabecalho.origem', name: 'origem' },
            { path: 'mensagemTISS.cabecalho.destino', name: 'destino' },
            { path: 'mensagemTISS.cabecalho.Padrao', name: 'Padrao' },
        ];

        for (const field of requiredFields) {
            if (!fieldExists(xml, field.path)) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Campo obrigatório ausente no cabeçalho: ${field.name}`,
                    severity: 'error',
                    code: 'XSD001',
                    field: field.name,
                    suggestion: `O campo ${field.name} é obrigatório no cabeçalho`,
                });
            }
        }

        // Valida versão do padrão
        const padrao = getFieldValue(xml, 'mensagemTISS.cabecalho.Padrao');
        if (padrao && padrao !== '4.02.00') {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: `Versão do padrão inválida: ${padrao}. Esperado: 4.02.00`,
                severity: 'error',
                code: 'XSD001',
                field: 'Padrao',
                suggestion: 'Use a versão 4.02.00 do padrão TISS',
            });
        }

        return errors;
    }
}

/**
 * Regra: Validação de Tipos de Dados Simples
 * Baseada em: tissSimpleTypesV4_02_00.xsd
 */
export class SimpleDataTypesRule implements ValidationRule {
    id = 'xsd-simple-data-types';
    name = 'Tipos de Dados Simples XSD';
    description = 'Valida tipos de dados simples conforme definições XSD';
    priority = 11;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const xml = context.parsedXml;

        // Validações de tamanho de string (st_texto)
        const stringFields = [
            { path: 'mensagemTISS.cabecalho.identificacaoTransacao.sequencialTransacao', maxLength: 12, name: 'sequencialTransacao' },
            { path: 'mensagemTISS.prestadorParaOperadora.loteGuias.numeroLote', maxLength: 12, name: 'numeroLote' },
        ];

        for (const field of stringFields) {
            const value = getFieldValue(xml, field.path);
            if (value && typeof value === 'string' && value.length > field.maxLength) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Campo ${field.name} excede tamanho máximo de ${field.maxLength} caracteres: ${value.length}`,
                    severity: 'error',
                    code: 'XSD002',
                    field: field.name,
                    suggestion: `Reduza o tamanho para no máximo ${field.maxLength} caracteres`,
                });
            }
        }

        return errors;
    }
}

/**
 * Regra: Validação de Enumerações
 * Baseada em: tissSimpleTypesV4_02_00.xsd - dm_* (domain types)
 */
export class EnumerationValuesRule implements ValidationRule {
    id = 'xsd-enumeration-values';
    name = 'Valores de Enumeração XSD';
    description = 'Valida valores contra enumerações definidas no XSD';
    priority = 12;
    enabled = true;

    // Enumerações extraídas do XSD
    private enumerations = {
        dm_tipoTransacao: [
            'ENVIO_LOTE_GUIAS',
            'SOLICITACAO_STATUS_AUTORIZACAO',
            'SOLICITACAO_PROCEDIMENTO',
            'RESPOSTA_AUTORIZACAO',
            'RECURSO_GLOSA',
            'DEMONSTRATIVO_RETORNO',
            'COMUNICACAO_INTERNACAO',
            'SOLICITACAO_DEMONSTRATIVO',
        ],
        dm_indicadorAcidente: [
            '0', // Acidente ou doença relacionada ao trabalho
            '1', // Trânsito
            '2', // Outros
            '9', // Não acidente
        ],
        dm_grauPart: [
            '00', // Anestesista
            '01', // Cirurgião
            '02', // Auxiliar 1
            '03', // Auxiliar 2
            '04', // Auxiliar 3
            '05', // Auxiliar 4
            '06', // Instrumentador
            '07', // Consultor
            '08', // Perfusionista
            '09', // Pediatra
            '10', // Clínico
            '11', // Intensivista
            '12', // Outros
        ],
    };

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        // Validar tipo de transação
        const tipoTransacao = getFieldValue(context.parsedXml, 'mensagemTISS.cabecalho.identificacaoTransacao.tipoTransacao');
        if (tipoTransacao && !this.enumerations.dm_tipoTransacao.includes(tipoTransacao)) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: `Tipo de transação inválido: ${tipoTransacao}`,
                severity: 'error',
                code: 'XSD003',
                field: 'tipoTransacao',
                suggestion: `Valores permitidos: ${this.enumerations.dm_tipoTransacao.join(', ')}`,
            });
        }

        return errors;
    }
}

/**
 * Regra: Validação de Cardinalidade (minOccurs/maxOccurs)
 * Baseada em: definições de sequência nos XSD
 */
export class CardinalityRule implements ValidationRule {
    id = 'xsd-cardinality';
    name = 'Cardinalidade de Elementos XSD';
    description = 'Valida quantidade de ocorrências de elementos conforme XSD';
    priority = 13;
    enabled = true;

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissLoteGuias';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const xml = context.parsedXml;

        // Lote deve ter pelo menos 1 guia
        const guiasTISS = getFieldValue(xml, 'mensagemTISS.prestadorParaOperadora.loteGuias.guiasTISS');

        if (!guiasTISS) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'Lote de guias vazio: deve conter pelo menos uma guia',
                severity: 'error',
                code: 'XSD004',
                field: 'guiasTISS',
                suggestion: 'Adicione pelo menos uma guia ao lote',
            });
        }

        return errors;
    }
}

/**
 * Regra: Validação de Estrutura de Identificação de Transação
 * Baseada em: ct_identificacaoTransacao
 */
export class IdentificacaoTransacaoRule implements ValidationRule {
    id = 'xsd-identificacao-transacao';
    name = 'Estrutura de Identificação de Transação';
    description = 'Valida campos obrigatórios da identificação de transação';
    priority = 14;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const xml = context.parsedXml;

        const basePath = 'mensagemTISS.cabecalho.identificacaoTransacao';

        const requiredFields = [
            { field: 'tipoTransacao', name: 'Tipo de Transação' },
            { field: 'sequencialTransacao', name: 'Sequencial da Transação' },
            { field: 'dataRegistroTransacao', name: 'Data de Registro' },
            { field: 'horaRegistroTransacao', name: 'Hora de Registro' },
        ];

        for (const { field, name } of requiredFields) {
            if (!fieldExists(xml, `${basePath}.${field}`)) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Campo obrigatório ausente na identificação de transação: ${name}`,
                    severity: 'error',
                    code: 'XSD001',
                    field,
                    suggestion: `O campo ${name} é obrigatório na identificação de transação`,
                });
            }
        }

        return errors;
    }
}
