import type { ValidationError } from '@/types/tiss';
import type { ValidationRule, ValidationContext } from './rule-types';

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
 * Mapeamento de procedimentos que exigem anexo obrigatório
 * Baseado nas tabelas TUSS e regras das operadoras
 */
interface ProcedimentoComAnexo {
    codigo: string;
    descricao: string;
    tipoAnexo: string;
}

/**
 * Rule: Anexo Obrigatório por Procedimento
 * Valida se anexos obrigatórios estão presentes conforme tipo de procedimento
 */
export class AnexoObrigatorioPorProcedimentoRule implements ValidationRule {
    id = 'anexo-obrigatorio-procedimento';
    name = 'Anexo Obrigatório por Procedimento';
    description = 'Valida anexos obrigatórios conforme tipo de procedimento';
    priority = 252;
    enabled = true;

    /**
     * Procedimentos que exigem anexo obrigatório
     * Fonte: Tabela TUSS 22 e regras comuns das operadoras
     */
    private procedimentosComAnexo: Map<string, ProcedimentoComAnexo> = new Map([
        // EXAMES DE IMAGEM - Tomografia
        ['20104030', { codigo: '20104030', descricao: 'Tomografia computadorizada', tipoAnexo: 'Laudo médico' }],
        ['20104049', { codigo: '20104049', descricao: 'Tomografia de crânio', tipoAnexo: 'Laudo médico' }],
        ['20104057', { codigo: '20104057', descricao: 'Tomografia de tórax', tipoAnexo: 'Laudo médico' }],
        ['20104065', { codigo: '20104065', descricao: 'Tomografia de abdome', tipoAnexo: 'Laudo médico' }],

        // EXAMES DE IMAGEM - Ressonância Magnética
        ['20104073', { codigo: '20104073', descricao: 'Ressonância magnética', tipoAnexo: 'Laudo médico' }],
        ['20104081', { codigo: '20104081', descricao: 'Ressonância de crânio', tipoAnexo: 'Laudo médico' }],
        ['20104090', { codigo: '20104090', descricao: 'Ressonância de coluna', tipoAnexo: 'Laudo médico' }],

        // MEDICINA NUCLEAR
        ['20201015', { codigo: '20201015', descricao: 'Cintilografia', tipoAnexo: 'Laudo médico' }],
        ['20201023', { codigo: '20201023', descricao: 'PET-CT', tipoAnexo: 'Laudo médico' }],

        // QUIMIOTERAPIA
        ['30601010', { codigo: '30601010', descricao: 'Quimioterapia paliativa - adulto', tipoAnexo: 'Protocolo de quimioterapia' }],
        ['30601028', { codigo: '30601028', descricao: 'Quimioterapia curativa - adulto', tipoAnexo: 'Protocolo de quimioterapia' }],
        ['30602017', { codigo: '30602017', descricao: 'Quimioterapia paliativa - criança', tipoAnexo: 'Protocolo de quimioterapia' }],
        ['30602025', { codigo: '30602025', descricao: 'Quimioterapia curativa - criança', tipoAnexo: 'Protocolo de quimioterapia' }],

        // RADIOTERAPIA
        ['30801012', { codigo: '30801012', descricao: 'Radioterapia', tipoAnexo: 'Planejamento radioterápico' }],
        ['30801020', { codigo: '30801020', descricao: 'Radioterapia conformacional', tipoAnexo: 'Planejamento radioterápico' }],

        // OPME - Órteses, Próteses e Materiais Especiais
        ['30701011', { codigo: '30701011', descricao: 'Prótese ortopédica', tipoAnexo: 'Relatório cirúrgico e nota fiscal' }],
        ['30702018', { codigo: '30702018', descricao: 'Prótese vascular', tipoAnexo: 'Relatório cirúrgico e nota fiscal' }],
        ['30703015', { codigo: '30703015', descricao: 'Prótese cardíaca', tipoAnexo: 'Relatório cirúrgico e nota fiscal' }],
        ['30704012', { codigo: '30704012', descricao: 'Marca-passo', tipoAnexo: 'Relatório cirúrgico e nota fiscal' }],
        ['30705019', { codigo: '30705019', descricao: 'Stent', tipoAnexo: 'Relatório do procedimento e nota fiscal' }],

        // PROCEDIMENTOS DE ALTA COMPLEXIDADE
        ['40301010', { codigo: '40301010', descricao: 'Cirurgia cardíaca', tipoAnexo: 'Relatório cirúrgico detalhado' }],
        ['40302017', { codigo: '40302017', descricao: 'Cirurgia neurológica', tipoAnexo: 'Relatório cirúrgico detalhado' }],
        ['40303014', { codigo: '40303014', descricao: 'Transplante', tipoAnexo: 'Relatório cirúrgico e documentação específica' }],

        // TERAPIAS ESPECIAIS
        ['31301010', { codigo: '31301010', descricao: 'Hemodiálise', tipoAnexo: 'Prescrição médica' }],
        ['31302017', { codigo: '31302017', descricao: 'Diálise peritoneal', tipoAnexo: 'Prescrição médica' }],
        ['31401011', { codigo: '31401011', descricao: 'Hemoterapia', tipoAnexo: 'Prescrição médica' }],

        // PROCEDIMENTOS ESTÉTICOS (geralmente não cobertos, mas quando autorizados exigem anexo)
        ['31501018', { codigo: '31501018', descricao: 'Cirurgia plástica reparadora', tipoAnexo: 'Relatório médico justificando necessidade' }],
    ]);

    /**
     * Prefixos de códigos que geralmente exigem anexo
     */
    private prefixosComAnexo: Map<string, string> = new Map([
        ['201', 'Exames de imagem - Laudo médico'],
        ['202', 'Medicina nuclear - Laudo médico'],
        ['306', 'Quimioterapia - Protocolo'],
        ['308', 'Radioterapia - Planejamento'],
        ['307', 'OPME - Relatório e nota fiscal'],
        ['403', 'Cirurgias de alta complexidade - Relatório cirúrgico'],
        ['313', 'Terapias especiais - Prescrição médica'],
    ]);

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissGuiaSP_SADT' ||
            context.guiaType === 'tissGuiaInternacao';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        console.log('\n========== VALIDAÇÃO DE ANEXOS OBRIGATÓRIOS ==========');

        const procedimentos = extractFieldValues(context.parsedXml, 'codigoprocedimento');
        const anexos = extractFieldValues(context.parsedXml, 'anexo');
        const conteudoAnexo = extractFieldValues(context.parsedXml, 'conteudoanexo');

        const temAnexo = anexos.length > 0 || conteudoAnexo.length > 0;

        console.log(`[AnexoObrigatorioPorProcedimentoRule] Procedimentos: ${procedimentos.length}`);
        console.log(`[AnexoObrigatorioPorProcedimentoRule] Anexos encontrados: ${temAnexo ? 'SIM' : 'NÃO'}`);

        for (const proc of procedimentos) {
            const procLimpo = proc.replace(/\D/g, ''); // Remove não-dígitos

            console.log(`[AnexoObrigatorioPorProcedimentoRule] Verificando: ${procLimpo}`);

            // Verifica se o código específico exige anexo
            const procedimentoInfo = this.procedimentosComAnexo.get(procLimpo);

            if (procedimentoInfo && !temAnexo) {
                console.log(`  ❌ ERRO: Procedimento exige anexo (código específico)`);
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Procedimento ${procLimpo} (${procedimentoInfo.descricao}) exige anexo obrigatório`,
                    severity: 'error',
                    code: 'ANEX002',
                    field: 'anexo',
                    suggestion: `Anexe: ${procedimentoInfo.tipoAnexo}`,
                });
                continue;
            }

            // Verifica se o prefixo do código exige anexo
            if (procLimpo.length >= 3) {
                const prefixo = procLimpo.substring(0, 3);
                const tipoAnexo = this.prefixosComAnexo.get(prefixo);

                if (tipoAnexo && !temAnexo) {
                    console.log(`  ⚠️ AVISO: Prefixo sugere necessidade de anexo`);
                    errors.push({
                        id: crypto.randomUUID(),
                        line: 0,
                        column: 0,
                        message: `Procedimento ${procLimpo} pode exigir anexo obrigatório`,
                        severity: 'warning',
                        code: 'ANEX003',
                        field: 'anexo',
                        suggestion: `Verifique se é necessário anexar: ${tipoAnexo}`,
                    });
                } else if (procedimentoInfo || tipoAnexo) {
                    console.log(`  ✅ Anexo presente`);
                }
            }
        }

        console.log('====================================================\n');

        return errors;
    }

    /**
     * Adiciona um novo procedimento que exige anexo
     * Útil para customização por operadora
     */
    adicionarProcedimento(codigo: string, descricao: string, tipoAnexo: string): void {
        this.procedimentosComAnexo.set(codigo, { codigo, descricao, tipoAnexo });
    }

    /**
     * Remove um procedimento da lista
     */
    removerProcedimento(codigo: string): void {
        this.procedimentosComAnexo.delete(codigo);
    }

    /**
     * Obtém informações sobre um procedimento
     */
    obterInfoProcedimento(codigo: string): ProcedimentoComAnexo | undefined {
        return this.procedimentosComAnexo.get(codigo);
    }
}
