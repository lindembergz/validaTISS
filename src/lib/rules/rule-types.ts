import type { GuiaType, ValidationError } from '@/types/tiss';

/**
 * Contexto de validação passado para cada regra
 * Contém todos os dados necessários para validação
 */
export interface ValidationContext {
    /** Conteúdo XML original (limpo, sem BOM) */
    xmlContent: string;

    /** XML parseado como objeto JavaScript */
    parsedXml: any;

    /** Tipo de guia TISS detectado */
    guiaType: GuiaType;

    /** Metadados extraídos do XML */
    metadata?: Record<string, any>;

    /** Documento XSD schema (se disponível) */
    schemaDoc?: Document;
}

/**
 * Interface base que todas as regras de validação devem implementar
 */
export interface ValidationRule {
    /** Identificador único da regra */
    id: string;

    /** Nome legível da regra */
    name: string;

    /** Descrição do que a regra valida */
    description: string;

    /** Prioridade de execução (menor executa primeiro) */
    priority: number;

    /** Se a regra está habilitada */
    enabled: boolean;

    /**
     * Determina se a regra se aplica ao contexto atual
     * @param context Contexto de validação
     * @returns true se a regra deve ser executada
     */
    appliesTo(context: ValidationContext): boolean;

    /**
     * Executa a validação
     * @param context Contexto de validação
     * @returns Array de erros encontrados (vazio se válido)
     */
    validate(context: ValidationContext): Promise<ValidationError[]> | ValidationError[];
}

/**
 * Resultado da execução do motor de regras
 */
export interface RuleEngineResult {
    /** Erros encontrados (severity: 'error') */
    errors: ValidationError[];

    /** Avisos encontrados (severity: 'warning' ou 'info') */
    warnings: ValidationError[];

    /** IDs das regras que foram executadas */
    executedRules: string[];

    /** IDs das regras que foram puladas (não aplicáveis) */
    skippedRules: string[];

    /** Tempo total de execução em milissegundos */
    executionTime: number;
}

/**
 * Opções para execução do motor de regras
 */
export interface RuleEngineOptions {
    /** Se true, interrompe após o primeiro erro crítico */
    stopOnFirstError?: boolean;

    /** Tempo máximo de execução em ms (0 = sem limite) */
    timeoutMs?: number;

    /** Se true, executa regras em paralelo quando possível */
    parallel?: boolean;
}
