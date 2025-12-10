import type { ValidationError } from '@/types/tiss';
import type { ValidationRule, ValidationContext } from './rule-types';

/**
 * Interface para representar um procedimento com valores
 */
interface ProcedimentoComValor {
    codigo: string;
    valorUnitario: number;
    quantidade: number;
    valorTotal: number;
}

/**
 * Extrai valores numéricos de campos
 */
function extractNumericValue(obj: any, fieldName: string): number | null {
    const values = extractFieldValues(obj, fieldName);
    if (values.length === 0) return null;

    const value = parseFloat(values[0].replace(',', '.'));
    return isNaN(value) ? null : value;
}

/**
 * Extrai todos os valores de um campo específico de um objeto aninhado
 */
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
 * Extrai procedimentos com valores do XML
 */
function extractProcedimentos(xml: any): ProcedimentoComValor[] {
    const procedimentos: ProcedimentoComValor[] = [];

    function traverse(current: any, path: string = '') {
        if (!current || typeof current !== 'object') return;

        if (Array.isArray(current)) {
            current.forEach((item, index) => traverse(item, `${path}[${index}]`));
            return;
        }

        // Procura por nós que representam procedimentos executados
        for (const key in current) {
            const cleanKey = key.replace(/^[^:]+:/, '').toLowerCase();
            const newPath = path ? `${path}.${cleanKey}` : cleanKey;

            // Identifica nó de procedimento EXECUTADO (mais específico)
            if (cleanKey === 'procedimentoexecutado' ||
                cleanKey === 'servicoexecutado' ||
                cleanKey === 'procedimentorealizado') {

                const node = current[key];

                // Se for array, processa cada item
                if (Array.isArray(node)) {
                    console.log(`[extractProcedimentos] Encontrado ARRAY de procedimentos: ${newPath} (${node.length} itens)`);
                    node.forEach((item, index) => {
                        if (typeof item === 'object' && item !== null) {
                            processarProcedimento(item, `${newPath}[${index}]`);
                        }
                    });
                }
                // Se for objeto único, processa diretamente
                else if (typeof node === 'object' && node !== null) {
                    console.log(`[extractProcedimentos] Encontrado procedimento único: ${newPath}`);
                    processarProcedimento(node, newPath);
                }
            }

            // Continua a busca em profundidade
            if (typeof current[key] === 'object' && current[key] !== null) {
                traverse(current[key], newPath);
            }
        }
    }

    // Função auxiliar para processar um procedimento individual
    function processarProcedimento(node: any, nodePath: string) {
        console.log(`[extractProcedimentos] Processando: ${nodePath}`);

        // Tenta extrair valores do procedimento
        const codigo = extractFieldValues(node, 'codigoprocedimento')[0] || '';

        const valorUnitStr = extractFieldValues(node, 'valorunitario')[0] ||
            extractFieldValues(node, 'valorprocedimento')[0];

        const quantidadeStr = extractFieldValues(node, 'quantidadeexecutada')[0] ||
            extractFieldValues(node, 'quantidade')[0];

        const valorTotalStr = extractFieldValues(node, 'valortotal')[0] ||
            extractFieldValues(node, 'valortotalprocedimento')[0];

        console.log(`[extractProcedimentos]   Código: ${codigo}`);
        console.log(`[extractProcedimentos]   Valor Unit: ${valorUnitStr}`);
        console.log(`[extractProcedimentos]   Quantidade: ${quantidadeStr}`);
        console.log(`[extractProcedimentos]   Valor Total: ${valorTotalStr}`);

        if (valorUnitStr && quantidadeStr && valorTotalStr) {
            const valorUnitario = parseFloat(valorUnitStr.replace(',', '.'));
            const quantidade = parseFloat(quantidadeStr.replace(',', '.'));
            const valorTotal = parseFloat(valorTotalStr.replace(',', '.'));

            if (!isNaN(valorUnitario) && !isNaN(quantidade) && !isNaN(valorTotal)) {
                console.log(`[extractProcedimentos]   ✅ Procedimento válido adicionado`);
                procedimentos.push({
                    codigo,
                    valorUnitario,
                    quantidade,
                    valorTotal
                });
            } else {
                console.log(`[extractProcedimentos]   ❌ Valores inválidos (NaN)`);
            }
        } else {
            console.log(`[extractProcedimentos]   ⚠️ Campos faltando`);
        }
    }

    traverse(xml);
    console.log(`[extractProcedimentos] Total de procedimentos extraídos: ${procedimentos.length}`);
    return procedimentos;
}

/**
 * Rule: Validação de Cálculo de Valores
 * Valida se os cálculos de valores estão corretos
 */
export class ValorCalculoRule implements ValidationRule {
    id = 'valor-calculo';
    name = 'Validação de Cálculo de Valores';
    description = 'Valida cálculos: valor unitário × quantidade = valor total';
    priority = 143;
    enabled = true;

    appliesTo(context: ValidationContext): boolean {
        // Aplica para guias individuais e lotes de guias
        return context.guiaType === 'tissGuiaSP_SADT' ||
            context.guiaType === 'tissGuiaConsulta' ||
            context.guiaType === 'tissGuiaOdontologia' ||
            context.guiaType === 'tissGuiaHonorarioIndividual' ||
            context.guiaType === 'tissLoteGuias'; // Também valida lotes
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        console.log('\n========== VALIDAÇÃO DE CÁLCULO DE VALORES ==========');

        // Extrair procedimentos com valores
        const procedimentos = extractProcedimentos(context.parsedXml);

        console.log(`[ValorCalculoRule] Procedimentos encontrados: ${procedimentos.length}`);

        let somaTotal = 0;

        for (const proc of procedimentos) {
            console.log(`[ValorCalculoRule] Validando: ${proc.codigo || 'sem código'}`);
            console.log(`  Valor Unit: R$ ${proc.valorUnitario.toFixed(2)}`);
            console.log(`  Quantidade: ${proc.quantidade}`);
            console.log(`  Valor Total: R$ ${proc.valorTotal.toFixed(2)}`);

            const calculado = proc.valorUnitario * proc.quantidade;
            const diferenca = Math.abs(calculado - proc.valorTotal);

            console.log(`  Calculado: R$ ${calculado.toFixed(2)}`);
            console.log(`  Diferença: R$ ${diferenca.toFixed(2)}`);

            // Tolerância de R$ 0,02 para arredondamento (mais flexível)
            if (diferenca > 0.02) {
                console.log(`  ❌ ERRO: Diferença maior que tolerância`);
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Valor total inconsistente${proc.codigo ? ` (${proc.codigo})` : ''}: ${proc.valorUnitario.toFixed(2)} × ${proc.quantidade} = ${calculado.toFixed(2)}, mas informado ${proc.valorTotal.toFixed(2)}`,
                    severity: 'error',
                    code: 'VAL007',
                    field: 'valorTotal',
                    suggestion: 'Recalcule: valor unitário × quantidade = valor total. Diferença encontrada: R$ ' + diferenca.toFixed(2),
                });
            } else {
                console.log(`  ✅ Cálculo correto`);
            }

            somaTotal += proc.valorTotal;
        }

        // Validar valor total da guia (se disponível)
        const valorTotalGuia = extractNumericValue(context.parsedXml, 'valortotalguia') ||
            extractNumericValue(context.parsedXml, 'valortotalgeral') ||
            extractNumericValue(context.parsedXml, 'valortotal');

        if (valorTotalGuia !== null && procedimentos.length > 0) {
            const diferencaTotal = Math.abs(somaTotal - valorTotalGuia);

            console.log(`\n[ValorCalculoRule] Soma procedimentos: R$ ${somaTotal.toFixed(2)}`);
            console.log(`[ValorCalculoRule] Valor total guia: R$ ${valorTotalGuia.toFixed(2)}`);
            console.log(`[ValorCalculoRule] Diferença: R$ ${diferencaTotal.toFixed(2)}`);

            // Tolerância de R$ 0,10 para soma total (mais flexível devido a múltiplos arredondamentos)
            if (diferencaTotal > 0.10) {
                console.log(`  ❌ ERRO: Soma total inconsistente`);
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Soma dos procedimentos (R$ ${somaTotal.toFixed(2)}) diferente do valor total da guia (R$ ${valorTotalGuia.toFixed(2)})`,
                    severity: 'error',
                    code: 'VAL008',
                    field: 'valorTotalGuia',
                    suggestion: 'Verifique se todos os procedimentos foram somados corretamente. Diferença: R$ ' + diferencaTotal.toFixed(2),
                });
            } else {
                console.log(`  ✅ Soma total correta`);
            }
        }

        console.log('====================================================\n');

        return errors;
    }
}
