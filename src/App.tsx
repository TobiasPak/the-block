import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DrawerProvider } from './context/DrawerContext';
import { BidStoreProvider } from './store/useBidStore';
import { LikeStoreProvider } from './store/useLikeStore';
import { Layout } from './components/layout/Layout';
import { InventoryPage } from './pages/InventoryPage';
import { STRINGS } from './config/strings';

export default function App() {
  return (
    <BidStoreProvider>
      <LikeStoreProvider>
        <DrawerProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<InventoryPage />} />
              <Route
                path="/vehicles/:id"
                element={
                  <Layout>
                    <div className="p-8 text-text-primary">{STRINGS.detail.comingSoon}</div>
                  </Layout>
                }
              />
            </Routes>
          </BrowserRouter>
        </DrawerProvider>
      </LikeStoreProvider>
    </BidStoreProvider>
  );
}
