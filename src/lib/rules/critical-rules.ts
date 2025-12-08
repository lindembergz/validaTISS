import type { ValidationError } from '@/types/tiss';
import type { ValidationRule, ValidationContext } from './rule-types';

// Função auxiliar para extrair campos
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
 * Rule 1: Validação de versão TUSS
 * CRÍTICO: Códigos obsoletos são causa #1 de glosa
 */
export class TUSSVersionRule implements ValidationRule {
    id = 'tuss-version';
    name = 'Validação de Versão TUSS';
    description = 'Valida se código TUSS está na versão vigente';
    priority = 190;
    enabled = true;

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissGuiaSP_SADT' ||
            context.guiaType === 'tissGuiaConsulta';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const procedureCodes = extractFieldValues(context.parsedXml, 'codigoprocedimento');

        for (const code of procedureCodes) {
            // Validação básica de formato (8 dígitos)
            const cleaned = code.replace(/\D/g, '');
            if (cleaned.length !== 8) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Código TUSS inválido: ${code} (deve ter 8 dígitos)`,
                    severity: 'error',
                    code: 'TUSS001',
                    field: 'codigoProcedimento',
                    suggestion: 'Verifique se o código TUSS está completo e correto',
                });
            }
            // TODO: Validar contra tabela TUSS vigente (implementar quando houver tabela)
        }

        return errors;
    }
}

/**
 * Rule 2: Compatibilidade Tabela × Procedimento
 * CRÍTICO: Tabela errada = glosa imediata
 */
export class TabelaProcedimentoRule implements ValidationRule {
    id = 'tabela-procedimento';
    name = 'Compatibilidade Tabela × Procedimento';
    description = 'Valida se procedimento pertence à tabela declarada';
    priority = 191;
    enabled = true;

    private readonly tabelasValidas = ['20', '19', '22', '18', '00'];

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissGuiaSP_SADT' ||
            context.guiaType === 'tissGuiaConsulta';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const tabelas = extractFieldValues(context.parsedXml, 'codigotabela');

        for (const tabela of tabelas) {
            if (!this.tabelasValidas.includes(tabela)) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Código de tabela inválido: ${tabela}`,
                    severity: 'error',
                    code: 'TAB001',
                    field: 'codigoTabela',
                    suggestion: `Tabelas válidas: 20 (Procedimentos), 19 (Materiais/OPME), 22 (Própria), 18 (Medicamentos), 00 (Outras)`,
                });
            }
        }

        return errors;
    }
}

/**
 * Rule 3: CID-10 Obrigatório
 * CRÍTICO: CID faltando quando obrigatório = glosa automática
 */
export class CID10ObrigatorioRule implements ValidationRule {
    id = 'cid10-obrigatorio';
    name = 'CID-10 Obrigatório';
    description = 'Valida presença e formato de CID-10';
    priority = 192;
    enabled = true;

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissGuiaInternacao' ||
            context.guiaType === 'tissGuiaSP_SADT';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const cids = extractFieldValues(context.parsedXml, 'cid');
        const indicacaoClinica = extractFieldValues(context.parsedXml, 'indicacaoclinica');

        // CID-10 obrigatório para internação e SADT
        if (cids.length === 0 && indicacaoClinica.length === 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'CID-10 obrigatório não informado',
                severity: 'error',
                code: 'CID001',
                field: 'cid10',
                suggestion: 'Informe o CID-10 principal (formato: A00-Z99)',
            });
        }

        // Validar formato dos CIDs informados
        for (const cid of cids) {
            const regex = /^[A-Z]\d{2}(\.\d{1,2})?$/;
            if (!regex.test(cid)) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `CID-10 com formato inválido: ${cid}`,
                    severity: 'error',
                    code: 'CID002',
                    field: 'cid10',
                    suggestion: 'Formato esperado: A00 até Z99 (ex: I10, E11.9)',
                });
            }
        }

        return errors;
    }
}

/**
 * Rule 4: Quantidade Máxima de Procedimentos
 * CRÍTICO: Exceder limite = glosa parcial ou total
 */
export class QtdMaxProcedimentosRule implements ValidationRule {
    id = 'qtd-max-procedimentos';
    name = 'Quantidade Máxima de Procedimentos';
    description = 'Valida limites de procedimentos por guia';
    priority = 200;
    enabled = true;

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissGuiaSP_SADT' ||
            context.guiaType === 'tissGuiaInternacao';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const procedimentos = extractFieldValues(context.parsedXml, 'procedimentoexecutado');

        const limite = context.guiaType === 'tissGuiaSP_SADT' ? 30 : 100;
        const count = procedimentos.length;

        if (count > limite) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: `Quantidade de procedimentos (${count}) excede o limite de ${limite}`,
                severity: 'error',
                code: 'LIM001',
                field: 'procedimentoExecutado',
                suggestion: `Divida em múltiplas guias. Máximo permitido: ${limite} procedimentos`,
            });
        } else if (count > limite * 0.8) {
            // Alerta quando próximo ao limite (>80%)
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: `Atenção: ${count} procedimentos, próximo ao limite de ${limite}`,
                severity: 'warning',
                code: 'LIM002',
                field: 'procedimentoExecutado',
                suggestion: 'Considere dividir em múltiplas guias para evitar problemas',
            });
        }

        return errors;
    }
}

/**
 * Rule 5: Quantidade de Sessões
 * CRÍTICO: Sessões além do autorizado = glosa
 */
export class QuantidadeSessionRule implements ValidationRule {
    id = 'quantidade-sessao';
    name = 'Validação de Quantidade de Sessões';
    description = 'Valida quantidade de sessões autorizadas';
    priority = 201;
    enabled = true;

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissGuiaSP_SADT';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const quantidades = extractFieldValues(context.parsedXml, 'quantidadeexecutada');

        for (const qtdStr of quantidades) {
            const qtd = parseInt(qtdStr);

            if (isNaN(qtd) || qtd <= 0) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Quantidade executada inválida: ${qtdStr}`,
                    severity: 'error',
                    code: 'SESS001',
                    field: 'quantidadeExecutada',
                    suggestion: 'Quantidade deve ser número inteiro positivo',
                });
            }

            // Alertar sobre quantidades muito altas (possível erro)
            if (qtd > 100) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Quantidade muito alta: ${qtd} sessões`,
                    severity: 'warning',
                    code: 'SESS002',
                    field: 'quantidadeExecutada',
                    suggestion: 'Verifique se a quantidade está correta e dentro da autorização',
                });
            }
        }

        return errors;
    }
}

/**
 * Rule 6: Cobertura de Acomodação
 * CRÍTICO: Acomodação além do plano = glosa
 */
export class CoberturiaAcomodacaoRule implements ValidationRule {
    id = 'cobertura-acomodacao';
    name = 'Validação de Cobertura de Acomodação';
    description = 'Valida acomodação vs plano do beneficiário';
    priority = 210;
    enabled = true;

    private readonly tiposAcomodacao: Record<string, string> = {
        '1': 'Apartamento',
        '2': 'Enfermaria',
        '3': 'Berçário',
        '4': 'UTI - Adulto',
        '5': 'UTI - Pediátrica',
        '6': 'UTI - Neonatal',
    };

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissGuiaInternacao';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const acomodacoes = extractFieldValues(context.parsedXml, 'tipoacomodacao');

        for (const tipo of acomodacoes) {
            const descricao = this.tiposAcomodacao[tipo];

            if (!descricao) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Tipo de acomodação inválido: ${tipo}`,
                    severity: 'error',
                    code: 'COB001',
                    field: 'tipoAcomodacao',
                    suggestion: 'Valores válidos: 1 (Apartamento), 2 (Enfermaria), 3-6 (Berçário/UTI)',
                });
            }

            // Alertar sobre apartamento (pode gerar cobrança adicional)
            if (tipo === '1') {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: 'Acomodação em Apartamento - verificar cobertura do plano',
                    severity: 'warning',
                    code: 'COB002',
                    field: 'tipoAcomodacao',
                    suggestion: 'Confirme se o plano do beneficiário cobre apartamento',
                });
            }
        }

        return errors;
    }
}

/**
 * Rule 7: CNES Obrigatório
 * CRÍTICO: CNES faltando = glosa muito comum
 */
export class CNESObrigatorioRule implements ValidationRule {
    id = 'cnes-obrigatorio';
    name = 'CNES Obrigatório';
    description = 'Valida presença e formato do CNES';
    priority = 220;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const cnes = extractFieldValues(context.parsedXml, 'cnes');

        if (cnes.length === 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'CNES do prestador não informado',
                severity: 'error',
                code: 'CNES001',
                field: 'codigoCNES',
                suggestion: 'CNES (Cadastro Nacional de Estabelecimentos de Saúde) é obrigatório - 7 dígitos',
            });
        }

        for (const codigo of cnes) {
            const cleaned = codigo.replace(/\D/g, '');

            if (cleaned.length !== 7) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `CNES inválido: ${codigo} (deve ter 7 dígitos)`,
                    severity: 'error',
                    code: 'CNES002',
                    field: 'codigoCNES',
                    suggestion: 'Formato esperado: 7 dígitos numéricos',
                });
            }

            if (cleaned === '0000000') {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: 'CNES não pode ser 0000000',
                    severity: 'error',
                    code: 'CNES003',
                    field: 'codigoCNES',
                    suggestion: 'Informe o CNES real do estabelecimento',
                });
            }
        }

        return errors;
    }
}

/**
 * Rule 8: Dados Completos do Executante
 * CRÍTICO: Dados incompletos = glosa
 */
export class DadosExecutanteCompletoRule implements ValidationRule {
    id = 'dados-executante-completo';
    name = 'Dados Completos do Executante';
    description = 'Valida completude dos dados do profissional executante';
    priority = 221;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        // Verificar conselho profissional
        const conselhos = extractFieldValues(context.parsedXml, 'conselhoprofissional');
        if (conselhos.length === 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'Conselho profissional do executante não informado',
                severity: 'error',
                code: 'EXEC001',
                field: 'conselhoProfissional',
                suggestion: 'Informe o conselho (CRM, COREN, CRO, etc.)',
            });
        }

        // Verificar número do conselho
        const numerosConselho = extractFieldValues(context.parsedXml, 'numeroconselhoprofissional');
        if (numerosConselho.length === 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'Número do conselho profissional não informado',
                severity: 'error',
                code: 'EXEC002',
                field: 'numeroConselhoProfissional',
                suggestion: 'Informe o número de registro no conselho',
            });
        }

        // Verificar CBO
        const cbos = extractFieldValues(context.parsedXml, 'cbos');
        if (cbos.length === 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'CBO (Classificação Brasileira de Ocupações) não informado',
                severity: 'warning',
                code: 'EXEC003',
                field: 'CBOS',
                suggestion: 'CBO é recomendado para identificar a ocupação do profissional',
            });
        }

        return errors;
    }
}

/**
 * Rule 9: Dados Completos do Solicitante
 * CRÍTICO: Médico solicitante incompleto = glosa
 */
export class DadosSolicitanteCompletoRule implements ValidationRule {
    id = 'dados-solicitante-completo';
    name = 'Dados Completos do Solicitante';
    description = 'Valida completude dos dados do médico solicitante';
    priority = 222;
    enabled = true;

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissGuiaSP_SADT';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];

        // Nome do profissional solicitante
        const nomes = extractFieldValues(context.parsedXml, 'nomeprofissional');
        if (nomes.length === 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'Nome do profissional solicitante não informado',
                severity: 'error',
                code: 'SOL001',
                field: 'nomeProfissional',
                suggestion: 'Informe o nome completo do médico solicitante',
            });
        }

        // Conselho + número (geralmente CRM)
        const conselhos = extractFieldValues(context.parsedXml, 'conselhoprofissional');
        if (conselhos.length === 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'Conselho do solicitante não informado',
                severity: 'error',
                code: 'SOL002',
                field: 'conselhoProfissional',
                suggestion: 'Informe o conselho (geralmente CRM para médicos)',
            });
        }

        return errors;
    }
}
