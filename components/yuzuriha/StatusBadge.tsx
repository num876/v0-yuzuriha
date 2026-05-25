import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'executing';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    online: {
      bg: 'bg-success/10',
      text: 'text-success',
      dot: 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]',
      pingDot: 'bg-success',
      label: 'Online',
      showPing: true,
    },
    offline: {
      bg: 'bg-muted/10',
      text: 'text-muted-foreground',
      dot: 'bg-muted',
      pingDot: 'bg-muted',
      label: 'Offline',
      showPing: false,
    },
    executing: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      dot: 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]',
      pingDot: 'bg-warning',
      label: 'Executing',
      showPing: true,
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2 rounded-md px-2 py-1', config.bg, className)}>
      <div className="relative h-2 w-2">
        {config.showPing && (
          <div className={cn('absolute inset-0 rounded-full animate-ping opacity-30', config.pingDot)} />
        )}
        <div className={cn('absolute inset-0 rounded-full', config.dot)} />
      </div>
      <span className={cn('text-xs font-medium', config.text)}>
        {config.label}
      </span>
    </div>
  );
}
