import { RuleEngine } from './rule-engine';
import {
    RequiredFieldsRule,
    TISSNamespaceRule,
    UTF8EncodingRule,
    XMLDeclarationRule,
    UnknownGuiaTypeRule,
} from './built-in-rules';
import {
    CPFValidationRule,
    CNPJValidationRule,
    CNSValidationRule,
} from './business-rules';

/**
 * Instância global do motor de regras
 * Usada por todo o sistema de validação
 */
export const globalRuleEngine = new RuleEngine();

/**
 * Registra todas as regras built-in no motor global
 * Esta função é chamada automaticamente ao importar este módulo
 */
export function registerBuiltInRules(): void {
    // Regras básicas (Task 1)
    globalRuleEngine.register(new XMLDeclarationRule());
    globalRuleEngine.register(new UTF8EncodingRule());
    globalRuleEngine.register(new TISSNamespaceRule());
    globalRuleEngine.register(new UnknownGuiaTypeRule());
    globalRuleEngine.register(new RequiredFieldsRule());

    // Regras de validação de documentos (Task 2 - Fase 1)
    globalRuleEngine.register(new CPFValidationRule());
    globalRuleEngine.register(new CNPJValidationRule());
    globalRuleEngine.register(new CNSValidationRule());

    const stats = globalRuleEngine.getStats();
    console.log(`✓ ${stats.total} regras registradas (${stats.enabled} habilitadas)`);
}

// Auto-inicialização: registra regras ao importar o módulo
registerBuiltInRules();

/**
 * Re-exporta classes de regras para facilitar extensão
 */
export {
    RequiredFieldsRule,
    TISSNamespaceRule,
    UTF8EncodingRule,
    XMLDeclarationRule,
    UnknownGuiaTypeRule,
} from './built-in-rules';

export {
    CPFValidationRule,
    CNPJValidationRule,
    CNSValidationRule,
} from './business-rules';

/**
 * Re-exporta tipos principais
 */
export type {
    ValidationRule,
    ValidationContext,
    RuleEngineResult,
    RuleEngineOptions,
} from './rule-types';

export { RuleEngine } from './rule-engine';
