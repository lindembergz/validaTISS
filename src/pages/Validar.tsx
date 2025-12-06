import { motion } from 'framer-motion';
import { FileCheck, Trash2, Play } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FileDropzone } from '@/components/upload/FileDropzone';
import { ValidationResultCard } from '@/components/validation/ValidationResultCard';
import { Button } from '@/components/ui/button';
import { useValidation } from '@/hooks/useValidation';

export default function Validar() {
  const { 
    uploads, 
    results, 
    isProcessing, 
    addFiles, 
    removeFile, 
    clearAll, 
    processFiles 
  } = useValidation();

  const pendingCount = uploads.filter(u => u.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-4xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-hero text-primary-foreground mb-4 shadow-lg">
              <FileCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Validar Guias TISS
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Faça upload dos seus arquivos XML para validação contra o padrão TISS 4.02.00 da ANS
            </p>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6"
          >
            <FileDropzone
              onFilesAccepted={addFiles}
              uploads={uploads}
              onRemoveFile={removeFile}
              isProcessing={isProcessing}
            />

            {/* Actions */}
            {uploads.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-border">
                <Button
                  variant="hero"
                  className="flex-1"
                  onClick={processFiles}
                  disabled={isProcessing || pendingCount === 0}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isProcessing 
                    ? 'Processando...' 
                    : `Validar ${pendingCount} arquivo${pendingCount !== 1 ? 's' : ''}`}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearAll}
                  disabled={isProcessing}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Tudo
                </Button>
              </div>
            )}
          </motion.div>

          {/* Results Section */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-semibold">
                  Resultados ({results.length})
                </h2>
                <div className="flex gap-4 text-sm">
                  <span className="text-success">
                    {results.filter(r => r.status === 'valid').length} válido(s)
                  </span>
                  <span className="text-destructive">
                    {results.filter(r => r.status === 'invalid').length} inválido(s)
                  </span>
                  <span className="text-warning">
                    {results.filter(r => r.status === 'warning').length} aviso(s)
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {results.map((result, index) => (
                  <ValidationResultCard
                    key={result.id}
                    result={result}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {uploads.length === 0 && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground mb-4">
                Arraste arquivos XML para começar a validação
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['SP/SADT', 'Consulta', 'Honorário', 'Internação', 'Lote'].map(tipo => (
                  <span 
                    key={tipo}
                    className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground"
                  >
                    {tipo}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
