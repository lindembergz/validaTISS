import type { GuiaType, ValidationError } from '@/types/tiss';
import type { ValidationRule, ValidationContext } from './rule-types';
import { isValidCPF, isValidCNPJ, isValidCNS, formatCPF, formatCNPJ, formatCNS } from './validators/document-validators';

/**
 * Extrai todos os valores de um campo específico de um objeto aninhado
 * Funciona com XMLs que têm namespaces (ans:, tiss:, etc) e estruturas aninhadas
 */
function extractFieldValues(obj: any, fieldName: string): string[] {
    const values: string[] = [];
    const searchTerm = fieldName.toLowerCase();
    let keysChecked = 0;
    let matchesFound = 0;

    console.log(`[extractFieldValues] 🔍 Procurando por: "${searchTerm}"`);

    function traverse(current: any, currentPath: string = '') {
        if (!current || typeof current !== 'object') return;

        // Se for array, itera sobre elementos
        if (Array.isArray(current)) {
            current.forEach((item, index) => traverse(item, `${currentPath}[${index}]`));
            return;
        }

        for (const key in current) {
            keysChecked++;

            // Remove namespace prefix para comparação (ex: ans:cpf -> cpf)
            const cleanKey = key.replace(/^[^:]+:/, '').toLowerCase();

            // Verifica se o nome do campo corresponde
            if (cleanKey.includes(searchTerm)) {

                matchesFound++;
                console.log(`[extractFieldValues]   ✓ MATCH! "${key}" (path: ${currentPath || 'root'})`);

                const value = current[key];

                // Se o valor é string, adiciona
                if (typeof value === 'string' && value.trim()) {
                    console.log(`[extractFieldValues]     → STRING: "${value}"`);
                    values.push(value.trim());
                }
                // Se o valor é número, converte COM PADDING se necessário
                else if (typeof value === 'number') {
                    let strValue = String(value);

                    // CORREÇÃO: CPF/CNPJ/CNS podem perder zeros à esquerda quando parseados como número
                    // Fazemos padding baseado no tamanho esperado para cada tipo de documento
                    if (cleanKey.includes('cpf') && strValue.length < 11) {
                        strValue = strValue.padStart(11, '0');
                        console.log(`[extractFieldValues]     → NUMBER: ${value} → PADDED CPF: "${strValue}"`);
                    } else if (cleanKey.includes('cnpj') && strValue.length < 14) {
                        strValue = strValue.padStart(14, '0');
                        console.log(`[extractFieldValues]     → NUMBER: ${value} → PADDED CNPJ: "${strValue}"`);
                    } else if (cleanKey.includes('cns') && strValue.length < 15) {
                        strValue = strValue.padStart(15, '0');
                        console.log(`[extractFieldValues]     → NUMBER: ${value} → PADDED CNS: "${strValue}"`);
                    } else {
                        console.log(`[extractFieldValues]     → NUMBER: ${value}`);
                    }

                    values.push(strValue);
                }
                // Se o valor é objeto com #text (formato do parser XML)
                else if (value && typeof value === 'object' && '#text' in value) {
                    const textValue = value['#text'];
                    if (typeof textValue === 'string' && textValue.trim()) {
                        console.log(`[extractFieldValues]     → #TEXT: "${textValue}"`);
                        values.push(textValue.trim());
                    }
                }
                // Se o valor é objeto, ainda traverse
                else if (value && typeof value === 'object') {
                    console.log(`[extractFieldValues]     → OBJETO (continuando busca...)`);
                    traverse(value, `${currentPath}.${key}`);
                }
            } else {
                // Continua a busca em profundidade
                if (typeof current[key] === 'object' && current[key] !== null) {
                    traverse(current[key], `${currentPath}.${key}`);
                }
            }
        }
    }

    traverse(obj);

    console.log(`[extractFieldValues] 📊 ${keysChecked} chaves, ${matchesFound} matches, ${values.length} valores`);

    return [...new Set(values)]; // Remove duplicatas
}

/**
 * Regra de validação de CPF
 * Valida todos os CPFs encontrados no XML
 */
export class CPFValidationRule implements ValidationRule {
    id = 'cpf-validation';
    name = 'Validação de CPF';
    description = 'Valida formato e dígitos verificadores de CPF';
    priority = 110;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true; // Aplica para todos os tipos de guia
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        console.log(`\n========== CPF VALIDATION ==========`);
        console.log(`Tipo de guia: ${context.guiaType}`);

        // Busca CPFs no XML parseado
        const cpfFields = extractFieldValues(context.parsedXml, 'cpf');

        console.log(`\n[CPFValidationRule] Total de CPFs encontrados: ${cpfFields.length}`);

        for (const cpf of cpfFields) {
            console.log(`\n[CPFValidationRule] Validando: "${cpf}"`);
            if (!isValidCPF(cpf)) {
                console.log(`[CPFValidationRule] ❌ INVÁLIDO!`);
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `CPF inválido: ${cpf}`,
                    severity: 'error',
                    code: 'DOC001',
                    field: 'cpf',
                    suggestion: `Verifique o CPF informado. Formato esperado: 11 dígitos numéricos com dígitos verificadores válidos.`,
                });
            } else {
                console.log(`[CPFValidationRule] ✅ Válido`);
            }
        }

        console.log(`========================================\n`);
        return errors;
    }
}

/**
 * Regra de validação de CNPJ
 * Valida todos os CNPJs encontrados no XML
 */
export class CNPJValidationRule implements ValidationRule {
    id = 'cnpj-validation';
    name = 'Validação de CNPJ';
    description = 'Valida formato e dígitos verificadores de CNPJ';
    priority = 111;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const cnpjFields = extractFieldValues(context.parsedXml, 'cnpj');

        console.log(`\n[CNPJValidationRule] Total de CNPJs encontrados: ${cnpjFields.length}`);

        for (const cnpj of cnpjFields) {
            console.log(`[CNPJValidationRule] Validando: "${cnpj}"`);
            if (!isValidCNPJ(cnpj)) {
                console.log(`[CNPJValidationRule] ❌ INVÁLIDO!`);
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `CNPJ inválido: ${cnpj}`,
                    severity: 'error',
                    code: 'DOC002',
                    field: 'cnpj',
                    suggestion: `Verifique o CNPJ informado. Formato esperado: 14 dígitos numéricos com dígitos verificadores válidos.`,
                });
            } else {
                console.log(`[CNPJValidationRule] ✅ Válido`);
            }
        }

        return errors;
    }
}

/**
 * Regra de validação de CNS (Cartão Nacional de Saúde)
 */
export class CNSValidationRule implements ValidationRule {
    id = 'cns-validation';
    name = 'Validação de CNS';
    description = 'Valida formato e algoritmo do Cartão Nacional de Saúde';
    priority = 112;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const cnsFields = extractFieldValues(context.parsedXml, 'cns');
        const carteiraFields = extractFieldValues(context.parsedXml, 'carteiracns');
        const allCNS = [...cnsFields, ...carteiraFields];

        console.log(`\n[CNSValidationRule] Total de CNS encontrados: ${allCNS.length}`);

        for (const cns of allCNS) {
            const cleaned = cns.replace(/\D/g, '');
            console.log(`[CNSValidationRule] Validando: "${cns}" (${cleaned.length} dígitos)`);
            if (cleaned.length === 15 && !isValidCNS(cns)) {
                console.log(`[CNSValidationRule] ❌ INVÁLIDO!`);
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `CNS (Cartão Nacional de Saúde) inválido: ${cns}`,
                    severity: 'error',
                    code: 'DOC003',
                    field: 'cns',
                    suggestion: `Verifique o CNS informado. Formato esperado: 15 dígitos numéricos.`,
                });
            } else if (cleaned.length === 15) {
                console.log(`[CNSValidationRule] ✅ Válido`);
            }
        }

        return errors;
    }
}
