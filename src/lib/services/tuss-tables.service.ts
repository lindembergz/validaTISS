/**
 * Serviço para acesso às Tabelas TUSS (Terminologia Unificada da Saúde Suplementar)
 * Versão: 202511
 * 
 * Suporta:
 * - Tabela 22: Procedimentos e Eventos em Saúde
 * - Tabela 20: Medicamentos
 */

export interface TussProcedure {
    description: string;
    vigente: boolean;
    startDate: string;
}

export interface TussMedication {
    description: string;
    vigente: boolean;
    principioAtivo?: string;
    apresentacao?: string;
    startDate: string;
}

export interface TussTableMeta {
    version: string;
    updatedAt: string;
    source: string;
}

export interface ProceduresTable {
    meta: TussTableMeta;
    procedures: Record<string, TussProcedure>;
}

export interface MedicationsTable {
    meta: TussTableMeta;
    medications: Record<string, TussMedication>;
}

export interface TableInfo {
    version: string;
    updatedAt: string;
    totalItems: number;
    tableName: string;
}

export interface SearchResult<T> {
    codigo: string;
    item: T;
}

/**
 * Serviço singleton para gerenciar tabelas TUSS
 */
export class TussTablesService {
    // Tabela 22 - Procedimentos
    private static proceduresTable: ProceduresTable | null = null;
    private static proceduresLoading: Promise<void> | null = null;
    private static proceduresError: Error | null = null;

    // Tabela 20 - Medicamentos
    private static medicationsTable: MedicationsTable | null = null;
    private static medicationsLoading: Promise<void> | null = null;
    private static medicationsError: Error | null = null;

    /**
     * Inicializa ambas as tabelas TUSS
     */
    static async initializeAll(): Promise<void> {
        await Promise.all([
            this.initializeProcedures(),
            this.initializeMedications()
        ]);
    }

    /**
     * Inicializa apenas a Tabela 22 (Procedimentos)
     */
    static async initializeProcedures(): Promise<void> {
        if (this.proceduresTable) return;

        if (this.proceduresLoading) {
            await this.proceduresLoading;
            return;
        }

        this.proceduresLoading = (async () => {
            try {
                const fileName = 'TUSS 22 - PROCEDIMENTOS.json';
                const response = await fetch(`/validaTISS/TabelaTUSS202511_1/${encodeURIComponent(fileName)}`);

                if (!response.ok) {
                    throw new Error(`Erro ao carregar Tabela 22: HTTP ${response.status}`);
                }

                this.proceduresTable = await response.json();
                const count = Object.keys(this.proceduresTable.procedures).length;

                console.log(`✅ Tabela TUSS 22 carregada: ${count} procedimentos`);
            } catch (error) {
                this.proceduresError = error instanceof Error ? error : new Error('Erro desconhecido');
                console.error('❌ Erro ao carregar Tabela TUSS 22:', this.proceduresError);
                throw this.proceduresError;
            }
        })();

        await this.proceduresLoading;
    }

    /**
     * Inicializa apenas a Tabela 20 (Medicamentos)
     */
    static async initializeMedications(): Promise<void> {
        if (this.medicationsTable) return;

        if (this.medicationsLoading) {
            await this.medicationsLoading;
            return;
        }

        this.medicationsLoading = (async () => {
            try {
                const fileName = 'TUSS 20 - MEDICAMENTOS.json';
                const response = await fetch(`/validaTISS/TabelaTUSS202511_1/${encodeURIComponent(fileName)}`);

                if (!response.ok) {
                    throw new Error(`Erro ao carregar Tabela 20: HTTP ${response.status}`);
                }

                this.medicationsTable = await response.json();
                const count = Object.keys(this.medicationsTable.medications).length;

                console.log(`✅ Tabela TUSS 20 carregada: ${count} medicamentos`);
            } catch (error) {
                this.medicationsError = error instanceof Error ? error : new Error('Erro desconhecido');
                console.error('❌ Erro ao carregar Tabela TUSS 20:', this.medicationsError);
                throw this.medicationsError;
            }
        })();

        await this.medicationsLoading;
    }

    // ============ PROCEDIMENTOS (Tabela 22) ============

    static isProceduresReady(): boolean {
        return this.proceduresTable !== null;
    }

    static getProceduresError(): Error | null {
        return this.proceduresError;
    }

    static isValidProcedure(codigo: string): boolean {
        if (!this.proceduresTable) {
            throw new Error('Tabela 22 não inicializada. Chame initializeProcedures() primeiro.');
        }
        const procedure = this.proceduresTable.procedures[codigo];
        return procedure !== undefined && procedure.vigente === true;
    }

    static getProcedure(codigo: string): TussProcedure | undefined {
        if (!this.proceduresTable) {
            throw new Error('Tabela 22 não inicializada. Chame initializeProcedures() primeiro.');
        }
        return this.proceduresTable.procedures[codigo];
    }

    static procedureExists(codigo: string): boolean {
        if (!this.proceduresTable) {
            throw new Error('Tabela 22 não inicializada. Chame initializeProcedures() primeiro.');
        }
        return this.proceduresTable.procedures[codigo] !== undefined;
    }

    static searchProcedures(term: string, limit: number = 20): SearchResult<TussProcedure>[] {
        if (!this.proceduresTable) {
            throw new Error('Tabela 22 não inicializada. Chame initializeProcedures() primeiro.');
        }

        const termLower = term.toLowerCase();
        const results: SearchResult<TussProcedure>[] = [];

        for (const [codigo, item] of Object.entries(this.proceduresTable.procedures)) {
            if (item.description.toLowerCase().includes(termLower)) {
                results.push({ codigo, item });
                if (results.length >= limit) break;
            }
        }

        return results;
    }

    static getProceduresInfo(): TableInfo | null {
        if (!this.proceduresTable) return null;

        return {
            version: this.proceduresTable.meta.version,
            updatedAt: this.proceduresTable.meta.updatedAt,
            totalItems: Object.keys(this.proceduresTable.procedures).length,
            tableName: 'Procedimentos e Eventos em Saúde'
        };
    }

    // ============ MEDICAMENTOS (Tabela 20) ============

    static isMedicationsReady(): boolean {
        return this.medicationsTable !== null;
    }

    static getMedicationsError(): Error | null {
        return this.medicationsError;
    }

    static isValidMedication(codigo: string): boolean {
        if (!this.medicationsTable) {
            throw new Error('Tabela 20 não inicializada. Chame  initializeMedications() primeiro.');
        }
        const medication = this.medicationsTable.medications[codigo];
        return medication !== undefined && medication.vigente === true;
    }

    static getMedication(codigo: string): TussMedication | undefined {
        if (!this.medicationsTable) {
            throw new Error('Tabela 20 não inicializada. Chame initializeMedications() primeiro.');
        }
        return this.medicationsTable.medications[codigo];
    }

    static medicationExists(codigo: string): boolean {
        if (!this.medicationsTable) {
            throw new Error('Tabela 20 não inicializada. Chame initializeMedications() primeiro.');
        }
        return this.medicationsTable.medications[codigo] !== undefined;
    }

    static searchMedications(term: string, limit: number = 20): SearchResult<TussMedication>[] {
        if (!this.medicationsTable) {
            throw new Error('Tabela 20 não inicializada. Chame initializeMedications() primeiro.');
        }

        const termLower = term.toLowerCase();
        const results: SearchResult<TussMedication>[] = [];

        for (const [codigo, item] of Object.entries(this.medicationsTable.medications)) {
            if (item.description.toLowerCase().includes(termLower)) {
                results.push({ codigo, item });
                if (results.length >= limit) break;
            }
        }

        return results;
    }

    static getMedicationsInfo(): TableInfo | null {
        if (!this.medicationsTable) return null;

        return {
            version: this.medicationsTable.meta.version,
            updatedAt: this.medicationsTable.meta.updatedAt,
            totalItems: Object.keys(this.medicationsTable.medications).length,
            tableName: 'Medicamentos'
        };
    }

    // ============ UTILITÁRIOS ============

    static isValidFormat(codigo: string): boolean {
        return /^\d{8}$/.test(codigo);
    }

    static reset(): void {
        this.proceduresTable = null;
        this.proceduresLoading = null;
        this.proceduresError = null;
        this.medicationsTable = null;
        this.medicationsLoading = null;
        this.medicationsError = null;
    }
}
