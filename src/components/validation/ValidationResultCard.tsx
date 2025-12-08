import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  Download
} from 'lucide-react';
import { useState } from 'react';
import DOMPurify from 'dompurify';
import { ValidationResult, GUIA_TYPE_LABELS } from '@/types/tiss';
import { formatFileSize } from '@/lib/xml-validator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ValidationResultCardProps {
  result: ValidationResult;
  index: number;
}

export function ValidationResultCard({ result, index }: ValidationResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showXml, setShowXml] = useState(false);

  const statusConfig = {
    valid: {
      icon: CheckCircle2,
      label: 'VÁLIDO',
      className: 'bg-success/10 text-success border-success/20',
      iconClassName: 'text-success',
    },
    invalid: {
      icon: XCircle,
      label: 'INVÁLIDO',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      iconClassName: 'text-destructive',
    },
    warning: {
      icon: AlertTriangle,
      label: 'AVISO',
      className: 'bg-warning/10 text-warning border-warning/20',
      iconClassName: 'text-warning',
    },
    pending: {
      icon: Clock,
      label: 'PENDENTE',
      className: 'bg-muted text-muted-foreground border-border',
      iconClassName: 'text-muted-foreground',
    },
  };

  const config = statusConfig[result.status];
  const StatusIcon = config.icon;

  const copyToClipboard = () => {
    if (result.xmlContent) {
      navigator.clipboard.writeText(result.xmlContent);
      toast.success('XML copiado para a área de transferência');
    }
  };

  const downloadReport = () => {
    const report = {
      fileName: result.fileName,
      status: result.status,
      guiaType: GUIA_TYPE_LABELS[result.guiaType],
      validatedAt: result.validatedAt,
      errors: result.errors,
      warnings: result.warnings,
      metadata: result.metadata,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${result.fileName.replace('.xml', '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório baixado');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg",
          config.className
        )}>
          <StatusIcon className={cn("w-5 h-5", config.iconClassName)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm truncate">{result.fileName}</h3>
            <Badge variant="outline" className="text-xs shrink-0">
              {GUIA_TYPE_LABELS[result.guiaType]}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatFileSize(result.fileSize)}</span>
            <span>•</span>
            <span>{result.processingTime.toFixed(0)}ms</span>
            {result.errors.length > 0 && (
              <>
                <span>•</span>
                <span className="text-destructive">{result.errors.length} erro(s)</span>
              </>
            )}
            {result.warnings.length > 0 && (
              <>
                <span>•</span>
                <span className="text-warning">{result.warnings.length} aviso(s)</span>
              </>
            )}
          </div>
        </div>

        <Badge className={config.className}>
          {config.label}
        </Badge>

        <Button variant="ghost" size="icon" className="shrink-0">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-border"
        >
          {/* Metadata */}
          {result.metadata && Object.keys(result.metadata).some(k => result.metadata?.[k as keyof typeof result.metadata]) && (
            <div className="p-4 bg-muted/30">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
                Informações Extraídas
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {result.metadata.registroANS && (
                  <div>
                    <span className="text-xs text-muted-foreground">Registro ANS</span>
                    <p className="text-sm font-medium">{result.metadata.registroANS}</p>
                  </div>
                )}
                {result.metadata.numeroGuia && (
                  <div>
                    <span className="text-xs text-muted-foreground">Nº Guia</span>
                    <p className="text-sm font-medium">{result.metadata.numeroGuia}</p>
                  </div>
                )}
                {result.metadata.dataEmissao && (
                  <div>
                    <span className="text-xs text-muted-foreground">Data</span>
                    <p className="text-sm font-medium">{result.metadata.dataEmissao}</p>
                  </div>
                )}
                {result.metadata.beneficiario && (
                  <div>
                    <span className="text-xs text-muted-foreground">Beneficiário</span>
                    <p className="text-sm font-medium truncate">{result.metadata.beneficiario}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="p-4 border-t border-border">
              <h4 className="text-xs font-semibold uppercase text-destructive mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Erros ({result.errors.length})
              </h4>
              <div className="space-y-2">
                {result.errors.map((error) => (
                  <div
                    key={error.id}
                    className="p-3 rounded-lg bg-destructive/5 border border-destructive/10"
                  >
                    <div className="flex items-start gap-2">
                      <Badge variant="destructive" className="text-xs shrink-0">
                        {error.code || 'ERR'}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{error.message}</p>
                        {(error.line > 0 || error.field) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {error.line > 0 && `Linha ${error.line}`}
                            {error.line > 0 && error.column > 0 && `, Coluna ${error.column}`}
                            {error.field && ` • Campo: ${error.field}`}
                          </p>
                        )}
                        {error.suggestion && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            💡 {error.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="p-4 border-t border-border">
              <h4 className="text-xs font-semibold uppercase text-warning mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Avisos ({result.warnings.length})
              </h4>
              <div className="space-y-2">
                {result.warnings.map((warning) => (
                  <div
                    key={warning.id}
                    className="p-3 rounded-lg bg-warning/5 border border-warning/10"
                  >
                    <div className="flex items-start gap-2">
                      <Badge className="bg-warning/20 text-warning text-xs shrink-0">
                        {warning.code || 'WARN'}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{warning.message}</p>
                        {warning.suggestion && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            💡 {warning.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* XML Preview */}
          {result.xmlContent && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Conteúdo XML
                </h4>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowXml(!showXml)}>
                    {showXml ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
              </div>

              {showXml && (
                <pre className="p-4 rounded-lg bg-muted/50 border border-border overflow-x-auto text-xs font-mono max-h-64">
                  {DOMPurify.sanitize(result.xmlContent.substring(0, 5000))}
                  {result.xmlContent.length > 5000 && '\n... (truncado)'}
                </pre>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={downloadReport}>
              <Download className="w-4 h-4 mr-1" />
              Baixar Relatório
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
