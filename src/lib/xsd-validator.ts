import { DOMParser } from '@xmldom/xmldom';
import type { GuiaType, ValidationError } from '@/types/tiss';
import { loadSchemaForGuiaType } from './xsd-loader';
import { DEFAULT_XSD_OPTIONS, GUIA_TYPE_ROOT_ELEMENTS, type XSDValidationOptions } from './schema-config';

/**
 * XSD namespace constants
 */
const XS_NAMESPACE = 'http://www.w3.org/2001/XMLSchema';
const TISS_NAMESPACE = 'http://www.ans.gov.br/padroes/tiss/schemas';

/**
 * Helper to check if an element is required
 */
function isElementRequired(element: Element): boolean {
    const minOccurs = element.getAttribute('minOccurs');
    return minOccurs === null || minOccurs === '1' || parseInt(minOccurs) > 0;
}

/**
 * Helper to get element type from XSD
 */
function getElementType(element: Element, schemaDoc: Document): string | null {
    const type = element.getAttribute('type');
    if (type) {
        return type.replace(/^ans:/, '').replace(/^xs:/, '');
    }

    // Check for inline type definition
    const complexType = element.getElementsByTagName('xs:complexType')[0];
    const simpleType = element.getElementsByTagName('xs:simpleType')[0];

    if (complexType || simpleType) {
        return 'inline';
    }

    return null;
}

/**
 * Validates XSD simple type constraints (patterns, enumerations, length, etc.)
 */
function validateSimpleType(
    value: string,
    typeElement: Element,
    fieldName: string
): ValidationError | null {
    // Check pattern restriction
    const patterns = typeElement.getElementsByTagName('xs:pattern');
    for (let i = 0; i < patterns.length; i++) {
        const patternValue = patterns[i].getAttribute('value');
        if (patternValue) {
            const regex = new RegExp(`^${patternValue}$`);
            if (!regex.test(value)) {
                return {
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Campo "${fieldName}" não corresponde ao padrão esperado: ${patternValue}`,
                    severity: 'error',
                    code: 'XSD001',
                    field: fieldName,
                    suggestion: `O valor deve seguir o padrão: ${patternValue}`,
                };
            }
        }
    }

    // Check enumeration restriction
    const enumerations = typeElement.getElementsByTagName('xs:enumeration');
    if (enumerations.length > 0) {
        const validValues: string[] = [];
        for (let i = 0; i < enumerations.length; i++) {
            const enumValue = enumerations[i].getAttribute('value');
            if (enumValue) {
                validValues.push(enumValue);
            }
        }

        if (validValues.length > 0 && !validValues.includes(value)) {
            return {
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: `Campo "${fieldName}" contém valor inválido: "${value}"`,
                severity: 'error',
                code: 'XSD002',
                field: fieldName,
                suggestion: `Valores permitidos: ${validValues.join(', ')}`,
            };
        }
    }

    // Check length restrictions
    const minLength = typeElement.getElementsByTagName('xs:minLength')[0];
    const maxLength = typeElement.getElementsByTagName('xs:maxLength')[0];
    const length = typeElement.getElementsByTagName('xs:length')[0];

    if (length) {
        const expectedLength = parseInt(length.getAttribute('value') || '0');
        if (value.length !== expectedLength) {
            return {
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: `Campo "${fieldName}" deve ter exatamente ${expectedLength} caracteres`,
                severity: 'error',
                code: 'XSD003',
                field: fieldName,
            };
        }
    }

    if (minLength) {
        const min = parseInt(minLength.getAttribute('value') || '0');
        if (value.length < min) {
            return {
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: `Campo "${fieldName}" deve ter no mínimo ${min} caracteres`,
                severity: 'error',
                code: 'XSD004',
                field: fieldName,
            };
        }
    }

    if (maxLength) {
        const max = parseInt(maxLength.getAttribute('value') || '0');
        if (value.length > max) {
            return {
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: `Campo "${fieldName}" deve ter no máximo ${max} caracteres`,
                severity: 'error',
                code: 'XSD005',
                field: fieldName,
            };
        }
    }

    return null;
}

/**
 * Finds a type definition in the schema or imported schemas
 */
function findTypeDefinition(
    typeName: string,
    schemaDoc: Document
): Element | null {
    // Remove namespace prefix
    const cleanTypeName = typeName.replace(/^ans:/, '').replace(/^xs:/, '');

    // Search in complexType elements
    const complexTypes = schemaDoc.getElementsByTagName('xs:complexType');
    for (let i = 0; i < complexTypes.length; i++) {
        if (complexTypes[i].getAttribute('name') === cleanTypeName) {
            return complexTypes[i] as Element;
        }
    }

    // Search in simpleType elements
    const simpleTypes = schemaDoc.getElementsByTagName('xs:simpleType');
    for (let i = 0; i < simpleTypes.length; i++) {
        if (simpleTypes[i].getAttribute('name') === cleanTypeName) {
            return simpleTypes[i] as Element;
        }
    }

    return null;
}

/**
 * Validates XML content against XSD schema
 * 
 * @param xmlContent - The XML content to validate
 * @param guiaType - The type of TISS guide
 * @param options - XSD validation options
 * @returns Array of validation errors
 */
export async function validateAgainstXSD(
    xmlContent: string,
    guiaType: GuiaType,
    options: XSDValidationOptions = {}
): Promise<ValidationError[]> {
    const opts = { ...DEFAULT_XSD_OPTIONS, ...options };
    const errors: ValidationError[] = [];

    // Skip if XSD validation is disabled
    if (!opts.enabled) {
        return errors;
    }

    // Skip for unknown guia types
    if (guiaType === 'unknown') {
        errors.push({
            id: crypto.randomUUID(),
            line: 1,
            column: 1,
            message: 'Tipo de guia desconhecido - validação XSD não realizada',
            severity: 'warning',
            code: 'XSD006',
        });
        return errors;
    }

    try {
        // Load the appropriate schema
        const schemaDoc = await loadSchemaForGuiaType(guiaType);

        // Parse the XML document
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

        // Check for parsing errors
        const parserErrors = xmlDoc.getElementsByTagName('parsererror');
        if (parserErrors.length > 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 1,
                column: 1,
                message: 'Erro ao analisar XML - validação XSD não pode ser realizada',
                severity: 'error',
                code: 'XSD007',
            });
            return errors;
        }

        // Get root elements for this guia type
        const rootElementNames = GUIA_TYPE_ROOT_ELEMENTS[guiaType];

        // Find the root element in the XML (considering namespace prefixes)
        let rootElement: Element | null = null;
        for (const elementName of rootElementNames) {
            // Try without namespace prefix first
            let elements = xmlDoc.getElementsByTagName(elementName);

            // If not found, try with common namespace prefixes
            if (elements.length === 0) {
                const prefixes = ['ans', 'tiss', '']; // Common TISS namespace prefixes
                for (const prefix of prefixes) {
                    const tagName = prefix ? `${prefix}:${elementName}` : elementName;
                    elements = xmlDoc.getElementsByTagName(tagName);
                    if (elements.length > 0) break;
                }
            }

            // Also try getElementsByTagNameNS with TISS namespace
            if (elements.length === 0) {
                elements = xmlDoc.getElementsByTagNameNS(TISS_NAMESPACE, elementName);
            }

            if (elements.length > 0) {
                rootElement = elements[0] as Element;
                break;
            }
        }

        if (!rootElement && rootElementNames.length > 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 1,
                column: 1,
                message: `Elemento raiz esperado não encontrado. Esperado: ${rootElementNames.join(' ou ')}`,
                severity: 'error',
                code: 'XSD008',
                suggestion: `Certifique-se de que o XML contém um dos elementos: ${rootElementNames.join(', ')}`,
            });
            return errors;
        }

        // Basic validation - check if main structure exists
        // For now, this is a simplified XSD validation
        // A full implementation would recursively validate all elements against the schema

        if (opts.includeWarnings) {
            errors.push({
                id: crypto.randomUUID(),
                line: 1,
                column: 1,
                message: 'Validação XSD simplificada realizada - validação completa em desenvolvimento',
                severity: 'info',
                code: 'XSD009',
            });
        }

    } catch (error) {
        errors.push({
            id: crypto.randomUUID(),
            line: 1,
            column: 1,
            message: `Erro ao validar contra XSD: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            severity: 'error',
            code: 'XSD010',
        });
    }

    // Limit the number of errors if specified
    return errors.slice(0, opts.maxErrors);
}

/**
 * Validates a specific field value against its XSD type definition
 * 
 * @param fieldName - Name of the field
 * @param fieldValue - Value to validate
 * @param typeName - XSD type name
 * @param schemaDoc - The XSD schema document
 * @returns Validation error if invalid, null otherwise
 */
export function validateFieldAgainstType(
    fieldName: string,
    fieldValue: string,
    typeName: string,
    schemaDoc: Document
): ValidationError | null {
    const typeDefinition = findTypeDefinition(typeName, schemaDoc);

    if (!typeDefinition) {
        return null; // Type not found, skip validation
    }

    // Check if it's a simple type with restrictions
    const restriction = typeDefinition.getElementsByTagName('xs:restriction')[0];
    if (restriction) {
        return validateSimpleType(fieldValue, restriction as Element, fieldName);
    }

    return null;
}
