import type { ValidationError } from '@/types/tiss';
import type {
    ValidationRule,
    ValidationContext,
    RuleEngineResult,
    RuleEngineOptions
} from './rule-types';

/**
 * Motor de regras para validação customizada de XML TISS
 * 
 * Gerencia registro, ordenação e execução de regras de validação.
 * Permite extensibilidade através do registro dinâmico de regras.
 */
export class RuleEngine {
    private rules: Map<string, ValidationRule> = new Map();

    /**
     * Registra uma nova regra de validação
     * @param rule Regra a ser registrada
     * @throws Error se já existe uma regra com o mesmo ID
     */
    register(rule: ValidationRule): void {
        if (this.rules.has(rule.id)) {
            console.warn(`Regra com ID "${rule.id}" já existe. Substituindo...`);
        }
        this.rules.set(rule.id, rule);
    }

    /**
     * Remove uma regra do registro
     * @param ruleId ID da regra a ser removida
     * @returns true se a regra foi removida, false se não existia
     */
    unregister(ruleId: string): boolean {
        return this.rules.delete(ruleId);
    }

    /**
     * Obtém todas as regras registradas
     * @returns Array de regras ordenadas por prioridade
     */
    getAllRules(): ValidationRule[] {
        return Array.from(this.rules.values())
            .sort((a, b) => a.priority - b.priority);
    }

    /**
     * Obtém uma regra específica pelo ID
     * @param ruleId ID da regra
     * @returns Regra ou undefined se não encontrada
     */
    getRule(ruleId: string): ValidationRule | undefined {
        return this.rules.get(ruleId);
    }

    /**
     * Habilita ou desabilita uma regra
     * @param ruleId ID da regra
     * @param enabled Estado desejado
     */
    setRuleEnabled(ruleId: string, enabled: boolean): void {
        const rule = this.rules.get(ruleId);
        if (rule) {
            rule.enabled = enabled;
        }
    }

    /**
     * Executa todas as regras aplicáveis ao contexto
     * @param context Contexto de validação
     * @param options Opções de execução
     * @returns Resultado da execução com erros e metadados
     */
    async execute(
        context: ValidationContext,
        options: RuleEngineOptions = {}
    ): Promise<RuleEngineResult> {
        const startTime = performance.now();
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];
        const executedRules: string[] = [];
        const skippedRules: string[] = [];

        // Obter regras habilitadas e ordenadas por prioridade
        const enabledRules = this.getAllRules().filter(rule => rule.enabled);

        // Filtrar regras aplicáveis
        const applicableRules: ValidationRule[] = [];
        for (const rule of enabledRules) {
            try {
                if (rule.appliesTo(context)) {
                    applicableRules.push(rule);
                } else {
                    skippedRules.push(rule.id);
                }
            } catch (error) {
                console.error(`Erro ao verificar aplicabilidade da regra ${rule.id}:`, error);
                skippedRules.push(rule.id);
            }
        }

        // Executar regras
        if (options.parallel) {
            // Execução paralela
            const results = await Promise.allSettled(
                applicableRules.map(rule => this.executeRule(rule, context))
            );

            results.forEach((result, index) => {
                const rule = applicableRules[index];
                if (result.status === 'fulfilled') {
                    executedRules.push(rule.id);
                    this.categorizeErrors(result.value, errors, warnings);
                } else {
                    console.error(`Erro ao executar regra ${rule.id}:`, result.reason);
                    skippedRules.push(rule.id);
                }
            });
        } else {
            // Execução sequencial
            for (const rule of applicableRules) {
                try {
                    const ruleErrors = await this.executeRule(rule, context);
                    executedRules.push(rule.id);
                    this.categorizeErrors(ruleErrors, errors, warnings);

                    // Parar no primeiro erro se configurado
                    if (options.stopOnFirstError && errors.length > 0) {
                        break;
                    }

                    // Verificar timeout
                    if (options.timeoutMs && (performance.now() - startTime) > options.timeoutMs) {
                        console.warn(`Timeout atingido após ${options.timeoutMs}ms`);
                        break;
                    }
                } catch (error) {
                    console.error(`Erro ao executar regra ${rule.id}:`, error);
                    skippedRules.push(rule.id);
                }
            }
        }

        const executionTime = performance.now() - startTime;

        return {
            errors,
            warnings,
            executedRules,
            skippedRules,
            executionTime,
        };
    }

    /**
     * Executa regras específicas por ID
     * @param context Contexto de validação
     * @param ruleIds IDs das regras a executar
     * @param options Opções de execução
     * @returns Resultado da execução
     */
    async executeSpecific(
        context: ValidationContext,
        ruleIds: string[],
        options: RuleEngineOptions = {}
    ): Promise<RuleEngineResult> {
        const startTime = performance.now();
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];
        const executedRules: string[] = [];
        const skippedRules: string[] = [];

        // Obter regras solicitadas
        const rules = ruleIds
            .map(id => this.rules.get(id))
            .filter((rule): rule is ValidationRule => rule !== undefined && rule.enabled)
            .sort((a, b) => a.priority - b.priority);

        // Executar cada regra
        for (const rule of rules) {
            if (!rule.appliesTo(context)) {
                skippedRules.push(rule.id);
                continue;
            }

            try {
                const ruleErrors = await this.executeRule(rule, context);
                executedRules.push(rule.id);
                this.categorizeErrors(ruleErrors, errors, warnings);

                if (options.stopOnFirstError && errors.length > 0) {
                    break;
                }
            } catch (error) {
                console.error(`Erro ao executar regra ${rule.id}:`, error);
                skippedRules.push(rule.id);
            }
        }

        const executionTime = performance.now() - startTime;

        return {
            errors,
            warnings,
            executedRules,
            skippedRules,
            executionTime,
        };
    }

    /**
     * Executa uma regra individual
     * @param rule Regra a executar
     * @param context Contexto de validação
     * @returns Erros encontrados
     */
    private async executeRule(
        rule: ValidationRule,
        context: ValidationContext
    ): Promise<ValidationError[]> {
        const result = await rule.validate(context);
        return Array.isArray(result) ? result : [];
    }

    /**
     * Categoriza erros por severidade
     * @param ruleErrors Erros da regra
     * @param errors Array de erros críticos
     * @param warnings Array de avisos
     */
    private categorizeErrors(
        ruleErrors: ValidationError[],
        errors: ValidationError[],
        warnings: ValidationError[]
    ): void {
        for (const error of ruleErrors) {
            if (error.severity === 'error') {
                errors.push(error);
            } else {
                warnings.push(error);
            }
        }
    }

    /**
     * Retorna estatísticas sobre as regras registradas
     */
    getStats(): {
        total: number;
        enabled: number;
        disabled: number;
        byPriority: Map<number, number>;
    } {
        const rules = Array.from(this.rules.values());
        const byPriority = new Map<number, number>();

        rules.forEach(rule => {
            byPriority.set(rule.priority, (byPriority.get(rule.priority) || 0) + 1);
        });

        return {
            total: rules.length,
            enabled: rules.filter(r => r.enabled).length,
            disabled: rules.filter(r => !r.enabled).length,
            byPriority,
        };
    }
}
