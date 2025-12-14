/**
 * Categorias de regras de validação TISS
 */
export enum RuleCategory {
    STRUCTURAL = 'structural',
    CADASTRAL = 'cadastral',
    TEMPORAL = 'temporal',
    TABULAR = 'tabular',
    RELATIONAL = 'relational',
    BUSINESS = 'business',
    CRITICAL = 'critical',
    COMPLEMENTARY = 'complementary',
    FINANCIAL = 'financial'
}

/**
 * Metadados de uma categoria de regras
 */
export interface CategoryMetadata {
    id: RuleCategory;
    name: string;
    description: string;
    icon: string;
    color: string;
    priority: number;
}

/**
 * Nível de impacto de glosa
 */
export type GlosaImpact = 'critical' | 'high' | 'medium' | 'low';

/**
 * Metadados completos de categorias
 */
export const CATEGORY_METADATA: Record<RuleCategory, CategoryMetadata> = {
    [RuleCategory.STRUCTURAL]: {
        id: RuleCategory.STRUCTURAL,
        name: 'Estruturais',
        description: 'Validações de estrutura XML e conformidade com XSD',
        icon: '🏗️',
        color: '#6366f1',
        priority: 1
    },
    [RuleCategory.CADASTRAL]: {
        id: RuleCategory.CADASTRAL,
        name: 'Cadastrais',
        description: 'Validações de documentos (CPF, CNPJ, CNS)',
        icon: '👤',
        color: '#8b5cf6',
        priority: 2
    },
    [RuleCategory.TEMPORAL]: {
        id: RuleCategory.TEMPORAL,
        name: 'Temporais',
        description: 'Validações de datas e lógica temporal',
        icon: '📅',
        color: '#ec4899',
        priority: 3
    },
    [RuleCategory.TABULAR]: {
        id: RuleCategory.TABULAR,
        name: 'Tabelares',
        description: 'Validações contra tabelas oficiais (TUSS, CBO, etc)',
        icon: '📊',
        color: '#f59e0b',
        priority: 4
    },
    [RuleCategory.RELATIONAL]: {
        id: RuleCategory.RELATIONAL,
        name: 'Relacionais',
        description: 'Validações de consistência entre dados relacionados',
        icon: '🔗',
        color: '#10b981',
        priority: 5
    },
    [RuleCategory.BUSINESS]: {
        id: RuleCategory.BUSINESS,
        name: 'Negócio',
        description: 'Regras específicas do setor de saúde',
        icon: '💼',
        color: '#06b6d4',
        priority: 6
    },
    [RuleCategory.CRITICAL]: {
        id: RuleCategory.CRITICAL,
        name: 'Críticas Anti-Glosa',
        description: 'Regras que previnem as causas mais comuns de glosa',
        icon: '⭐',
        color: '#ef4444',
        priority: 7
    },
    [RuleCategory.COMPLEMENTARY]: {
        id: RuleCategory.COMPLEMENTARY,
        name: 'Complementares Anti-Glosa',
        description: 'Regras adicionais de prevenção de glosa',
        icon: '🔸',
        color: '#f97316',
        priority: 8
    },
    [RuleCategory.FINANCIAL]: {
        id: RuleCategory.FINANCIAL,
        name: 'Financeiras',
        description: 'Validações de valores, cálculos e anexos obrigatórios',
        icon: '💰',
        color: '#84cc16',
        priority: 9
    }
};

/**
 * Obtém metadados de uma categoria
 */
export function getCategoryMetadata(category: RuleCategory): CategoryMetadata {
    return CATEGORY_METADATA[category];
}

/**
 * Obtém todas as categorias ordenadas por prioridade
 */
export function getAllCategories(): CategoryMetadata[] {
    return Object.values(CATEGORY_METADATA).sort((a, b) => a.priority - b.priority);
}

/**
 * Obtém nome formatado da categoria
 */
export function getCategoryName(category: RuleCategory): string {
    return CATEGORY_METADATA[category].name;
}

/**
 * Obtém ícone da categoria
 */
export function getCategoryIcon(category: RuleCategory): string {
    return CATEGORY_METADATA[category].icon;
}
