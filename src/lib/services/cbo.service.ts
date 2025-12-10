/**
 * Serviço para acesso à Tabela 24 - CBO (Código Brasileiro de Ocupações)
 * Versão: 2025.11
 */

export interface CBOCode {
    term: string;
    startDate: string;
    endVig: string;
    endImpl: string;
}

export interface CBOTableMeta {
    version: string;
    updatedAt: string;
    source: string;
}

export interface CBOTable {
    meta: CBOTableMeta;
    cbo: Record<string, CBOCode>;
}

export interface CBOTableInfo {
    version: string;
    updatedAt: string;
    totalCodes: number;
    tableName: string;
}

export interface CBOSearchResult {
    codigo: string;
    item: CBOCode;
}

/**
 * Serviço singleton para gerenciar Tabela CBO
 */
export class CBOService {
    private static table: CBOTable | null = null;
    private static loading: Promise<void> | null = null;
    private static loadError: Error | null = null;

    /**
     * Inicializa a Tabela CBO
     */
    static async initialize(): Promise<void> {
        if (this.table) return;

        if (this.loading) {
            await this.loading;
            return;
        }

        this.loading = (async () => {
            try {
                const fileName = 'Tabela 24 - CBO.JSON';
                const response = await fetch(`/validaTISS/TabelaTUSS202511_1/${encodeURIComponent(fileName)}`);

                if (!response.ok) {
                    throw new Error(`Erro ao carregar Tabela CBO: HTTP ${response.status}`);
                }

                this.table = await response.json();
                const count = Object.keys(this.table.cbo).length;

                console.log(`✅ Tabela CBO ${this.table.meta.version} carregada: ${count} códigos`);
            } catch (error) {
                this.loadError = error instanceof Error ? error : new Error('Erro desconhecido');
                console.error('❌ Erro ao carregar Tabela CBO:', this.loadError);
                throw this.loadError;
            }
        })();

        await this.loading;
    }

    /**
     * Verifica se o serviço está pronto
     */
    static isReady(): boolean {
        return this.table !== null;
    }

    /**
     * Obtém erro de carregamento
     */
    static getLoadError(): Error | null {
        return this.loadError;
    }

    /**
     * Verifica se um código CBO é válido (existe e está vigente)
     */
    static isValidCBO(codigo: string): boolean {
        if (!this.table) {
            throw new Error('Tabela CBO não inicializada. Chame CBOService.initialize() primeiro.');
        }

        const cbo = this.table.cbo[codigo];
        // Código é válido se existe e não tem data de fim de vigência
        return cbo !== undefined && (!cbo.endVig || cbo.endVig.trim() === '');
    }

    /**
     * Obtém um código CBO pelo código
     */
    static getCBO(codigo: string): CBOCode | undefined {
        if (!this.table) {
            throw new Error('Tabela CBO não inicializada. Chame CBOService.initialize() primeiro.');
        }
        return this.table.cbo[codigo];
    }

    /**
     * Verifica se o código existe na tabela (mesmo que não esteja vigente)
     */
    static exists(codigo: string): boolean {
        if (!this.table) {
            throw new Error('Tabela CBO não inicializada. Chame CBOService.initialize() primeiro.');
        }
        return this.table.cbo[codigo] !== undefined;
    }

    /**
     * Busca códigos CBO por termo na descrição
     */
    static search(term: string, limit: number = 20): CBOSearchResult[] {
        if (!this.table) {
            throw new Error('Tabela CBO não inicializada. Chame CBOService.initialize() primeiro.');
        }

        const termLower = term.toLowerCase();
        const results: CBOSearchResult[] = [];

        for (const [codigo, item] of Object.entries(this.table.cbo)) {
            if (item.term.toLowerCase().includes(termLower)) {
                results.push({ codigo, item });
                if (results.length >= limit) break;
            }
        }

        return results;
    }

    /**
     * Retorna informações sobre a tabela carregada
     */
    static getTableInfo(): CBOTableInfo | null {
        if (!this.table) return null;

        return {
            version: this.table.meta.version,
            updatedAt: this.table.meta.updatedAt,
            totalCodes: Object.keys(this.table.cbo).length,
            tableName: 'Código Brasileiro de Ocupações (CBO)'
        };
    }

    /**
     * Valida formato de código CBO (6 dígitos)
     */
    static isValidFormat(codigo: string): boolean {
        return /^\d{6}$/.test(codigo);
    }

    /**
     * Reinicia o serviço (útil para testes)
     */
    static reset(): void {
        this.table = null;
        this.loading = null;
        this.loadError = null;
    }
}
