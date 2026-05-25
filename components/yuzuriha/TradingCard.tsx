import { cn } from '@/lib/utils';

interface TradingCardProps {
  pair: string;
  type: 'buy' | 'sell';
  timeframe: string;
  confidence: number;
  price: number;
  volume?: number;
  className?: string;
  onClick?: () => void;
}

export function TradingCard({
  pair,
  type,
  timeframe,
  confidence,
  price,
  volume,
  className,
  onClick,
}: TradingCardProps) {
  const isBuy = type === 'buy';

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border p-4 cursor-pointer transition-all duration-300 card-hover-lift',
        isBuy
          ? 'border-[#22c55e]/15 hover:border-[#22c55e]/30'
          : 'border-[#ef4444]/15 hover:border-[#ef4444]/30',
        className
      )}
      style={{ background: isBuy ? 'rgba(34, 197, 94, 0.04)' : 'rgba(239, 68, 68, 0.04)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-mono font-bold text-lg">{pair}</div>
          <div className="text-xs text-muted-foreground">{timeframe}</div>
        </div>
        <div
          className={cn(
            'font-semibold text-sm px-2 py-1 rounded backdrop-blur-sm',
            isBuy ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
          )}
        >
          {type.toUpperCase()}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Price</span>
          <span className="font-mono font-semibold">${price.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Confidence</span>
          <span className="font-semibold">{confidence}%</span>
        </div>
        {volume && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Volume</span>
            <span className="font-mono text-xs">${(volume / 1e9).toFixed(1)}B</span>
          </div>
        )}
      </div>
    </div>
  );
}
