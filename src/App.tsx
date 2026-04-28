import { DrawerProvider } from './context/DrawerContext';
import { BidStoreProvider } from './store/useBidStore';
import { LikeStoreProvider } from './store/useLikeStore';
import { NotificationStoreProvider } from './store/useNotificationStore';
import { InventoryPage } from './pages/InventoryPage';

export default function App() {
  return (
    <BidStoreProvider>
      <LikeStoreProvider>
        <NotificationStoreProvider>
          <DrawerProvider>
            <InventoryPage />
          </DrawerProvider>
        </NotificationStoreProvider>
      </LikeStoreProvider>
    </BidStoreProvider>
  );
}
