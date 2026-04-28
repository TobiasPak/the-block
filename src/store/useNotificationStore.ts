import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Notification, NotificationType } from '../config/notifications';

const STORAGE_KEY = 'the-block:notifications';
const MAX_STORED = 100;
const MAX_TOASTS = 3;

interface NotificationState {
  notifications: Notification[];
  toastQueue: string[];    // notification IDs currently showing as toasts (session only)
  isSidebarOpen: boolean;
  pendingNotificationId: string | null;  // notification with staged quick bid
}

type NotificationAction =
  | { type: 'ADD'; notification: Notification }
  | { type: 'MARK_READ'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DISMISS'; id: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'SET_PENDING_NOTIF'; id: string | null }
  | { type: 'OPEN_SIDEBAR' }
  | { type: 'CLOSE_SIDEBAR' }
  | { type: 'TOGGLE_SIDEBAR' };

function loadInitialState(): NotificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const notifications = JSON.parse(raw) as Notification[];
      return { notifications, toastQueue: [], isSidebarOpen: false, pendingNotificationId: null };
    }
  } catch {}
  return { notifications: [], toastQueue: [], isSidebarOpen: false, pendingNotificationId: null };
}

function reducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD': {
      const updated = [action.notification, ...state.notifications].slice(0, MAX_STORED);
      const newQueue = [...state.toastQueue, action.notification.id];
      const toastQueue = newQueue.length > MAX_TOASTS ? newQueue.slice(-MAX_TOASTS) : newQueue;
      persist(updated);
      return { ...state, notifications: updated, toastQueue };
    }
    case 'MARK_READ': {
      const updated = state.notifications.map((n) =>
        n.id === action.id ? { ...n, read: true } : n,
      );
      persist(updated);
      return { ...state, notifications: updated };
    }
    case 'MARK_ALL_READ': {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      persist(updated);
      return { ...state, notifications: updated };
    }
    case 'DISMISS': {
      const updated = state.notifications.map((n) =>
        n.id === action.id ? { ...n, dismissed: true, read: true } : n,
      );
      const toastQueue = state.toastQueue.filter((id) => id !== action.id);
      persist(updated);
      return { ...state, notifications: updated, toastQueue };
    }
    case 'CLEAR_ALL': {
      const updated = state.notifications.map((n) => ({ ...n, dismissed: true, read: true }));
      persist(updated);
      return { ...state, notifications: updated, toastQueue: [] };
    }
    case 'REMOVE_TOAST':
      return { ...state, toastQueue: state.toastQueue.filter((id) => id !== action.id) };
    case 'SET_PENDING_NOTIF':
      return { ...state, pendingNotificationId: action.id };
    case 'OPEN_SIDEBAR':
      return { ...state, isSidebarOpen: true };
    case 'CLOSE_SIDEBAR':
      return { ...state, isSidebarOpen: false, pendingNotificationId: null };
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen, pendingNotificationId: null };
    default:
      return state;
  }
}

function persist(notifications: Notification[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications)); } catch {}
}

// ── Context ──────────────────────────────────────────────────────────────────

interface NotificationStoreContextValue {
  notifications: Notification[];
  activeNotifications: Notification[];
  toastQueue: string[];
  isSidebarOpen: boolean;
  pendingNotificationId: string | null;
  unreadCount: number;
  urgentCount: number;
  urgentVehicleIds: Set<string>;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read' | 'dismissed'>) => void;
  hasNotificationType: (vehicleId: string, type: NotificationType) => boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
  removeToast: (id: string) => void;
  setPendingNotificationId: (id: string | null) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const NotificationStoreContext = createContext<NotificationStoreContextValue | null>(null);

export function NotificationStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  const activeNotifications = useMemo(
    () => state.notifications.filter((n) => !n.dismissed),
    [state.notifications],
  );

  const unreadCount = useMemo(
    () => activeNotifications.filter((n) => !n.read).length,
    [activeNotifications],
  );

  const urgentCount = useMemo(
    () => activeNotifications.filter((n) => !n.read && n.urgent).length,
    [activeNotifications],
  );

  const urgentVehicleIds = useMemo(
    () => new Set(activeNotifications.filter((n) => !n.read && n.urgent).map((n) => n.vehicleId)),
    [activeNotifications],
  );

  const addNotification = useCallback(
    (partial: Omit<Notification, 'id' | 'timestamp' | 'read' | 'dismissed'>) => {
      const notification: Notification = {
        ...partial,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        read: false,
        dismissed: false,
      };
      dispatch({ type: 'ADD', notification });
    },
    [],
  );

  const hasNotificationType = useCallback(
    (vehicleId: string, type: NotificationType) =>
      state.notifications.some(
        (n) => n.vehicleId === vehicleId && n.type === type && !n.dismissed,
      ),
    [state.notifications],
  );

  const markRead    = useCallback((id: string) => dispatch({ type: 'MARK_READ', id }), []);
  const markAllRead = useCallback(() => dispatch({ type: 'MARK_ALL_READ' }), []);
  const dismiss     = useCallback((id: string) => dispatch({ type: 'DISMISS', id }), []);
  const clearAll    = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), []);
  const removeToast = useCallback((id: string) => dispatch({ type: 'REMOVE_TOAST', id }), []);
  const setPendingNotificationId = useCallback((id: string | null) => dispatch({ type: 'SET_PENDING_NOTIF', id }), []);
  const openSidebar  = useCallback(() => dispatch({ type: 'OPEN_SIDEBAR' }), []);
  const closeSidebar = useCallback(() => dispatch({ type: 'CLOSE_SIDEBAR' }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);

  const value = useMemo(
    () => ({
      notifications: state.notifications,
      activeNotifications,
      toastQueue: state.toastQueue,
      isSidebarOpen: state.isSidebarOpen,
      pendingNotificationId: state.pendingNotificationId,
      unreadCount,
      urgentCount,
      urgentVehicleIds,
      addNotification,
      hasNotificationType,
      markRead,
      markAllRead,
      dismiss,
      clearAll,
      removeToast,
      setPendingNotificationId,
      openSidebar,
      closeSidebar,
      toggleSidebar,
    }),
    [
      state.notifications,
      state.toastQueue,
      state.isSidebarOpen,
      state.pendingNotificationId,
      activeNotifications,
      unreadCount,
      urgentCount,
      urgentVehicleIds,
      addNotification,
      hasNotificationType,
      markRead,
      markAllRead,
      dismiss,
      clearAll,
      removeToast,
      setPendingNotificationId,
      openSidebar,
      closeSidebar,
      toggleSidebar,
    ],
  );

  return React.createElement(NotificationStoreContext.Provider, { value }, children);
}

export function useNotificationStore(): NotificationStoreContextValue {
  const ctx = useContext(NotificationStoreContext);
  if (!ctx) throw new Error('useNotificationStore must be used within NotificationStoreProvider');
  return ctx;
}
