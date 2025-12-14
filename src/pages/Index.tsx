import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FileCheck,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileText,
  BarChart3,
  History,
  Building2,
  Users,
  Lock,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const features = [
  {
    icon: FileCheck,
    title: 'Validação Completa',
    description: 'Validação contra schemas XSD oficiais TISS 4.02.00 da ANS com detecção automática do tipo de guia.',
  },
  {
    icon: Zap,
    title: 'Processamento Rápido',
    description: 'Validação instantânea de arquivos XML com feedback em tempo real e relatórios detalhados.',
  },
  {
    icon: Shield,
    title: 'Conformidade ANS',
    description: 'Em total conformidade com o padrão TISS vigente a partir de maio/2025.',
  },
  /*{
    icon: BarChart3,
    title: 'Dashboard Analítico',
    description: 'Acompanhe estatísticas de validação, erros mais comuns e tendências.',
  },
 
  {
    icon: History,
    title: 'Histórico Completo',
    description: 'Acesse todas as suas validações anteriores com filtros e exportação.',
  }, */
  {
    icon: Lock,
    title: 'Seguro e Privado',
    description: 'Seus dados são processados com segurança e nunca armazenados sem sua permissão.',
  },
];

const guiaTypes = [
  { name: 'SP/SADT', color: 'bg-tiss-blue' },
  { name: 'Consulta', color: 'bg-accent' },
  { name: 'Honorário Individual', color: 'bg-success' },
  { name: 'Internação', color: 'bg-warning' },
  { name: 'Odontologia', color: 'bg-primary' },
  { name: 'Lote de Guias', color: 'bg-destructive' },
];

export default function Index() {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já fechou o alerta antes
    const alertClosed = localStorage.getItem('tissVersionAlertClosed_v2');
    if (!alertClosed) {
      setShowAlert(true);
    }
  }, []);

  const handleCloseAlert = () => {
    setShowAlert(false);
    localStorage.setItem('tissVersionAlertClosed_v2', 'true');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* TISS Version Alert Modal */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseAlert}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-blue-200 dark:border-blue-800"
            >
              <button
                onClick={handleCloseAlert}
                className="absolute top-4 right-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 border-4 border-green-500 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>

                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                  Versão <span className="text-blue-600 dark:text-blue-400">4.02.00</span> do padrão TISS implantado
                </h3>

                <p className="text-blue-800 dark:text-blue-200 mb-6 leading-relaxed">
                  Valide seus arquivos na nova versão do TISS. Em caso de dúvida ou sugestão, envie um email para{' '}
                  <a
                    href="mailto:cortezlindemberg@gmail.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    cortezlindemberg@gmail.com
                  </a>
                  .
                </p>

                <Button
                  onClick={handleCloseAlert}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg"
                >
                  FECHAR
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-1">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-50" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-tiss-blue/10 via-accent/5 to-transparent rounded-full blur-3xl" />

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tiss-blue-light border border-tiss-blue/20 text-tiss-blue text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Padrão TISS 4.02.00 | ANS
              </div>

              <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">
                Valide suas{' '}
                <span className="gradient-text">Guias TISS</span>
                {' '}em segundos
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
                Plataforma completa para validação de guias SADT, consulta, internação e mais.
                Em conformidade com o padrão TISS da ANS atualizado para 2025.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/validar">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    <FileText className="w-5 h-5 mr-2" />
                    Validar Agora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/documentacao">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    Ver Documentação
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              {/* <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-12 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>+10.000 validações</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="w-5 h-5 text-tiss-blue" />
                  <span>+200 operadoras</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-5 h-5 text-accent" />
                  <span>+500 usuários ativos</span>
                </div>
              </div>--*/}
            </motion.div>
          </div>
        </section>

        {/* Supported Guia Types 
        <section className="py-12 border-y border-border bg-muted/30">
          <div className="container">
            <p className="text-center text-sm text-muted-foreground mb-6">
              Suporte completo para todos os tipos de guia TISS
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {guiaTypes.map((type, index) => (
                <motion.div
                  key={type.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border"
                >
                  <div className={`w-2 h-2 rounded-full ${type.color}`} />
                  <span className="text-sm font-medium">{type.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>*/}

        {/* Destaque de Redução de Glosas */}
        <section className="py-16 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="p-8 md:p-12 rounded-3xl bg-card border border-green-500/20 shadow-xl">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                  <div className="text-center">
                    <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                      80%
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">de redução</p>
                  </div>
                  <div className="text-center md:text-left max-w-lg">
                    <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">
                      Reduza até <span className="text-green-500">80% das glosas</span>
                    </h3>
                    <p className="text-muted-foreground">
                      Previna erros de preenchimento, duplicidades, incompatibilidade clínica (sexo/procedimento),
                      códigos TUSS obsoletos e inconsistências estruturais.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Tudo que você precisa para{' '}
                <span className="gradient-text">validar guias</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Nossa plataforma combina tecnologia de ponta com as regras oficiais da ANS para blindar seu faturamento.
                Validamos cada detalhe do arquivo XML, desde a estrutura técnica até inconsistências clínicas sutis
                que costumam passar despercebidas.
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-muted-foreground">Validação Estrutural e Schema XSD Oficial (TISS 4.02.00)</span>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-muted-foreground">Auditoria de Qualidade de Dados (CPF, CNS, CNPJ, CBO)</span>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-muted-foreground">Análise de Regras de Negócio (Prazos, Duplicidades, Lotes)</span>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-muted-foreground">Inteligência Clínica (Sexo x Procedimento, CID-10, Idade)</span>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-muted-foreground">Validação de Tabelas de Domínio (TUSS, UF, Conselhos)</span>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-muted-foreground">Detecção de Erros Críticos de Glosa (Causas Principais)</span>
                </div>
              </div>
              <br></br>
              <h3 className="text-sm text-muted-foreground">
                🔒 Processamento 100% client-side (dados não são enviados a servidores)
              </h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative p-6 rounded-xl border border-border bg-card hover:bg-card/80 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-hero text-primary-foreground mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-hero text-primary-foreground">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Pronto para começar?
              </h2>
              <p className="text-lg opacity-90 mb-8">
                Comece a validar suas guias TISS gratuitamente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/validar">
                  <Button
                    size="xl"
                    className="w-full sm:w-auto bg-background text-foreground hover:bg-background/90"
                  >
                    Começar Gratuitamente
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                {/*<Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Ver Planos
                </Button>*/}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/*<Footer />*/}
    </div>
  );
}
