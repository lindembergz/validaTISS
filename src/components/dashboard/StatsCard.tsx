import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'error';
  index?: number;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  variant = 'default',
  index = 0 
}: StatsCardProps) {
  const variantStyles = {
    default: {
      bg: 'bg-card',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    success: {
      bg: 'bg-success/5',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    warning: {
      bg: 'bg-warning/5',
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
    },
    error: {
      bg: 'bg-destructive/5',
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
    },
  };

  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow",
        styles.bg
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-display tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs. mês anterior
            </p>
          )}
        </div>
        
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl",
          styles.iconBg
        )}>
          <Icon className={cn("w-6 h-6", styles.iconColor)} />
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-primary/5 to-accent/5 blur-2xl" />
    </motion.div>
  );
}
