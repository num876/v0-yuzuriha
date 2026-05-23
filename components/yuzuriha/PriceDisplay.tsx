import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  change24h: number;
  changePercent24h: number;
  className?: string;
  showChange?: boolean;
}

export function PriceDisplay({
  price,
  change24h,
  changePercent24h,
  className,
  showChange = true,
}: PriceDisplayProps) {
  const isPositive = changePercent24h >= 0;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="text-2xl font-bold text-foreground">
        ${price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 8,
        })}
      </div>
      {showChange && (
        <div className={cn('flex items-center gap-1 text-sm font-medium', isPositive ? 'text-success' : 'text-destructive')}>
          <span>{isPositive ? '+' : ''}{changePercent24h.toFixed(2)}%</span>
          <span className="text-xs text-muted-foreground">
            (${change24h > 0 ? '+' : ''}${Math.abs(change24h).toFixed(2)})
          </span>
        </div>
      )}
    </div>
  );
}
