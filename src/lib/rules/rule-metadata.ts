import type { GuiaType } from '@/types/tiss';
import type { RuleCategory, GlosaImpact } from './rule-categories';

/**
 * Exemplo de uso de uma regra
 */
export interface RuleExample {
    title: string;
    description: string;
    xmlSnippet?: string;
    errorMessage?: string;
    solution?: string;
}

/**
 * Metadados completos de uma regra de validação
 */
export interface RuleMetadata {
    /** ID único da regra */
    id: string;

    /** Categoria da regra */
    category: RuleCategory;

    /** Códigos de erro que esta regra pode gerar */
    errorCodes: string[];

    /** Nível de impacto de glosa */
    impactLevel: GlosaImpact;

    /** Tipos de guia aos quais a regra se aplica */
    applicableGuides: GuiaType[];

    /** Documentação detalhada da regra */
    documentation: string;

    /** Exemplos de uso */
    examples: RuleExample[];

    /** Tags para busca */
    tags: string[];

    /** Referências externas (ANS, legislação, etc) */
    references?: string[];
}

/**
 * Registro de metadados de todas as regras
 */
export const RULE_METADATA_REGISTRY: Map<string, RuleMetadata> = new Map();

/**
 * Registra metadados de uma regra
 */
export function registerRuleMetadata(metadata: RuleMetadata): void {
    RULE_METADATA_REGISTRY.set(metadata.id, metadata);
}

/**
 * Obtém metadados de uma regra
 */
export function getRuleMetadata(ruleId: string): RuleMetadata | undefined {
    return RULE_METADATA_REGISTRY.get(ruleId);
}

/**
 * Obtém todas as regras de uma categoria
 */
export function getRulesByCategory(category: RuleCategory): RuleMetadata[] {
    return Array.from(RULE_METADATA_REGISTRY.values())
        .filter(meta => meta.category === category);
}

/**
 * Obtém todas as regras por nível de impacto
 */
export function getRulesByImpact(impact: GlosaImpact): RuleMetadata[] {
    return Array.from(RULE_METADATA_REGISTRY.values())
        .filter(meta => meta.impactLevel === impact);
}

/**
 * Busca regras por tag
 */
export function searchRulesByTag(tag: string): RuleMetadata[] {
    return Array.from(RULE_METADATA_REGISTRY.values())
        .filter(meta => meta.tags.includes(tag.toLowerCase()));
}

/**
 * Obtém estatísticas de regras
 */
export function getRuleStatistics() {
    const allRules = Array.from(RULE_METADATA_REGISTRY.values());

    return {
        total: allRules.length,
        byCategory: Object.fromEntries(
            Object.values(RuleCategory).map(cat => [
                cat,
                allRules.filter(r => r.category === cat).length
            ])
        ),
        byImpact: {
            critical: allRules.filter(r => r.impactLevel === 'critical').length,
            high: allRules.filter(r => r.impactLevel === 'high').length,
            medium: allRules.filter(r => r.impactLevel === 'medium').length,
            low: allRules.filter(r => r.impactLevel === 'low').length
        }
    };
}
