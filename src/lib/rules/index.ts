/**
 * Motor de Regras TISS - Barrel Export
 * 
 * Exporta todos os componentes do motor de regras para fácil importação
 */

// Re-exportar tudo do registro global (já inclui auto-inicialização)
export * from './rule-registry';

// Re-exportar tipos adicionais se necessário
export type { ValidationRule, ValidationContext, RuleEngineResult, RuleEngineOptions } from './rule-types';
export { RuleEngine } from './rule-engine';
