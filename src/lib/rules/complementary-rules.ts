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
 * Rule 10: Idade × Procedimento
 * Valida compatibilidade idade do beneficiário com procedimento
 */
export class IdadeProcedimentoRule implements ValidationRule {
    id = 'idade-procedimento';
    name = 'Validação Idade × Procedimento';
    description = 'Alerta sobre possível incompatibilidade idade/procedimento';
    priority = 202;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const dataNascimento = extractFieldValues(context.parsedXml, 'datanascimento');

        if (dataNascimento.length > 0) {
            const idade = this.calcularIdade(dataNascimento[0]);

            if (idade !== null) {
                // Alertas básicos (não bloqueantes)
                if (idade < 0 || idade > 150) {
                    errors.push({
                        id: crypto.randomUUID(),
                        line: 0,
                        column: 0,
                        message: `Idade calculada suspeita: ${idade} anos`,
                        severity: 'warning',
                        code: 'AGE001',
                        field: 'dataNascimento',
                        suggestion: 'Verifique a data de nascimento do beneficiário',
                    });
                }
            }
        }

        return errors;
    }

    private calcularIdade(dataNasc: string): number | null {
        try {
            const [ano, mes, dia] = dataNasc.split('-').map(Number);
            const nascimento = new Date(ano, mes - 1, dia);
            const hoje = new Date();
            let idade = hoje.getFullYear() - nascimento.getFullYear();
            const m = hoje.getMonth() - nascimento.getMonth();
            if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
                idade--;
            }
            return idade;
        } catch {
            return null;
        }
    }
}

/**
 * Rule 11: Carência
 * Alerta sobre possível procedimento em carência
 */
export class CarenciaRule implements ValidationRule {
    id = 'carencia';
    name = 'Validação de Carência';
    description = 'Alerta sobre possíveis procedimentos em carência';
    priority = 211;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const dataContrato = extractFieldValues(context.parsedXml, 'datacontrato');
        const dataAtendimento = extractFieldValues(context.parsedXml, 'dataatendimento');

        if (dataContrato.length > 0 && dataAtendimento.length > 0) {
            const diasContrato = this.calcularDiasEntre(dataContrato[0], dataAtendimento[0]);

            if (diasContrato !== null && diasContrato < 30) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Atendimento realizado ${diasContrato} dias após contrato - possível carência`,
                    severity: 'warning',
                    code: 'CAR001',
                    field: 'dataAtendimento',
                    suggestion: 'Verifique carências: 30 dias (básica), 180 dias (partos), 300 dias (CPT)',
                });
            }
        }

        return errors;
    }

    private calcularDiasEntre(data1: string, data2: string): number | null {
        try {
            const d1 = new Date(data1);
            const d2 = new Date(data2);
            const diff = Math.abs(d2.getTime() - d1.getTime());
            return Math.ceil(diff / (1000 * 3600 * 24));
        } catch {
            return null;
        }
    }
}

/**
 * Rule 12: Limite de Lote
 * Valida limite de 300 guias por lote
 */
export class LimiteLoteRule implements ValidationRule {
    id = 'limite-lote';
    name = 'Limite de Guias por Lote';
    description = 'Valida máximo de 300 guias por lote';
    priority = 230;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const guias = extractFieldValues(context.parsedXml, 'numeroguia');

        const count = guias.length;

        if (count > 300) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: `Lote excede o limite: ${count} guias (máximo 300)`,
                severity: 'error',
                code: 'LOTE001',
                field: 'loteGuias',
                suggestion: 'Divida em múltiplos lotes de até 300 guias cada',
            });
        } else if (count > 250) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: `Atenção: ${count} guias, próximo ao limite de 300`,
                severity: 'warning',
                code: 'LOTE002',
                field: 'loteGuias',
                suggestion: 'Considere dividir o lote para evitar problemas',
            });
        }

        return errors;
    }
}

/**
 * Rule 13: Número de Lote Único
 * Valida formato do número do lote
 */
export class NumeroLoteUnicoRule implements ValidationRule {
    id = 'numero-lote-unico';
    name = 'Número de Lote Válido';
    description = 'Valida formato do número do lote';
    priority = 231;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const numeroLote = extractFieldValues(context.parsedXml, 'numerolote');

        if (numeroLote.length === 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'Número de lote não informado',
                severity: 'warning',
                code: 'LOTE003',
                field: 'numeroLote',
                suggestion: 'Informe número único para identificar o lote',
            });
        }

        for (const lote of numeroLote) {
            if (lote.trim().length < 3) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Número de lote muito curto: ${lote}`,
                    severity: 'warning',
                    code: 'LOTE004',
                    field: 'numeroLote',
                    suggestion: 'Use número significativo (mínimo 3 caracteres)',
                });
            }
        }

        return errors;
    }
}

/**
 * Rule 14: Senha de Autorização
 * Valida presença e formato da senha
 */
export class SenhaAutorizacaoRule implements ValidationRule {
    id = 'senha-autorizacao';
    name = 'Validação de Senha de Autorização';
    description = 'Valida senha de autorização quando necessária';
    priority = 240;
    enabled = true;

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissGuiaSP_SADT' ||
            context.guiaType === 'tissGuiaInternacao';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const senhas = extractFieldValues(context.parsedXml, 'senha');

        for (const senha of senhas) {
            if (senha.length < 6 || senha.length > 20) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Senha de autorização com comprimento inválido: ${senha.length} caracteres`,
                    severity: 'warning',
                    code: 'AUTH001',
                    field: 'senha',
                    suggestion: 'Senha geralmente tem entre 6 e 20 caracteres',
                });
            }
        }

        return errors;
    }
}

/**
 * Rule 15: Data de Autorização Vencida
 * Valida validade da autorização
 */
export class DataAutorizacaoVencidaRule implements ValidationRule {
    id = 'data-autorizacao-vencida';
    name = 'Validação de Validade da Autorização';
    description = 'Valida se autorização está vencida';
    priority = 241;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const datasAutorizacao = extractFieldValues(context.parsedXml, 'dataautorizacao');
        const datasAtendimento = extractFieldValues(context.parsedXml, 'dataatendimento');

        if (datasAutorizacao.length > 0 && datasAtendimento.length > 0) {
            const diasDiff = this.calcularDiasEntre(datasAutorizacao[0], datasAtendimento[0]);
            const VALIDADE_PADRAO = 60; // dias

            if (diasDiff !== null && diasDiff > VALIDADE_PADRAO) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: `Autorização possivelmente vencida: ${diasDiff} dias entre autorização e atendimento`,
                    severity: 'warning',
                    code: 'AUTH003',
                    field: 'dataAutorizacao',
                    suggestion: `Autorizações geralmente têm validade de ${VALIDADE_PADRAO} dias`,
                });
            }

            if (diasDiff !== null && diasDiff < 0) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: 'Data de autorização posterior ao atendimento',
                    severity: 'error',
                    code: 'AUTH004',
                    field: 'dataAutorizacao',
                    suggestion: 'Autorização deve ser anterior ao atendimento',
                });
            }
        }

        return errors;
    }

    private calcularDiasEntre(data1: string, data2: string): number | null {
        try {
            const d1 = new Date(data1);
            const d2 = new Date(data2);
            return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
        } catch {
            return null;
        }
    }
}

/**
 * Rule 16: Anexo Obrigatório  
 * Valida presença de anexos quando obrigatórios
 */
export class AnexoObrigatorioRule implements ValidationRule {
    id = 'anexo-obrigatorio';
    name = 'Anexo Obrigatório';
    description = 'Valida presença de anexos obrigatórios';
    priority = 250;
    enabled = true;

    appliesTo(context: ValidationContext): boolean {
        return context.guiaType === 'tissGuiaSP_SADT';
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const anexos = extractFieldValues(context.parsedXml, 'anexo');
        const procedimentos = extractFieldValues(context.parsedXml, 'codigoprocedimento');

        // Verificação básica de anexos
        if (procedimentos.length > 0 && anexos.length === 0) {
            errors.push({
                id: crypto.randomUUID(),
                line: 0,
                column: 0,
                message: 'Nenhum anexo encontrado - verifique se laudos são necessários',
                severity: 'warning',
                code: 'ANEX001',
                field: 'anexo',
                suggestion: 'Exames de imagem, OPME, quimio/radio requerem anexos obrigatórios',
            });
        }

        return errors;
    }
}

/**
 * Rule 17: Formato de Anexo
 * Valida formato básico dos anexos
 */
export class AnexoFormatoRule implements ValidationRule {
    id = 'anexo-formato';
    name = 'Validação de Formato de Anexo';
    description = 'Valida formato básico de anexos digitais';
    priority = 251;
    enabled = true;

    appliesTo(_context: ValidationContext): boolean {
        return true;
    }

    validate(context: ValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const anexos = extractFieldValues(context.parsedXml, 'conteudoanexo');

        for (const anexo of anexos) {
            // Verificar se parece ser Base64 (simplificado)
            if (anexo.length > 0 && anexo.length < 100) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: 'Anexo com tamanho suspeito (muito pequeno)',
                    severity: 'warning',
                    code: 'ANEX004',
                    field: 'conteudoAnexo',
                    suggestion: 'Verifique se o anexo foi codificado corretamente em Base64',
                });
            }

            // Verificar tamanho máximo (5MB em Base64 ≈ 6.8M caracteres)
            if (anexo.length > 7000000) {
                errors.push({
                    id: crypto.randomUUID(),
                    line: 0,
                    column: 0,
                    message: 'Anexo muito grande (> 5MB)',
                    severity: 'warning',
                    code: 'ANEX005',
                    field: 'conteudoAnexo',
                    suggestion: 'Considere comprimir ou reduzir qualidade. Limite geralmente 5MB',
                });
            }
        }

        return errors;
    }
}
