import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { formatOdometer } from '../../utils/format';
import { useDrawer } from '../../context/DrawerContext';
import { DrawerPhotoGallery } from './DrawerPhotoGallery';
import { DrawerSpecsGrid } from './DrawerSpecsGrid';
import { DrawerConditionSection } from './DrawerConditionSection';
import { DrawerDealerSection } from './DrawerDealerSection';
import { DrawerAuctionSection } from './DrawerAuctionSection';
import { BidPanel } from '../bidding/BidPanel';
import { STRINGS } from '../../config/strings';

export function VehicleDrawer() {
  const { selectedVehicle, closeDrawer } = useDrawer();
  const isOpen = selectedVehicle !== null;
  const [showBidPanel, setShowBidPanel] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showBidPanel) setShowBidPanel(false);
        else closeDrawer();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeDrawer, showBidPanel]);

  useEffect(() => {
    setShowBidPanel(false);
  }, [selectedVehicle?.id]);

  return (
    <div
      className={`flex-shrink-0 overflow-hidden bg-bg-surface border-l border-border-default transition-[width] duration-300 ease-out ${isOpen ? 'w-[440px]' : 'w-0'}`}
    >
      {isOpen && selectedVehicle && (
        <div className="w-[440px] h-full flex flex-col relative">
          <button
            onClick={closeDrawer}
            aria-label={STRINGS.drawer.close}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-bg-elevated border border-border-default text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>

          <DrawerPhotoGallery
            images={selectedVehicle.images}
            vehicleName={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
          />

          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6 min-h-0">
            <div>
              <h2 className="text-lg font-bold text-text-primary leading-tight">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}{' '}
                {selectedVehicle.trim}
              </h2>
              <p className="text-sm text-text-secondary mt-0.5 capitalize">
                {formatOdometer(selectedVehicle.odometer_km)} · {selectedVehicle.body_style} ·{' '}
                {selectedVehicle.fuel_type}
              </p>
            </div>
            <DrawerSpecsGrid vehicle={selectedVehicle} />
            <DrawerConditionSection vehicle={selectedVehicle} />
            <DrawerDealerSection vehicle={selectedVehicle} />
          </div>

          <DrawerAuctionSection
            vehicle={selectedVehicle}
            onPlaceBid={() => setShowBidPanel(true)}
          />

          {/* Bid panel overlay — slides up from bottom */}
          <div
            className={`absolute inset-0 bg-bg-surface flex flex-col transition-transform duration-300 ease-out ${showBidPanel ? 'translate-y-0' : 'translate-y-full'}`}
            aria-hidden={!showBidPanel}
          >
            {showBidPanel && (
              <div className="flex-1 flex flex-col px-4 py-5 min-h-0">
                <BidPanel
                  vehicle={selectedVehicle}
                  onClose={() => setShowBidPanel(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
