/**
 * Funções auxiliares para validação de datas no padrão TISS
 * Formato esperado: AAAA-MM-DD (ISO 8601)
 */

/**
 * Valida se uma string está no formato de data TISS (AAAA-MM-DD)
 * e se representa uma data válida
 */
export function isValidTISSDate(dateStr: string): boolean {
    if (!dateStr) return false;

    // Verifica formato AAAA-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;

    // Valida se é uma data real (ex: não aceita 2025-13-01 ou 2025-02-30)
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return false;

    // Verifica se a data parseada corresponde aos valores originais
    // (evita casos como "2025-02-31" que seria convertido para "2025-03-03")
    const [year, month, day] = dateStr.split('-').map(Number);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 && // JavaScript months são 0-indexed
        date.getDate() === day
    );
}

/**
 * Verifica se uma data está no futuro (relativo à data atual)
 */
export function isDateInFuture(dateStr: string): boolean {
    if (!isValidTISSDate(dateStr)) return false;

    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera horas para comparar apenas dia

    return date > today;
}

/**
 * Verifica se uma data está no passado (relativo à data atual)
 */
export function isDateInPast(dateStr: string): boolean {
    if (!isValidTISSDate(dateStr)) return false;

    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date < today;
}

/**
 * Compara duas datas
 * @returns número negativo se date1 < date2, 0 se iguais, positivo se date1 > date2
 */
export function compareDates(date1: string, date2: string): number {
    if (!isValidTISSDate(date1) || !isValidTISSDate(date2)) {
        return NaN;
    }

    const d1 = new Date(date1 + 'T00:00:00');
    const d2 = new Date(date2 + 'T00:00:00');

    return d1.getTime() - d2.getTime();
}

/**
 * Verifica se date1 é anterior ou igual a date2
 */
export function isDateBeforeOrEqual(date1: string, date2: string): boolean {
    const comparison = compareDates(date1, date2);
    return !isNaN(comparison) && comparison <= 0;
}

/**
 * Verifica se date1 é posterior ou igual a date2
 */
export function isDateAfterOrEqual(date1: string, date2: string): boolean {
    const comparison = compareDates(date1, date2);
    return !isNaN(comparison) && comparison >= 0;
}

/**
 * Calcula a diferença em dias entre duas datas
 */
export function getDaysDifference(date1: string, date2: string): number {
    if (!isValidTISSDate(date1) || !isValidTISSDate(date2)) {
        return NaN;
    }

    const d1 = new Date(date1 + 'T00:00:00');
    const d2 = new Date(date2 + 'T00:00:00');

    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Formata uma data para exibição (DD/MM/AAAA)
 */
export function formatDateBR(dateStr: string): string {
    if (!isValidTISSDate(dateStr)) return dateStr;

    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Valida se uma string de hora está no formato HH:MM:SS
 */
export function isValidTISSTime(timeStr: string): boolean {
    if (!timeStr) return false;

    // Verifica formato HH:MM:SS
    const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return regex.test(timeStr);
}

/**
 * Valida ano (deve estar em um range razoável)
 */
export function isValidYear(year: number): boolean {
    const currentYear = new Date().getFullYear();
    // Aceita datas de 1900 até 10 anos no futuro
    return year >= 1900 && year <= currentYear + 10;
}
