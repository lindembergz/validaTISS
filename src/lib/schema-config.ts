import type { GuiaType } from '@/types/tiss';

/**
 * Mapping between TISS GuiaType and corresponding XSD schema files
 */
export const GUIA_TYPE_TO_SCHEMA: Record<GuiaType, string> = {
    tissGuiaSP_SADT: 'tissGuiasV4_02_00.xsd',
    tissGuiaConsulta: 'tissGuiasV4_02_00.xsd',
    tissGuiaHonorarioIndividual: 'tissGuiasV4_02_00.xsd',
    tissGuiaInternacao: 'tissGuiasV4_02_00.xsd',
    tissGuiaOdontologia: 'tissGuiasV4_02_00.xsd',
    tissLoteGuias: 'tissV4_02_00.xsd',
    unknown: 'tissV4_02_00.xsd', // Fallback to main schema
};

/**
 * Root elements for each GuiaType to help locate the correct schema element
 */
export const GUIA_TYPE_ROOT_ELEMENTS: Record<GuiaType, string[]> = {
    tissGuiaSP_SADT: ['guiaSP-SADT', 'guiaSPSADT'],
    tissGuiaConsulta: ['guiaConsulta'],
    tissGuiaHonorarioIndividual: ['guiaHonorarios', 'honorarioIndividual'],
    tissGuiaInternacao: ['guiaInternacao', 'solicitacaoInternacao'],
    tissGuiaOdontologia: ['guiaOdonto', 'guiaOdontologia'],
    tissLoteGuias: ['loteGuias', 'mensagemTISS'],
    unknown: [],
};

/**
 * Base path for XSD schemas (relative to public or src)
 * Uses Vite's BASE_URL to handle deployment with custom base paths
 */
export const SCHEMA_BASE_PATH = `${import.meta.env.BASE_URL}schemas`.replace(/\/+/g, '/');

/**
 * Additional schemas that may need to be loaded (imported by main schemas)
 */
export const REQUIRED_SCHEMAS = [
    'tissV4_02_00.xsd',
    'tissGuiasV4_02_00.xsd',
    'tissSimpleTypesV4_02_00.xsd',
    'tissComplexTypesV4_02_00.xsd',
    'xmldsig-core-schema.xsd',
];

/**
 * XSD validation options
 */
export interface XSDValidationOptions {
    /**
     * Whether to validate against XSD schema
     * @default true
     */
    enabled?: boolean;

    /**
     * Whether to include warnings from XSD validation
     * @default true
     */
    includeWarnings?: boolean;

    /**
     * Maximum number of errors to report (performance optimization)
     * @default 50
     */
    maxErrors?: number;

    /**
     * Whether to perform deep validation (slower but more thorough)
     * @default false
     */
    deepValidation?: boolean;
}

/**
 * Default XSD validation options
 */
export const DEFAULT_XSD_OPTIONS: Required<XSDValidationOptions> = {
    enabled: true,
    includeWarnings: true,
    maxErrors: 50,
    deepValidation: false,
};

/**
 * Get the schema file path for a given GuiaType
 */
export function getSchemaPath(guiaType: GuiaType): string {
    const schemaFile = GUIA_TYPE_TO_SCHEMA[guiaType];
    return `${SCHEMA_BASE_PATH}/${schemaFile}`;
}

/**
 * Get all schema paths that need to be loaded
 */
export function getAllSchemaPaths(): string[] {
    return REQUIRED_SCHEMAS.map((schema) => `${SCHEMA_BASE_PATH}/${schema}`);
}
