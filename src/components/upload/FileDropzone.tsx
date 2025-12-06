import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/types/tiss';
import { formatFileSize } from '@/lib/xml-validator';

interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  uploads: FileUpload[];
  onRemoveFile: (id: string) => void;
  isProcessing: boolean;
}

export function FileDropzone({ 
  onFilesAccepted, 
  uploads, 
  onRemoveFile,
  isProcessing 
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const xmlFiles = acceptedFiles.filter(
      file => file.type === 'text/xml' || 
              file.type === 'application/xml' || 
              file.name.endsWith('.xml')
    );
    
    if (xmlFiles.length > 0) {
      onFilesAccepted(xmlFiles);
    }
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml'],
    },
    multiple: true,
    disabled: isProcessing,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const getStatusColor = (status: FileUpload['status']) => {
    switch (status) {
      case 'complete':
        return 'bg-success/10 border-success/30';
      case 'error':
        return 'bg-error-red-light border-error-red/30';
      case 'processing':
      case 'uploading':
        return 'bg-tiss-blue-light border-tiss-blue/30';
      default:
        return 'bg-muted border-border';
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
          "bg-gradient-to-b from-muted/50 to-background hover:from-tiss-blue-light hover:to-background",
          isDragActive && "bg-tiss-blue-light border-tiss-blue shadow-glow scale-[1.02]",
          isDragReject && "bg-error-red-light border-error-red",
          isProcessing && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={{ 
            y: isDragActive ? -5 : 0,
            scale: isDragActive ? 1.1 : 1,
          }}
          className="flex flex-col items-center text-center"
        >
          <div className={cn(
            "flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-colors",
            isDragActive ? "bg-tiss-blue text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isDragReject ? (
              <AlertCircle className="w-8 h-8" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          
          <h3 className="font-display font-semibold text-lg mb-2">
            {isProcessing 
              ? 'Processando arquivos...'
              : isDragActive 
                ? 'Solte os arquivos aqui' 
                : 'Arraste e solte seus arquivos XML'}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            {isDragReject 
              ? 'Apenas arquivos XML são aceitos'
              : 'Suporta guias SADT, consulta, internação, honorário e lotes'}
          </p>
          
          {!isProcessing && (
            <Button variant="outline" size="sm" className="pointer-events-none">
              <FileText className="w-4 h-4 mr-2" />
              Selecionar arquivos
            </Button>
          )}
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-tiss-blue/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-muted-foreground">
              Arquivos ({uploads.length})
            </h4>
            
            {uploads.map((upload) => (
              <motion.div
                key={upload.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  getStatusColor(upload.status)
                )}
              >
                <FileText className="w-5 h-5 text-tiss-blue shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{upload.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(upload.file.size)}
                    {upload.status === 'processing' && ' • Validando...'}
                    {upload.status === 'complete' && upload.result && (
                      <span className={cn(
                        "ml-2",
                        upload.result.status === 'valid' && "text-success",
                        upload.result.status === 'invalid' && "text-error-red",
                        upload.result.status === 'warning' && "text-warning"
                      )}>
                        • {upload.result.status === 'valid' ? 'Válido' : 
                           upload.result.status === 'invalid' ? 'Inválido' : 'Aviso'}
                      </span>
                    )}
                  </p>
                </div>

                {upload.status === 'processing' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-tiss-blue" />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => onRemoveFile(upload.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
