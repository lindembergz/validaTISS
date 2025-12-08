import type { ValidationError } from '@/types/tiss';
import type { ValidationRule, ValidationContext } from './rule-types';

// Função auxiliar para extrair campos (cópia simplificada)
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
 * Regra de consistência de autorização
 * Valida se campos relacionados à autorização estão consistentes
 */
export class AuthorizationConsistencyRule implements ValidationRule {
    id = 'authorization-consistency';
    name = 'Consistência de Autorização';
    description = 'Valida consistência entre campos de autorização';
    priority = 140;
    enabled = true;

    appliesTo(context: ValidationContext): boolean {
        // Aplica para guias que têm autorização
        return context.guiaType === 'tissGuiaSP_SADT' ||
            context.guiaType === 'tissGuiaConsulta';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        // Se tem número de guia da operadora, deve ter data de autorização
        const numeroGuiaOperadora = extractFieldValues(context.parsedXml, 'numeroguiaoperadora');
        const dataAutorizacao = extractFieldValues(context.parsedXml, 'dataautorizacao');

        if (numeroGuiaOperadora.length > 0 && dataAutorizacao.length === 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'Número de guia da operadora informado sem data de autorização',
                severity: 'warning',
                code: 'REL001',
                field: 'numeroGuiaOperadora',
                suggestion: 'Se há número de guia da operadora, deve haver data de autorização correspondente',
            });
        }

        // Se tem senha, deve ter número de guia
        const senha = extractFieldValues(context.parsedXml, 'senha');

        if (senha.length > 0 && numeroGuiaOperadora.length === 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'Senha de autorização informada sem número de guia da operadora',
                severity: 'warning',
                code: 'REL002',
                field: 'senha',
                suggestion: 'Se há senha de autorização, deve haver número de guia da operadora',
            });
        }

        return errors;
    }
}

/**
 * Regra de consistência de beneficiário
 * Valida se dados do beneficiário estão completos e consistentes
 */
export class BeneficiaryConsistencyRule implements ValidationRule {
    id = 'beneficiary-consistency';
    name = 'Consistência de Beneficiário';
    description = 'Valida consistência dos dados do beneficiário';
    priority = 141;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true; // Aplica para todos
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        // Número de carteira é obrigatório
        const numeroCarteira = extractFieldValues(context.parsedXml, 'numerocarteira');

        if (numeroCarteira.length === 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'Número de carteira do beneficiário não informado',
                severity: 'error',
                code: 'REL003',
                field: 'numeroCarteira',
                suggestion: 'O número de carteira do beneficiário é obrigatório',
            });
        }

        // Se número de carteira for muito curto, avisar
        for (const carteira of numeroCarteira) {
            if (carteira.length < 5) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Número de carteira muito curto: ${carteira}`,
                    severity: 'warning',
                    code: 'REL004',
                    field: 'numeroCarteira',
                    suggestion: 'Verifique se o número de carteira está completo',
                });
            }
        }

        return errors;
    }
}

/**
 * Regra de consistência de valores
 * Valida se valores monetários estão consistentes
 */
export class ValueConsistencyRule implements ValidationRule {
    id = 'value-consistency';
    name = 'Consistência de Valores';
    description = 'Valida consistência de valores monetários';
    priority = 142;
    enabled = true;

    appliesTo(context: ValidationContext): boolean {
        // Aplica para guias com valores
        return context.guiaType === 'tissGuiaSP_SADT' ||
            context.guiaType === 'tissGuiaConsulta' ||
            context.guiaType === 'tissGuiaOdontologia';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        // Busca valores
        const valores = extractFieldValues(context.parsedXml, 'valor');

        for (const valorStr of valores) {
            const valor = parseFloat(valorStr);

            // Valor não pode ser negativo
            if (!isNaN(valor) && valor < 0) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Valor negativo não permitido: ${valorStr}`,
                    severity: 'error',
                    code: 'REL005',
                    field: 'valor',
                    suggestion: 'Valores monetários devem ser positivos ou zero',
                });
            }

            // Valor muito alto (possível erro)
            if (!isNaN(valor) && valor > 1000000) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Valor muito alto: R$ ${valorStr} - verifique`,
                    severity: 'warning',
                    code: 'REL006',
                    field: 'valor',
                    suggestion: 'Valores acima de R$ 1.000.000,00 são incomuns. Verifique se está correto.',
                });
            }
        }

        return errors;
    }
}
