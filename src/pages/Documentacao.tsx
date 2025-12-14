import { motion } from 'framer-motion';
import {
    FileCheck,
    ShieldCheck,
    Stethoscope,
    CalendarClock,
    Files,
    AlertTriangle,
    CheckCircle2,
    BookOpen
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Documentacao() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 py-12 md:py-20">
                <div className="container max-w-5xl">

                    {/* Cabeçalho */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                            <BookOpen className="w-4 h-4" />
                            Documentação Oficial
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            Cobertura de <span className="gradient-text">Validação</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Entenda como o ValidaTISS protege seu faturamento. Confira abaixo todas as regras e verificações realizadas automaticamente em seus arquivos.
                        </p>
                    </motion.div>

                    {/* Seções de Validação */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* 1. Regras Clínicas e Assistenciais */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                                    <Stethoscope className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold">Regras Clínicas</h2>
                            </div>
                            <ul className="space-y-4">
                                <ListItem
                                    title="Sexo × Procedimento"
                                    desc="Bloqueia procedimentos incompatíveis com o sexo do beneficiário (ex: Procedimentos ginecológicos em homens)."
                                />
                                <ListItem
                                    title="Validação de CID-10"
                                    desc="Verifica se o CID informado existe, é válido (letra + números) e se a categoria é permitida."
                                />
                                <ListItem
                                    title="Idade × Procedimento"
                                    desc="Alerta sobre procedimentos incompatíveis com a faixa etária (ex: Neonatologia em adultos)."
                                />
                                <ListItem
                                    title="Diagnóstico Obrigatório"
                                    desc="Exige CID-10 ou Indicação Clínica em guias de Internação e SADT conforme regras da ANS."
                                />
                            </ul>
                        </motion.div>

                        {/* 2. Regras Administrativas e Prazos */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                                    <CalendarClock className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold">Prazos e Validades</h2>
                            </div>
                            <ul className="space-y-4">
                                <ListItem
                                    title="Autorização Vencida"
                                    desc="Calcula se a data de atendimento ultrapassou a validade da senha de autorização (padrão 60 dias)."
                                />
                                <ListItem
                                    title="Coerência Temporal"
                                    desc="Impede datas absurdas: Atendimento anterior à solicitação, óbito anterior à admissão, datas futuras."
                                />
                                <ListItem
                                    title="Carências Prováveis"
                                    desc="Alerta quando o atendimento ocorre muito próximo à data de início do contrato (possível carência)."
                                />
                                <ListItem
                                    title="Vigência de Tabelas"
                                    desc="Verifica a competência do arquivo contra a vigência das tabelas e versões TISS."
                                />
                            </ul>
                        </motion.div>

                        {/* 3. Qualidade de Dados e Tabelas */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold">Qualidade Cadastral</h2>
                            </div>
                            <ul className="space-y-4">
                                <ListItem
                                    title="Códigos TUSS (Tabela 22)"
                                    desc="Valida se os códigos de procedimentos existem na tabela TUSS vigente e se estão ativos."
                                />
                                <ListItem
                                    title="Cadastro de Profissionais"
                                    desc="Verifica preenchimento obrigatório de Conselho (CRM/CRO), número de registro, UF e CBO."
                                />
                                <ListItem
                                    title="Documentos (CPF/CNPJ/CNS)"
                                    desc="Validação matemática dos dígitos verificadores de todos os documentos presentes no arquivo."
                                />
                                <ListItem
                                    title="Tabelas de Domínio"
                                    desc="Valida códigos de UF, CBOS, Via de Acesso, Grau de Participação e outras tabelas de domínio ANS."
                                />
                            </ul>
                        </motion.div>

                        {/* 4. Validação Estrutural e de Lote */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                    <Files className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold">Estrutura e Lote</h2>
                            </div>
                            <ul className="space-y-4">
                                <ListItem
                                    title="Duplicidade de Guias"
                                    desc="Detecta e bloqueia guias com numeração duplicada dentro do mesmo lote de envio."
                                />
                                <ListItem
                                    title="Schema XSD 4.02.00"
                                    desc="Validação estrutural rigorosa contra os arquivos XSD oficiais da ANS para a versão 4.02.00."
                                />
                                <ListItem
                                    title="Limites de Lote"
                                    desc="Verifica quantidade máxima de guias por lote (limite de 100/300 conforme tipo) para evitar rejeição total."
                                />
                                <ListItem
                                    title="Codificação de Caracteres"
                                    desc="Garante que o arquivo está em ISO-8859-1 ou UTF-8 correto, evitando caracteres estranhos."
                                />
                            </ul>
                        </motion.div>

                    </div>

                    {/* FAQ / Dúvidas */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-16 bg-muted/30 rounded-2xl p-8 md:p-12 text-center"
                    >
                        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold mb-4">Por que validar antes de enviar?</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                            As operadoras utilizam "robôs" de validação similares a este. Se o seu arquivo tiver um único erro estrutural,
                            <strong>o lote inteiro pode ser rejeitado</strong>. Validar aqui garante que seu arquivo chegue "limpo"
                            para o processamento de contas médicas.
                        </p>
                        <Link to="/validar">
                            <Button size="xl" className="bg-primary hover:bg-primary/90">
                                <FileCheck className="w-5 h-5 mr-2" />
                                Validar Arquivo Agora
                            </Button>
                        </Link>
                    </motion.div>

                </div>
            </main>

            <Footer />
        </div>
    );
}

// Componente auxiliar para itens da lista
function ListItem({ title, desc }: { title: string, desc: string }) {
    return (
        <li className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-snug">{desc}</p>
            </div>
        </li>
    );
}
