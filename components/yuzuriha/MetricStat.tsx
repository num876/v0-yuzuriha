import { cn } from '@/lib/utils';

interface MetricStatProps {
  label: string;
  value: string | number;
  change?: number;
  isPositive?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function MetricStat({
  label,
  value,
  change,
  isPositive,
  className,
  icon,
}: MetricStatProps) {
  return (
    <div
      className={cn('flex flex-col gap-2 rounded-xl border border-[#1e1e3a]/50 p-3 transition-all duration-300 hover:border-[#8b5cf6]/20', className)}
      style={{ background: 'rgba(12, 12, 29, 0.9)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <div className="text-lg font-bold text-foreground" style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.15)' }}>{value}</div>
        {change !== undefined && (
          <div
            className={cn(
              'text-xs font-medium',
              isPositive ? 'text-success' : 'text-destructive'
            )}
          >
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </div>
        )}
      </div>
    </div>
  );
}
