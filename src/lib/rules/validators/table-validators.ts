/**
 * Tabelas e validadores para códigos padronizados TISS/ANS
 * Baseado no Padrão TISS 4.02.00
 */

/**
 * Códigos de UF (Unidade da Federação) - Tabela ANS
 * Fonte: Padrão TISS (tabela de domínio 12)
 */
export const UF_CODES = [
    '11', // Rondônia
    '12', // Acre
    '13', // Amazonas
    '14', // Roraima
    '15', // Pará
    '16', // Amapá
    '17', // Tocantins
    '21', // Maranhão
    '22', // Piauí
    '23', // Ceará
    '24', // Rio Grande do Norte
    '25', // Paraíba
    '26', // Pernambuco
    '27', // Alagoas
    '28', // Sergipe
    '29', // Bahia
    '31', // Minas Gerais
    '32', // Espírito Santo
    '33', // Rio de Janeiro
    '35', // São Paulo
    '41', // Paraná
    '42', // Santa Catarina
    '43', // Rio Grande do Sul
    '50', // Mato Grosso do Sul
    '51', // Mato Grosso
    '52', // Goiás
    '53', // Distrito Federal
];

/**
 * Mapa de códigos UF para nomes
 */
export const UF_NAMES: Record<string, string> = {
    '11': 'Rondônia',
    '12': 'Acre',
    '13': 'Amazonas',
    '14': 'Roraima',
    '15': 'Pará',
    '16': 'Amapá',
    '17': 'Tocantins',
    '21': 'Maranhão',
    '22': 'Piauí',
    '23': 'Ceará',
    '24': 'Rio Grande do Norte',
    '25': 'Paraíba',
    '26': 'Pernambuco',
    '27': 'Alagoas',
    '28': 'Sergipe',
    '29': 'Bahia',
    '31': 'Minas Gerais',
    '32': 'Espírito Santo',
    '33': 'Rio de Janeiro',
    '35': 'São Paulo',
    '41': 'Paraná',
    '42': 'Santa Catarina',
    '43': 'Rio Grande do Sul',
    '50': 'Mato Grosso do Sul',
    '51': 'Mato Grosso',
    '52': 'Goiás',
    '53': 'Distrito Federal',
};

/**
 * Códigos de Conselho Profissional - Tabela ANS
 * Fonte: Padrão TISS (tabela de domínio 21)
 */
export const CONSELHO_PROFISSIONAL_CODES = [
    '01', // CRAS - Conselho Regional de Assistência Social
    '02', // COREN - Conselho Regional de Enfermagem
    '03', // COFITO - Conselho Federal de Fisioterapia e Terapia Ocupacional
    '04', // CREFONO - Conselho Regional de Fonoaudiologia
    '05', // CREMESP - Conselho Regional de Medicina (São Paulo)
    '06', // CRM - Conselho Regional de Medicina
    '07', // CRN - Conselho Regional de Nutrição
    '08', // CRO - Conselho Regional de Odontologia
    '09', // CRP - Conselho Regional de Psicologia
    '10', // OUTROS
];

/**
 * Mapa de códigos de Conselho Profissional para nomes
 */
export const CONSELHO_PROFISSIONAL_NAMES: Record<string, string> = {
    '01': 'CRAS - Conselho Regional de Assistência Social',
    '02': 'COREN - Conselho Regional de Enfermagem',
    '03': 'COFITO - Conselho Federal de Fisioterapia e Terapia Ocupacional',
    '04': 'CREFONO - Conselho Regional de Fonoaudiologia',
    '05': 'CREMESP - Conselho Regional de Medicina (São Paulo)',
    '06': 'CRM - Conselho Regional de Medicina',
    '07': 'CRN - Conselho Regional de Nutrição',
    '08': 'CRO - Conselho Regional de Odontologia',
    '09': 'CRP - Conselho Regional de Psicologia',
    '10': 'OUTROS',
};

/**
 * Valida se o código de UF está na tabela ANS
 */
export function isValidUF(code: string): boolean {
    if (!code) return false;
    return UF_CODES.includes(code.padStart(2, '0'));
}

/**
 * Valida se o código de Conselho Profissional está na tabela ANS
 */
export function isValidConselhoProfissional(code: string): boolean {
    if (!code) return false;
    return CONSELHO_PROFISSIONAL_CODES.includes(code.padStart(2, '0'));
}

/**
 * Valida formato básico de código TUSS (procedimento)
 * Códigos TUSS têm 8 dígitos no padrão atual
 * Nota: Esta é uma validação de FORMATO apenas, não verifica se o código existe na tabela TUSS oficial
 */
export function isValidTUSSFormat(code: string): boolean {
    if (!code) return false;

    const cleaned = code.replace(/\D/g, '');

    // TUSS padrão: 8 dígitos
    return cleaned.length === 8;
}

/**
 * Valida formato de código CBOS (Classificação Brasileira de Ocupações)
 * CBOS tem 6 dígitos
 */
export function isValidCBOSFormat(code: string): boolean {
    if (!code) return false;

    const cleaned = code.replace(/\D/g, '');

    // CBOS: 6 dígitos
    return cleaned.length === 6;
}

/**
 * Obtém nome da UF pelo código
 */
export function getUFName(code: string): string | undefined {
    return UF_NAMES[code.padStart(2, '0')];
}

/**
 * Obtém nome do Conselho Profissional pelo código
 */
export function getConselhoProfissionalName(code: string): string | undefined {
    return CONSELHO_PROFISSIONAL_NAMES[code.padStart(2, '0')];
}

/**
 * Formata código TUSS para exibição (00.00.00.00)
 */
export function formatTUSSCode(code: string): string {
    const cleaned = code.replace(/\D/g, '');
    if (cleaned.length !== 8) return code;

    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4');
}

/**
 * Formata código CBOS para exibição (000-000)
 */
export function formatCBOSCode(code: string): string {
    const cleaned = code.replace(/\D/g, '');
    if (cleaned.length !== 6) return code;

    return cleaned.replace(/(\d{3})(\d{3})/, '$1-$2');
}
