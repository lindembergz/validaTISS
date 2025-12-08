import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || <DefaultErrorFallback error={this.state.error} />;
        }

        return this.props.children;
    }
}

// Default fallback component with basic styling
function DefaultErrorFallback({ error }: { error?: Error }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            textAlign: 'center',
        }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                Algo deu errado
            </h1>
            <p style={{ color: '#666', marginBottom: '8px' }}>
                Ocorreu um erro inesperado na aplicação.
            </p>
            {error && (
                <details style={{ marginTop: '16px', textAlign: 'left' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: '500' }}>
                        Detalhes do erro
                    </summary>
                    <pre style={{
                        marginTop: '8px',
                        padding: '12px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        fontSize: '12px',
                        overflow: 'auto',
                        maxWidth: '600px',
                    }}>
                        {error.message}
                        {'\n\n'}
                        {error.stack}
                    </pre>
                </details>
            )}
            <button
                onClick={() => window.location.reload()}
                style={{
                    marginTop: '24px',
                    padding: '10px 20px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                }}
            >
                Recarregar página
            </button>
        </div>
    );
}
