import { motion } from 'framer-motion';
import { 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const mockStats = {
  totalValidations: 1247,
  validCount: 892,
  invalidCount: 287,
  warningCount: 68,
};

const mockRecentValidations = [
  { id: '1', fileName: 'guia_sadt_001.xml', status: 'valid' as const, type: 'SP/SADT', date: '2 min atrás' },
  { id: '2', fileName: 'lote_janeiro_2025.xml', status: 'invalid' as const, type: 'Lote', date: '15 min atrás' },
  { id: '3', fileName: 'consulta_paciente.xml', status: 'warning' as const, type: 'Consulta', date: '1 hora atrás' },
  { id: '4', fileName: 'internacao_uti.xml', status: 'valid' as const, type: 'Internação', date: '2 horas atrás' },
  { id: '5', fileName: 'honorario_medico.xml', status: 'valid' as const, type: 'Honorário', date: '3 horas atrás' },
];

const mockCommonErrors = [
  { code: '0001', message: 'Campo obrigatório não preenchido', count: 156 },
  { code: '0003', message: 'Código TUSS não encontrado', count: 89 },
  { code: '0004', message: 'Número da guia inválido', count: 67 },
  { code: '0006', message: 'Registro ANS inválido', count: 45 },
  { code: '0002', message: 'Formato inválido', count: 32 },
];

export default function Dashboard() {
  const successRate = ((mockStats.validCount / mockStats.totalValidations) * 100).toFixed(1);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Acompanhe suas estatísticas de validação e tendências
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total de Validações"
              value={mockStats.totalValidations.toLocaleString()}
              description="Este mês"
              icon={FileCheck}
              trend={{ value: 12, isPositive: true }}
              index={0}
            />
            <StatsCard
              title="Guias Válidas"
              value={mockStats.validCount.toLocaleString()}
              description={`${successRate}% de sucesso`}
              icon={CheckCircle2}
              variant="success"
              index={1}
            />
            <StatsCard
              title="Guias Inválidas"
              value={mockStats.invalidCount.toLocaleString()}
              description="Necessitam correção"
              icon={XCircle}
              variant="error"
              index={2}
            />
            <StatsCard
              title="Avisos"
              value={mockStats.warningCount.toLocaleString()}
              description="Revisão recomendada"
              icon={AlertTriangle}
              variant="warning"
              index={3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Validations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-tiss-blue" />
                    Validações Recentes
                  </h2>
                  <a href="/historico" className="text-sm text-primary hover:underline">
                    Ver todas
                  </a>
                </div>

                <div className="space-y-3">
                  {mockRecentValidations.map((validation) => (
                    <div 
                      key={validation.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <FileText className="w-5 h-5 text-tiss-blue shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{validation.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {validation.type} • {validation.date}
                        </p>
                      </div>
                      <Badge 
                        variant="outline"
                        className={
                          validation.status === 'valid' 
                            ? 'bg-success/10 text-success border-success/20'
                            : validation.status === 'invalid'
                              ? 'bg-destructive/10 text-destructive border-destructive/20'
                              : 'bg-warning/10 text-warning border-warning/20'
                        }
                      >
                        {validation.status === 'valid' ? 'Válido' : 
                         validation.status === 'invalid' ? 'Inválido' : 'Aviso'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Common Errors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-destructive" />
                    Erros Mais Comuns
                  </h2>
                </div>

                <div className="space-y-3">
                  {mockCommonErrors.map((error, index) => (
                    <div 
                      key={error.code}
                      className="flex items-center gap-3"
                    >
                      <span className="text-sm font-mono text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {error.code}
                          </Badge>
                          <span className="text-sm truncate">{error.message}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-destructive/60 rounded-full transition-all"
                            style={{ width: `${(error.count / mockCommonErrors[0].count) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {error.count}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Usage Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Card className="p-6">
              <h2 className="font-display font-semibold text-lg mb-6">
                Validações por Dia
              </h2>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border border-dashed border-border">
                <p className="text-muted-foreground text-sm">
                  Gráfico de validações disponível no plano Pro
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
