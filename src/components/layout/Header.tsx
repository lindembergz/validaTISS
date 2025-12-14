import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  FileCheck,
  LayoutDashboard,
  History,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Início', icon: Shield },
  { href: '/validar', label: 'Validar', icon: FileCheck },
  /*{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/historico', label: 'Histórico', icon: History },*/
];

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground shadow-md"
          >
            <FileCheck className="h-5 w-5" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg leading-none gradient-text">
              TISS Validator
            </span>
            <span className="text-[10px] text-muted-foreground leading-none">
              Padrão ANS 4.02.00
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'gap-2 transition-all',
                    isActive && 'bg-secondary text-secondary-foreground font-medium'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/*  <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm">
            Entrar
          </Button>
          <Button variant="hero" size="sm">
            Começar Grátis
          </Button>
        </div> */}

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-border bg-background p-4"
        >
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button variant="outline" className="flex-1">
                Entrar
              </Button>
              <Button variant="hero" className="flex-1">
                Começar Grátis
              </Button>
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  );
}
