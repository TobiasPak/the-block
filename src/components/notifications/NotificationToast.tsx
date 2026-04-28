import { useEffect, useState } from 'react';
import { TrendingUp, Trophy, AlertCircle, Clock, Timer, Zap, Heart, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Notification, NotificationType } from '../../config/notifications';
import { TOAST_DURATION } from '../../config/notifications';
import { formatCurrency } from '../../utils/format';
import { useNotificationStore } from '../../store/useNotificationStore';
import { STRINGS } from '../../config/strings';

function ToastIcon({ type }: { type: NotificationType }): ReactNode {
  const cls = 'w-4 h-4 flex-shrink-0';
  switch (type) {
    case 'outbid':            return <TrendingUp  className={`${cls} text-status-rebuilt`} />;
    case 'auction_won':       return <Trophy      className={`${cls} text-brand`} />;
    case 'reserve_not_met':   return <AlertCircle className={`${cls} text-status-rebuilt`} />;
    case 'ending_1hr':
    case 'ending_30min':      return <Clock       className={`${cls} text-status-rebuilt`} />;
    case 'ending_10min':      return <Timer       className={`${cls} text-status-rebuilt`} />;
    case 'ending_5min':
    case 'ending_1min':       return <Zap         className={`${cls} text-status-salvage`} />;
    case 'liked_ending_soon':
    case 'liked_bid_started': return <Heart       className={`${cls} text-red-400`} />;
  }
}

interface NotificationToastProps {
  notification: Notification;
}

export function NotificationToast({ notification: n }: NotificationToastProps) {
  const { removeToast, openSidebar, setPendingNotificationId } = useNotificationStore();
  const [visible, setVisible] = useState(false);

  const duration = TOAST_DURATION[n.type] ?? 5000;

  useEffect(() => {
    // Trigger enter animation on next frame
    const enter = requestAnimationFrame(() => setVisible(true));
    const timer  = setTimeout(() => handleClose(), duration);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    setVisible(false);
    setTimeout(() => removeToast(n.id), 300);
  }

  function handleBidNow(e: React.MouseEvent) {
    e.stopPropagation();
    if (!n.quickBidAmount) return;
    // Open sidebar and pre-stage this notification's quick bid
    openSidebar();
    setPendingNotificationId(n.id);
    // Scroll to the notification after the sidebar has slid in
    setTimeout(() => {
      document.getElementById(`notification-${n.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
    handleClose();
  }

  return (
    <div
      className={`pointer-events-auto w-full bg-bg-surface border border-border-default rounded-xl shadow-dropdown overflow-hidden transition-all duration-300 ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      <div className="flex gap-3 px-4 py-3">
        {/* Icon */}
        <div className="pt-0.5">
          <ToastIcon type={n.type} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary leading-tight truncate">
            {n.vehicleName}
          </p>
          <p className="text-xs text-text-secondary mt-0.5 leading-snug">{n.message}</p>
          {n.quickBidAmount && (
            <button
              onClick={handleBidNow}
              className="mt-2 text-xs font-semibold bg-brand hover:bg-brand-hover active:opacity-70 text-text-inverse px-3 py-1.5 rounded-lg transition-colors"
            >
              {STRINGS.notifications.bidNow}
            </button>
          )}
        </div>

        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border-subtle">
        <div
          className="h-full bg-brand origin-left"
          style={{ animation: `toast-progress ${duration}ms linear forwards` }}
        />
      </div>
    </div>
  );
}
