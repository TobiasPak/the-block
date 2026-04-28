import { useNotificationStore } from '../../store/useNotificationStore';
import { NotificationToast } from './NotificationToast';

export function NotificationToastQueue() {
  const { toastQueue, activeNotifications } = useNotificationStore();

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col-reverse gap-2 w-80 pointer-events-none">
      {toastQueue.map((id) => {
        const notification = activeNotifications.find((n) => n.id === id);
        if (!notification) return null;
        return <NotificationToast key={id} notification={notification} />;
      })}
    </div>
  );
}
