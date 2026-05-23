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
      dot: 'bg-success',
      label: 'Online',
    },
    offline: {
      bg: 'bg-muted/10',
      text: 'text-muted-foreground',
      dot: 'bg-muted',
      label: 'Offline',
    },
    executing: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      dot: 'bg-warning',
      label: 'Executing',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2 rounded-md px-2 py-1', config.bg, className)}>
      <div className={cn('h-2 w-2 rounded-full animate-pulse', config.dot)} />
      <span className={cn('text-xs font-medium', config.text)}>
        {config.label}
      </span>
    </div>
  );
}
