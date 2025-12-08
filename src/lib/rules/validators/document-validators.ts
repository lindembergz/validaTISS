/**
 * Funções auxiliares para validação de documentos brasileiros
 * CPF, CNPJ, CNS (Cartão Nacional de Saúde)
 */

/**
 * Valida CPF (Cadastro de Pessoas Físicas)
 * @param cpf CPF com ou sem formatação
 * @returns true se o CPF é válido
 */
export function isValidCPF(cpf: string): boolean {
    if (!cpf) return false;

    // Remove formatação
    const cleaned = cpf.replace(/\D/g, '');

    // CPF deve ter 11 dígitos
    if (cleaned.length !== 11) return false;

    // Rejeita CPFs com todos os dígitos iguais (conhecidamente inválidos)
    if (/^(\d)\1{10}$/.test(cleaned)) return false;

    // Valida primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) return false;

    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(10))) return false;

    return true;
}

/**
 * Valida CNPJ (Cadastro Nacional da Pessoa Jurídica)
 * @param cnpj CNPJ com ou sem formatação
 * @returns true se o CNPJ é válido
 */
export function isValidCNPJ(cnpj: string): boolean {
    if (!cnpj) return false;

    // Remove formatação
    const cleaned = cnpj.replace(/\D/g, '');

    // CNPJ deve ter 14 dígitos
    if (cleaned.length !== 14) return false;

    // Rejeita CNPJs com todos os dígitos iguais
    if (/^(\d)\1{13}$/.test(cleaned)) return false;

    // Valida primeiro dígito verificador
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleaned.charAt(i)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(cleaned.charAt(12))) return false;

    // Valida segundo dígito verificador
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cleaned.charAt(i)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(cleaned.charAt(13))) return false;

    return true;
}

/**
 * Valida CNS (Cartão Nacional de Saúde)
 * @param cns CNS com ou sem formatação
 * @returns true se o CNS é válido
 */
export function isValidCNS(cns: string): boolean {
    if (!cns) return false;

    // Remove formatação
    const cleaned = cns.replace(/\D/g, '');

    // CNS deve ter 15 dígitos
    if (cleaned.length !== 15) return false;

    // CNS que começa com 1 ou 2 (cartão definitivo)
    if (cleaned.startsWith('1') || cleaned.startsWith('2')) {
        let sum = 0;
        for (let i = 0; i < 15; i++) {
            sum += parseInt(cleaned.charAt(i)) * (15 - i);
        }
        return sum % 11 === 0;
    }

    // CNS que começa com 7, 8 ou 9 (cartão provisório)
    if (cleaned.startsWith('7') || cleaned.startsWith('8') || cleaned.startsWith('9')) {
        let sum = 0;
        for (let i = 0; i < 15; i++) {
            sum += parseInt(cleaned.charAt(i)) * (15 - i);
        }
        return sum % 11 === 0;
    }

    return false;
}

/**
 * Formata CPF para exibição
 * @param cpf CPF sem formatação
 * @returns CPF formatado (000.000.000-00)
 */
export function formatCPF(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ para exibição
 * @param cnpj CNPJ sem formatação
 * @returns CNPJ formatado (00.000.000/0000-00)
 */
export function formatCNPJ(cnpj: string): string {
    const cleaned = cnpj.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CNS para exibição
 * @param cns CNS sem formatação
 * @returns CNS formatado (000 0000 0000 0000)
 */
export function formatCNS(cns: string): string {
    const cleaned = cns.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
}
