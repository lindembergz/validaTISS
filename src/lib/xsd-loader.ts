import { DOMParser } from '@xmldom/xmldom';
import type { GuiaType } from '@/types/tiss';
import { getSchemaPath, getAllSchemaPaths } from './schema-config';

/**
 * Cache for loaded XSD schemas to avoid repeated file reads
 */
const schemaCache = new Map<string, Document>();

/**
 * Loads an XSD schema file and returns it as a DOM Document
 * 
 * @param schemaPath - Absolute path to the XSD schema file
 * @returns Promise that resolves to the parsed XSD Document
 */
export async function loadXSDSchema(schemaPath: string): Promise<Document> {
    // Check cache first
    if (schemaCache.has(schemaPath)) {
        return schemaCache.get(schemaPath)!;
    }

    try {
        // In a browser environment, we need to fetch the schema file
        // The schemas should be in the public folder or served statically
        const response = await fetch(schemaPath);

        if (!response.ok) {
            throw new Error(`Failed to load schema from ${schemaPath}: ${response.statusText}`);
        }

        const schemaContent = await response.text();
        const parser = new DOMParser();
        const schemaDoc = parser.parseFromString(schemaContent, 'text/xml');

        // Check for parsing errors
        const parserError = schemaDoc.getElementsByTagName('parsererror');
        if (parserError.length > 0) {
            throw new Error(`Error parsing XSD schema: ${parserError[0].textContent}`);
        }

        // Cache the parsed schema
        schemaCache.set(schemaPath, schemaDoc);
        return schemaDoc;
    } catch (error) {
        throw new Error(
            `Failed to load XSD schema from ${schemaPath}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Loads the appropriate XSD schema for a given GuiaType
 * 
 * @param guiaType - The type of TISS guide
 * @returns Promise that resolves to the parsed XSD Document
 */
export async function loadSchemaForGuiaType(guiaType: GuiaType): Promise<Document> {
    const schemaPath = getSchemaPath(guiaType);
    return loadXSDSchema(schemaPath);
}

/**
 * Preloads all required XSD schemas into cache
 * This can be called on application startup for better performance
 * 
 * @returns Promise that resolves when all schemas are loaded
 */
export async function preloadAllSchemas(): Promise<void> {
    const schemaPaths = getAllSchemaPaths();

    try {
        await Promise.all(schemaPaths.map((path) => loadXSDSchema(path)));
        console.log(`Successfully preloaded ${schemaPaths.length} XSD schemas`);
    } catch (error) {
        console.error('Error preloading XSD schemas:', error);
        throw error;
    }
}

/**
 * Clears the schema cache
 * Useful for testing or if schemas need to be reloaded
 */
export function clearSchemaCache(): void {
    schemaCache.clear();
}

/**
 * Gets the current size of the schema cache
 * 
 * @returns Number of schemas currently cached
 */
export function getSchemaCacheSize(): number {
    return schemaCache.size;
}

/**
 * Extracts XSD type definition from schema
 * 
 * @param schemaDoc - The XSD schema document
 * @param typeName - Name of the type to extract
 * @returns The type definition element or null if not found
 */
export function extractTypeDefinition(
    schemaDoc: Document,
    typeName: string
): Element | null {
    const types = schemaDoc.getElementsByTagName('xs:complexType');

    for (let i = 0; i < types.length; i++) {
        const type = types[i];
        if (type.getAttribute('name') === typeName) {
            return type as Element;
        }
    }

    // Try simpleType as well
    const simpleTypes = schemaDoc.getElementsByTagName('xs:simpleType');
    for (let i = 0; i < simpleTypes.length; i++) {
        const type = simpleTypes[i];
        if (type.getAttribute('name') === typeName) {
            return type as Element;
        }
    }

    return null;
}

/**
 * Extracts element definition from schema
 * 
 * @param schemaDoc - The XSD schema document
 * @param elementName - Name of the element to extract
 * @returns The element definition or null if not found
 */
export function extractElementDefinition(
    schemaDoc: Document,
    elementName: string
): Element | null {
    const elements = schemaDoc.getElementsByTagName('xs:element');

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.getAttribute('name') === elementName) {
            return element as Element;
        }
    }

    return null;
}
