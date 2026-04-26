import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { InventoryPage } from './pages/InventoryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InventoryPage />} />
        <Route
          path="/vehicles/:id"
          element={
            <Layout>
              <div className="p-8 text-white">Vehicle detail coming soon</div>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
