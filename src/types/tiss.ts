export type GuiaType =
  | 'tissGuiaSP_SADT'
  | 'tissGuiaConsulta'
  | 'tissGuiaHonorarioIndividual'
  | 'tissGuiaInternacao'
  | 'tissGuiaOdontologia'
  | 'tissLoteGuias'
  | 'unknown';

export type ValidationStatus = 'valid' | 'invalid' | 'warning' | 'pending';

export interface ValidationError {
  id: string;
  line: number;
  column: number;
  message: string;
  code?: string;
  severity: 'error' | 'warning' | 'info';
  field?: string;
  suggestion?: string;
}

export interface ValidationResult {
  id: string;
  fileName: string;
  fileSize: number;
  guiaType: GuiaType;
  status: ValidationStatus;
  errors: ValidationError[];
  warnings: ValidationError[];
  validatedAt: Date;
  processingTime: number;
  xmlContent?: string;
  metadata?: {
    registroANS?: string;
    numeroGuia?: string;
    dataEmissao?: string;
    beneficiario?: string;
    prestador?: string;
  };
}

export interface ValidationStats {
  totalValidations: number;
  validCount: number;
  invalidCount: number;
  warningCount: number;
  mostCommonErrors: { code: string; message: string; count: number }[];
  guiaTypeDistribution: { type: GuiaType; count: number }[];
}

export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  result?: ValidationResult;
  error?: string;
}

export const GUIA_TYPE_LABELS: Record<GuiaType, string> = {
  tissGuiaSP_SADT: 'Guia SP/SADT',
  tissGuiaConsulta: 'Guia de Consulta',
  tissGuiaHonorarioIndividual: 'Guia de Honorário Individual',
  tissGuiaInternacao: 'Guia de Internação',
  tissGuiaOdontologia: 'Guia Odontológica',
  tissLoteGuias: 'Lote de Guias',
  unknown: 'Tipo Desconhecido',
};

export const COMMON_GLOSA_CODES: Record<string, string> = {
  '99': 'Erro de preenchimento',
  '9999': 'Código inválido',
  '0001': 'Campo obrigatório não preenchido',
  '0002': 'Formato inválido',
  '0003': 'Código TUSS não encontrado',
  '0004': 'Número da guia inválido',
  '0005': 'Data inválida',
  '0006': 'Registro ANS inválido',
  '0007': 'CPF/CNPJ inválido',
  '0008': 'Beneficiário não encontrado',
};

// Re-export tipos de regras para conveniência
export type {
  ValidationRule,
  ValidationContext,
  RuleEngineResult,
  RuleEngineOptions,
} from '@/lib/rules/rule-types';

