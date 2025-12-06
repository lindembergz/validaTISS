import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  Lock
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
  {
    icon: BarChart3,
    title: 'Dashboard Analítico',
    description: 'Acompanhe estatísticas de validação, erros mais comuns e tendências.',
  },
  {
    icon: History,
    title: 'Histórico Completo',
    description: 'Acesse todas as suas validações anteriores com filtros e exportação.',
  },
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
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
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
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Ver Documentação
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-12 border-t border-border/50">
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
              </div>
            </motion.div>
          </div>
        </section>

        {/* Supported Guia Types */}
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
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Uma plataforma completa com validação em tempo real, relatórios detalhados 
                e conformidade total com o padrão TISS da ANS.
              </p>
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
                50 validações por mês no plano gratuito.
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
                <Button 
                  variant="outline" 
                  size="xl" 
                  className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Ver Planos
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
