import { Bell, BellRing } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useDrawer } from '../../context/DrawerContext';

export function BellButton() {
  const { unreadCount, urgentCount, isSidebarOpen, toggleSidebar, openSidebar } = useNotificationStore();
  const { closeDrawer } = useDrawer();

  function handleClick() {
    // Close vehicle drawer when notification sidebar opens
    if (!isSidebarOpen) {
      closeDrawer();
      openSidebar();
    } else {
      toggleSidebar();
    }
  }

  const isUrgent = urgentCount > 0;
  const hasUnread = unreadCount > 0;

  return (
    <button
      onClick={handleClick}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      aria-pressed={isSidebarOpen}
      className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 border ${
        isSidebarOpen
          ? 'text-brand bg-brand-subtle border-brand'
          : isUrgent
            ? 'text-status-salvage border-transparent hover:bg-bg-elevated'
            : hasUnread
              ? 'text-brand border-transparent hover:bg-bg-elevated'
              : 'text-text-muted border-transparent hover:text-text-primary hover:bg-bg-elevated'
      }`}
    >
      {isUrgent
        ? <BellRing size={16} aria-hidden="true" className="animate-bell-ring" />
        : <Bell size={16} aria-hidden="true" />
      }
      {unreadCount > 0 && (
        <span
          className={`absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-text-inverse text-[10px] font-bold leading-4 text-center flex items-center justify-center ${
            isUrgent ? 'bg-status-salvage' : 'bg-brand'
          }`}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
