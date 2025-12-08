import { useState, useCallback } from 'react';
import { FileUpload, ValidationResult } from '@/types/tiss';
import { validateXML } from '@/lib/xml-validator';
import { toast } from 'sonner';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function useValidation() {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addFiles = useCallback((files: File[]) => {
    // Validate file size
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Arquivo ${file.name} excede 10MB`, {
          description: `Tamanho: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          duration: 5000,
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newUploads: FileUpload[] = validFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Show success message
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} arquivo(s) adicionado(s)`, {
        description: validFiles.length === 1 ? validFiles[0].name : undefined,
      });
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
    setResults(prev => prev.filter(r => r.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setUploads([]);
    setResults([]);
  }, []);

  const processFiles = useCallback(async () => {
    const pendingUploads = uploads.filter(u => u.status === 'pending');

    if (pendingUploads.length === 0) return;

    setIsProcessing(true);

    // ✅ Process files in parallel for better performance
    await Promise.all(
      pendingUploads.map(async (upload) => {
        // Update status to processing
        setUploads(prev =>
          prev.map(u =>
            u.id === upload.id
              ? { ...u, status: 'processing' as const, progress: 50 }
              : u
          )
        );

        try {
          // Read file content
          const content = await readFileContent(upload.file);

          // Validate XML
          const result = await validateXML(
            content,
            upload.file.name,
            upload.file.size
          );

          // Update with result
          setUploads(prev =>
            prev.map(u =>
              u.id === upload.id
                ? { ...u, status: 'complete' as const, progress: 100, result }
                : u
            )
          );

          setResults(prev => [...prev, result]);
        } catch (error) {
          setUploads(prev =>
            prev.map(u =>
              u.id === upload.id
                ? {
                  ...u,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Erro desconhecido'
                }
                : u
            )
          );
        }
      })
    );

    setIsProcessing(false);
  }, [uploads]);

  return {
    uploads,
    results,
    isProcessing,
    addFiles,
    removeFile,
    clearAll,
    processFiles,
  };
}

function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Falha ao ler o arquivo'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };

    reader.readAsText(file, 'UTF-8');
  });
}
