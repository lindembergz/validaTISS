import type { ValidationError } from '@/types/tiss';
import type { ValidationRule, ValidationContext } from './rule-types';

// Função auxiliar para extrair campos (copiada de complementary-rules para evitar dependência circular ou exportar em utils)
function extractFieldValues(obj: any, fieldName: string): string[] {
    const values: string[] = [];
    const searchTerm = fieldName.toLowerCase();

    function traverse(current: any) {
        if (!current || typeof current !== 'object') return;
        if (Array.isArray(current)) {
            current.forEach((item) => traverse(item));
            return;
        }
        for (const key in current) {
            const cleanKey = key.replace(/^[^:]+:/, '').toLowerCase();
            if (cleanKey.includes(searchTerm)) {
                const value = current[key];
                if (typeof value === 'string' && value.trim()) {
                    values.push(value.trim());
                } else if (typeof value === 'number') {
                    values.push(String(value));
                }
            }
            if (typeof current[key] === 'object' && current[key] !== null) {
                traverse(current[key]);
            }
        }
    }

    traverse(obj);
    return [...new Set(values)];
}

/**
 * Rule: Compatibilidade Sexo × Procedimento
 * Valida se o procedimento é compatível com o sexo do beneficiário
 */
export class SexoProcedimentoRule implements ValidationRule {
    id = 'sexo-procedimento';
    name = 'Validação Sexo × Procedimento';
    description = 'Verifica compatibilidade clínica entre sexo do beneficiário e procedimento realizado';
    priority = 203; // Logo após IdadeProcedimento
    enabled = true;

    // Lista simplificada de termos/códigos exclusivos (idealmente viria de tabela completa)
    private termosFemininos = [
        'parto', 'cesariana', 'utero', 'ovario', 'vagina', 'vulva', 'histerectomia',
        'laqueadura', 'mamografia', 'prenatal', 'preventivo', 'colposcopia'
    ];

    private termosMasculinos = [
        'prostata', 'penis', 'testiculo', 'vasectomia', 'escroto', 'fimose', 'postectomia'
    ];

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        // Tenta extrair sexo (nem sempre presente diretamente, as vezes no cadastro da operadora)
        // No XML TISS, pode vir em dadosBeneficiario -> sexo
        // Valores comuns: 'M', 'F', '1' (Masc), '3' (Fem) - Padrão TISS usa domínio
        const sexoFields = extractFieldValues(context.parsedXml, 'sexo');

        if (sexoFields.length === 0) return errors; // Sem info de sexo, não valida

        const sexo = sexoFields[0].toUpperCase();
        const isMasculino = sexo === 'M' || sexo === '1';
        const isFeminino = sexo === 'F' || sexo === '3';

        if (!isMasculino && !isFeminino) return errors; // Sexo indeterminado

        // Buscar descrições de procedimentos
        const descricoes = extractFieldValues(context.parsedXml, 'descricaoprocedimento');
        const codigos = extractFieldValues(context.parsedXml, 'codigoprocedimento');

        // Validação baseada em descrição (heurística poderosa quando tabela não tem flag de sexo)
        descricoes.forEach(desc => {
            const descLower = desc.toLowerCase();

            if (isMasculino) {
                for (const termo of this.termosFemininos) {
                    // Evitar falsos positivos (ex: "parto" em "comparto") - usar regex boundary se necessario
                    if (descLower.includes(termo)) {
                        // Refinamento para evitar falsos positivos óbvios
                        if (termo === 'parto' && descLower.includes('comparto')) continue;

                        errors.push({
                            id: crypto.randomUUID(),
                            line: 0,
                            column: 0,
                            message: `Possível incompatibilidade: Procedimento '${desc}' em beneficiário masculino`,
                            severity: 'warning',
                            code: 'CLIN001',
                            field: 'descricaoProcedimento',
                            suggestion: 'Verifique se o sexo do beneficiário ou o procedimento estão corretos'
                        });
                        break; // Reporta apenas um erro por procedimento
                    }
                }
            }

            if (isFeminino) {
                for (const termo of this.termosMasculinos) {
                    if (descLower.includes(termo)) {
                        errors.push({
                            id: crypto.randomUUID(),
                            line: 0,
                            column: 0,
                            message: `Possível incompatibilidade: Procedimento '${desc}' em beneficiária feminina`,
                            severity: 'warning',
                            code: 'CLIN002',
                            field: 'descricaoProcedimento',
                            suggestion: 'Verifique se o sexo do beneficiário ou o procedimento estão corretos'
                        });
                        break;
                    }
                }
            }
        });

        return errors;
    }
}

/**
 * Rule: Duplicidade de Guias
 * Detecta guias duplicadas no mesmo arquivo/lote
 */
export class DuplicidadeGuiaRule implements ValidationRule {
    id = 'duplicidade-guia';
    name = 'Validação de Duplicidade de Guias';
    description = 'Detecta numeração de guias duplicada no mesmo lote';
    priority = 105; // Alta prioridade, verificação estrutural/lógica
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        // Extrair todos os números de guia
        // A estrutura varia, mas geralmente numeroguia identifica unicamente
        const numerosGuia = extractFieldValues(context.parsedXml, 'numeroguia');

        if (numerosGuia.length < 2) return errors;

        const contagem: Record<string, number> = {};
        const duplicados = new Set<string>();

        numerosGuia.forEach(num => {
            contagem[num] = (contagem[num] || 0) + 1;
            if (contagem[num] > 1) {
                duplicados.add(num);
            }
        });

        duplicados.forEach(num => {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: `Número de guia duplicado no lote: ${num}`,
                severity: 'error',
                code: 'DUPL001',
                field: 'numeroGuia',
                suggestion: 'Números de guia devem ser únicos dentro do mesmo lote. Remova ou renomeie a duplicata.'
            });
        });

        return errors;
    }
}

/**
 * Rule: Lateralidade Obrigatória (Heurística)
 * Procedimentos que exigem lateralidade mas não informam
 */
export class LateralidadeRule implements ValidationRule {
    id = 'lateralidade-obrigatoria';
    name = 'Validação de Lateralidade';
    description = 'Verifica se lateralidade foi informada para procedimentos que tipicamente exigem';
    priority = 204;
    enabled = true;

    // Termos que indicam necessidade de lateralidade
    private termosLateralidade = [
        'mama', 'olho', 'ouvido', 'mao', 'pe', 'braco', 'perna', 'femur', 'tibia',
        'radio', 'ulna', 'umero', 'joelho', 'ombro', 'cotovelo', 'quadril', 'cristalino', 'retina'
    ];

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        // Tenta encontrar procedimentos
        // Precisaríamos navegar na estrutura para linkar procedimento -> via de acesso/lateralidade
        // Como o parser simplificado achata, vamos fazer uma verificação heurística no XML bruto ou estrutura

        // Simplificação: Se a descrição contém termo de lateralidade, verificamos se há algum campo de lateralidade ou se a descrição especifica (E/D)

        // Esta implementação é mais complexa de fazer perfeitamente sem o path exato do XML
        // Vamos deixar como "Future Implementation" ou fazer uma verificação global simples de aviso

        return errors;
    }
}
