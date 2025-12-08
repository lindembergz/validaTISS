import type { ValidationError } from '@/types/tiss';
import type { ValidationRule, ValidationContext } from './rule-types';
import { isValidUF, isValidConselhoProfissional, isValidTUSSFormat, getUFName, getConselhoProfissionalName, formatTUSSCode } from './validators/table-validators';

// Use direct function instead of import to avoid circular dependency
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
 * Regra de validação de código TUSS (procedimentos)
 */
export class TUSSCodeRule implements ValidationRule {
    id = 'tuss-code';
    name = 'Validação de Código TUSS';
    description = 'Valida formato dos códigos TUSS';
    priority = 130;
    enabled = true;

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissGuiaSP_SADT' ||
            context.guiaType === 'tissGuiaConsulta' ||
            context.guiaType === 'tissGuiaOdontologia';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const procedureCodes = extractFieldValues(context.parsedXml, 'codigoprocedimento');

        for (const code of procedureCodes) {
            if (!isValidTUSSFormat(code)) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Código TUSS inválido: ${code}`,
                    severity: 'warning',
                    code: 'TABLE001',
                    field: 'codigoProcedimento',
                    suggestion: `Código TUSS deve ter 8 dígitos`,
                });
            }
        }

        return errors;
    }
}

/**
 * Regra de validação de código UF
 */
export class UFCodeRule implements ValidationRule {
    id = 'uf-code';
    name = 'Validação de Código UF';
    description = 'Valida códigos de UF contra tabela ANS';
    priority = 131;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const ufCodes = extractFieldValues(context.parsedXml, 'uf');

        for (const code of ufCodes) {
            if (!isValidUF(code)) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Código de UF inválido: ${code}`,
                    severity: 'error',
                    code: 'TABLE002',
                    field: 'UF',
                    suggestion: `Código de UF deve estar na tabela ANS (01-53)`,
                });
            }
        }

        return errors;
    }
}

/**
 * Regra de validação de Conselho Profissional
 */
export class ConselhoProfissionalRule implements ValidationRule {
    id = 'conselho-profissional';
    name = 'Validação de Conselho Profissional';
    description = 'Valida códigos de conselho profissional contra tabela ANS';
    priority = 132;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const conselhoCodes = extractFieldValues(context.parsedXml, 'conselhoprofissional');

        for (const code of conselhoCodes) {
            if (!isValidConselhoProfissional(code)) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Código de Conselho Profissional inválido: ${code}`,
                    severity: 'error',
                    code: 'TABLE003',
                    field: 'conselhoProfissional',
                    suggestion: `Código deve estar na tabela ANS (01-10). Ex: 06 (CRM), 08 (CRO)`,
                });
            }
        }

        return errors;
    }
}
