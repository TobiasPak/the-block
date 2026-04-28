import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useBidStore } from '../../store/useBidStore';
import { vehicles } from '../../data/vehicles';
import { NotificationItem } from './NotificationItem';
import { STRINGS } from '../../config/strings';

type Tab = 'all' | 'urgent' | 'bids' | 'watched';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all',     label: STRINGS.notifications.tabs.all },
  { id: 'urgent',  label: STRINGS.notifications.tabs.urgent },
  { id: 'bids',    label: STRINGS.notifications.tabs.bids },
  { id: 'watched', label: STRINGS.notifications.tabs.watched },
];

const BID_TYPES = new Set([
  'outbid', 'auction_won', 'reserve_not_met',
  'ending_1hr', 'ending_30min', 'ending_10min', 'ending_5min', 'ending_1min',
]);

const LIKED_TYPES = new Set(['liked_ending_soon', 'liked_bid_started']);

export function NotificationSidebar() {
  const {
    activeNotifications,
    isSidebarOpen,
    closeSidebar,
    unreadCount,
    markAllRead,
    clearAll,
    pendingNotificationId,
    setPendingNotificationId,
    markRead,
  } = useNotificationStore();

  const { placeBid } = useBidStore();

  const [tab, setTab] = useState<Tab>('all');

  // Track which notification the cursor is currently over (ref for stable keydown handler)
  const hoveredNotifRef  = useRef<string | null>(null);
  const pendingNotifRef  = useRef<string | null>(pendingNotificationId);
  const activeNotifsRef  = useRef(activeNotifications);
  const placeBidRef      = useRef(placeBid);
  const markReadRef      = useRef(markRead);
  const setPendingRef    = useRef(setPendingNotificationId);

  // Keep refs current every render
  pendingNotifRef.current  = pendingNotificationId;
  activeNotifsRef.current  = activeNotifications;
  placeBidRef.current      = placeBid;
  markReadRef.current      = markRead;
  setPendingRef.current    = setPendingNotificationId;

  const filtered = activeNotifications.filter((n) => {
    if (tab === 'urgent')  return n.urgent;
    if (tab === 'bids')    return BID_TYPES.has(n.type);
    if (tab === 'watched') return LIKED_TYPES.has(n.type);
    return true;
  });

  // Hover tracking — used by 1/2 key handler
  const handleHoverChange = useCallback((id: string | null) => {
    hoveredNotifRef.current = id;
  }, []);

  // Quick bid confirm — used by both the Confirm button and the 2 key
  const confirmQuickBid = useCallback((notifId: string) => {
    const notif = activeNotifsRef.current.find((n) => n.id === notifId);
    if (!notif?.quickBidAmount) return;
    const vehicle = vehicles.find((v) => v.id === notif.vehicleId);
    if (!vehicle) return;
    placeBidRef.current(notif.vehicleId, notif.quickBidAmount, vehicle.bid_count);
    markReadRef.current(notifId);
    setPendingRef.current(null);
  }, []);

  // 1/2 keyboard shortcuts — only active when sidebar is open
  useEffect(() => {
    if (!isSidebarOpen) return;

    function handler(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement).isContentEditable) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      if (e.key === '1') {
        const id = hoveredNotifRef.current;
        if (!id) return;
        setPendingRef.current(id);
        e.preventDefault();
      }

      if (e.key === '2') {
        const pending = pendingNotifRef.current;
        if (!pending) return;
        // Guard — must still be hovering the same notification
        if (hoveredNotifRef.current !== pending) return;
        confirmQuickBid(pending);
        e.preventDefault();
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isSidebarOpen, confirmQuickBid]);

  return (
    <div
      className={`
        fixed inset-0 z-50
        md:relative md:inset-auto
        md:flex-shrink-0 md:overflow-hidden
        md:border-l md:border-border-default
        bg-bg-surface
        transition-transform duration-300 ease-out
        md:transition-[width] md:duration-300 md:ease-out
        ${isSidebarOpen
          ? 'translate-y-0 md:w-[440px]'
          : 'translate-y-full md:translate-y-0 md:w-0'
        }
      `}
    >
      <div className="w-full md:w-[440px] h-full flex flex-col">
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border-default" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border-default flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-primary">{STRINGS.notifications.title}</h2>
            {unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand text-text-inverse text-xs font-bold flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand font-medium hover:text-brand-hover active:opacity-70">
                {STRINGS.notifications.markAllRead}
              </button>
            )}
            <button
              onClick={closeSidebar}
              aria-label="Close notifications"
              className="w-8 h-8 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-elevated active:opacity-70 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-default flex-shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                tab === t.id
                  ? 'text-brand border-b-2 border-brand'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Keyboard shortcut hint */}
        {isSidebarOpen && (
          <div className="px-4 py-2 bg-bg-elevated border-b border-border-subtle flex-shrink-0">
            <p className="text-[10px] text-text-muted">
              Hover a notification + <kbd className="font-mono bg-bg-surface border border-border-default rounded px-1 py-0.5">1</kbd> to stage · <kbd className="font-mono bg-bg-surface border border-border-default rounded px-1 py-0.5">2</kbd> to confirm
            </p>
          </div>
        )}

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
              <Bell size={32} className="text-text-muted" />
              <p className="text-sm font-medium text-text-secondary">{STRINGS.notifications.empty}</p>
              <p className="text-xs text-text-muted">{STRINGS.notifications.emptyHint}</p>
            </div>
          ) : (
            filtered.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                isPending={pendingNotificationId === n.id}
                onHoverChange={handleHoverChange}
                onConfirmQuickBid={() => confirmQuickBid(n.id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {activeNotifications.length > 0 && (
          <div className="flex-shrink-0 border-t border-border-default px-4 py-3 pb-safe">
            <button
              onClick={clearAll}
              className="text-xs text-text-muted hover:text-text-secondary active:opacity-70 transition-colors"
            >
              {STRINGS.notifications.clearAll}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
