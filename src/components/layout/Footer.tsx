import { Link } from 'react-router-dom';
import { FileCheck, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground">
                <FileCheck className="h-4 w-4" />
              </div>
              <span className="font-display font-bold text-lg gradient-text">
                TISS Validator
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Validação de Guias TISS conforme padrão ANS 4.02.00.
              Simples, rápido e confiável.
            </p>
            <div className="flex gap-2">
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/validar" className="hover:text-foreground transition-colors">Validar XML</Link></li>
              <li><Link to="/documentacao" className="hover:text-foreground transition-colors">Documentação</Link></li>
              {/*<li><Link to="/historico" className="hover:text-foreground transition-colors">Histórico</Link></li>*/}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://www.gov.br/ans" target="_blank" rel="noopener" className="hover:text-foreground transition-colors">Portal ANS</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Padrão TISS</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Tabelas TUSS</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Termos</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 TISS Validator. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Em conformidade com o padrão TISS versão 4.02.00 da ANS
          </p>
        </div>
      </div>
    </footer>
  );
}
