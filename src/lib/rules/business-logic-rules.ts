import type { ValidationError } from '@/types/tiss';
import type { ValidationRule, ValidationContext } from './rule-types';

// Função auxiliar para extrair campos
function extractFieldValues(obj: any, fieldName: string): string[] {
    const values: string[] = [];
    const searchTerm = fieldName.toLowerCase();

    function traverse(current: any) {
        if (!current || typeof current !== 'object') return;
        if (Array.isArray(current)) {
            current.forEach((item) => traverse(item));
            return;
        }
        for (const key in current) {
            const cleanKey = key.replace(/^[^:]+:/, '').toLowerCase();
            if (cleanKey.includes(searchTerm)) {
                const value = current[key];
                if (typeof value === 'string' && value.trim()) {
                    values.push(value.trim());
                } else if (typeof value === 'number') {
                    values.push(String(value));
                }
            }
            if (typeof current[key] === 'object' && current[key] !== null) {
                traverse(current[key]);
            }
        }
    }

    traverse(obj);
    return [...new Set(values)];
}

/**
 * Regra de validação de atendimento RN (Recém-Nascido)
 * Valida se o indicador de RN está correto
 */
export class RNAtendimentoRule implements ValidationRule {
    id = 'rn-atendimento';
    name = 'Validação de Atendimento RN';
    description = 'Valida indicador de atendimento a recém-nascido';
    priority = 150;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true; // Aplica para todos
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        // Busca indicador de RN (valores válidos: 'S' ou 'N')
        const rnValues = extractFieldValues(context.parsedXml, 'atendimentorn');

        for (const rn of rnValues) {
            const normalized = rn.toUpperCase();

            if (normalized !== 'S' && normalized !== 'N') {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Indicador de atendimento RN inválido: ${rn}`,
                    severity: 'error',
                    code: 'BUS001',
                    field: 'atendimentoRN',
                    suggestion: 'Valores permitidos: "S" (Sim) ou "N" (Não)',
                });
            }
        }

        return errors;
    }
}

/**
 * Regra de validação de caráter de atendimento
 * Valida se o caráter está na tabela de domínio TISS
 */
export class CaraterAtendimentoRule implements ValidationRule {
    id = 'carater-atendimento';
    name = 'Validação de Caráter de Atendimento';
    description = 'Valida código de caráter de atendimento';
    priority = 151;
    enabled = true;

    // Tabela de domínio 04 - Caráter de Atendimento
    private readonly validCarater = [
        '1', // Eletivo
        '2', // Urgência
        '3', // Emergência
    ];

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissGuiaSP_SADT' ||
            context.guiaType === 'tissGuiaConsulta';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        const caraterValues = extractFieldValues(context.parsedXml, 'carateratendimento');

        for (const carater of caraterValues) {
            if (!this.validCarater.includes(carater)) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Caráter de atendimento inválido: ${carater}`,
                    severity: 'error',
                    code: 'BUS002',
                    field: 'caraterAtendimento',
                    suggestion: 'Valores válidos: 1 (Eletivo), 2 (Urgência), 3 (Emergência)',
                });
            }
        }

        return errors;
    }
}

/**
 * Regra de validação de tipo de consulta
 * Valida se o tipo de consulta está na tabela de domínio TISS
 */
export class TipoConsultaRule implements ValidationRule {
    id = 'tipo-consulta';
    name = 'Validação de Tipo de Consulta';
    description = 'Valida código de tipo de consulta';
    priority = 152;
    enabled = true;

    // Tabela de domínio 10 - Tipo de Consulta
    private readonly validTipos = [
        '1',  // Primeira consulta
        '2',  // Retorno
        '3',  // Pré-natal
        '4',  // Consulta de retorno em menos de 30 dias
    ];

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissGuiaConsulta';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        const tipoValues = extractFieldValues(context.parsedXml, 'tipoconsulta');

        for (const tipo of tipoValues) {
            if (!this.validTipos.includes(tipo)) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Tipo de consulta inválido: ${tipo}`,
                    severity: 'error',
                    code: 'BUS003',
                    field: 'tipoConsulta',
                    suggestion: 'Valores válidos: 1 (Primeira consulta), 2 (Retorno), 3 (Pré-natal), 4 (Retorno <30 dias)',
                });
            }
        }

        return errors;
    }
}
