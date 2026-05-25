import { cn } from '@/lib/utils';

interface SignalStrengthBarProps {
  confidence: number;
  className?: string;
  label?: string;
}

export function SignalStrengthBar({
  confidence,
  className,
  label = 'Signal strength',
}: SignalStrengthBarProps) {
  const percentage = Math.min(Math.max(confidence, 0), 100);
  
  const getColor = () => {
    if (percentage >= 75) return 'bg-success shadow-[0_0_12px_rgba(34,197,94,0.4)]';
    if (percentage >= 50) return 'bg-warning shadow-[0_0_12px_rgba(245,158,11,0.4)]';
    return 'bg-destructive shadow-[0_0_12px_rgba(239,68,68,0.4)]';
  };

  const getLabel = () => {
    if (percentage >= 75) return 'Strong';
    if (percentage >= 50) return 'Medium';
    return 'Weak';
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-bold text-foreground">{percentage}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#1e1e3a] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', getColor())}
          style={{ width: `${percentage}%`, animation: 'barFill 1s ease-out' }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{getLabel()} signal</span>
    </div>
  );
}
