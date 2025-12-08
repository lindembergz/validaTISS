import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackProps {
    error?: Error;
    resetError?: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
    const handleReload = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-2xl border-destructive/20 shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-destructive/10 p-4">
                            <AlertTriangle className="w-12 h-12 text-destructive" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Algo deu errado</CardTitle>
                    <CardDescription>
                        Ocorreu um erro inesperado na aplicação. Tente recarregar a página ou voltar para a página inicial.
                    </CardDescription>
                </CardHeader>

                {error && (
                    <CardContent>
                        <details className="group">
                            <summary className="cursor-pointer font-medium text-sm hover:text-primary transition-colors list-none flex items-center gap-2">
                                <span className="group-open:rotate-90 transition-transform">▶</span>
                                Detalhes técnicos do erro
                            </summary>
                            <div className="mt-4 space-y-2">
                                <div className="p-3 rounded-lg bg-muted border border-border">
                                    <p className="text-sm font-semibold text-destructive mb-2">
                                        {error.name}: {error.message}
                                    </p>
                                    {error.stack && (
                                        <pre className="text-xs text-muted-foreground overflow-x-auto max-h-48 font-mono bg-background/50 p-2 rounded">
                                            {error.stack}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        </details>
                    </CardContent>
                )}

                <CardFooter className="flex gap-3 justify-center">
                    <Button
                        onClick={handleReload}
                        variant="default"
                        className="gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Recarregar Página
                    </Button>
                    <Button
                        onClick={handleGoHome}
                        variant="outline"
                        className="gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Ir para Início
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
