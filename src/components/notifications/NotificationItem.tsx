import { TrendingUp, Trophy, AlertCircle, Clock, Timer, Zap, Heart, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Notification, NotificationType } from '../../config/notifications';
import { formatCurrency } from '../../utils/format';
import { useNotificationStore } from '../../store/useNotificationStore';
import { STRINGS } from '../../config/strings';

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000)        return 'just now';
  if (diff < 3_600_000)     return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)    return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function NotifIcon({ type }: { type: NotificationType }): ReactNode {
  const cls = 'w-4 h-4 flex-shrink-0';
  switch (type) {
    case 'outbid':            return <TrendingUp  className={`${cls} text-status-rebuilt`} />;
    case 'auction_won':       return <Trophy      className={`${cls} text-brand`} />;
    case 'reserve_not_met':   return <AlertCircle className={`${cls} text-status-rebuilt`} />;
    case 'ending_1hr':        return <Clock       className={`${cls} text-text-secondary`} />;
    case 'ending_30min':      return <Clock       className={`${cls} text-status-rebuilt`} />;
    case 'ending_10min':      return <Timer       className={`${cls} text-status-rebuilt`} />;
    case 'ending_5min':       return <Timer       className={`${cls} text-status-salvage`} />;
    case 'ending_1min':       return <Zap         className={`${cls} text-status-salvage`} />;
    case 'liked_ending_soon': return <Heart       className={`${cls} text-red-400`} />;
    case 'liked_bid_started': return <Heart       className={`${cls} text-red-400`} />;
  }
}

interface NotificationItemProps {
  notification: Notification;
  isPending: boolean;
  onHoverChange: (id: string | null) => void;
  onConfirmQuickBid: () => void;
}

export function NotificationItem({ notification: n, isPending, onHoverChange, onConfirmQuickBid }: NotificationItemProps) {
  const { markRead, dismiss } = useNotificationStore();

  function handleClick() {
    if (!n.read) markRead(n.id);
  }

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    dismiss(n.id);
  }

  function handleConfirm(e: React.MouseEvent) {
    e.stopPropagation();
    onConfirmQuickBid();
  }

  return (
    <div
      id={`notification-${n.id}`}
      onClick={handleClick}
      onMouseEnter={() => onHoverChange(n.id)}
      onMouseLeave={() => onHoverChange(null)}
      className={`relative flex gap-3 px-4 py-3 border-b border-border-subtle last:border-0 cursor-default transition-colors ${
        isPending
          ? 'bg-brand-subtle ring-1 ring-inset ring-brand/30'
          : !n.read
            ? 'bg-brand/5 border-l-2 border-l-brand hover:bg-bg-elevated'
            : 'hover:bg-bg-elevated'
      }`}
    >
      {/* Icon */}
      <div className="pt-0.5 flex-shrink-0">
        <NotifIcon type={n.type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-text-primary leading-tight truncate">
            {n.vehicleName}
            <span className="text-text-muted font-normal"> · {n.lot}</span>
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-text-muted whitespace-nowrap">
              {formatTimeAgo(n.timestamp)}
            </span>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss notification"
              className="w-5 h-5 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{n.message}</p>

        {/* Pending quick bid confirmation */}
        {isPending && n.quickBidAmount && (
          <div className="mt-2 flex items-center gap-2 bg-bg-surface border border-brand/30 rounded-lg px-3 py-2">
            <span className="text-xs text-brand font-semibold flex-1">
              {STRINGS.notifications.quickBid(formatCurrency(n.quickBidAmount))} ready
            </span>
            <kbd className="text-[10px] bg-bg-elevated border border-border-default rounded px-1.5 py-0.5 font-mono text-text-muted">2</kbd>
            <span className="text-xs text-text-muted">or</span>
            <button
              onClick={handleConfirm}
              className="px-2.5 py-1 rounded-lg bg-brand hover:bg-brand-hover active:opacity-70 text-text-inverse text-xs font-semibold transition-colors"
            >
              {STRINGS.bidding.confirmBid}
            </button>
          </div>
        )}

        {/* Hover hint: press 1 to stage quick bid */}
        {!isPending && n.quickBidAmount && (
          <p className="text-[10px] text-text-muted mt-1.5">
            Hover + <kbd className="font-mono bg-bg-elevated border border-border-default rounded px-1 py-0.5">1</kbd> to stage quick bid
          </p>
        )}
      </div>
    </div>
  );
}
