import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { formatOdometer } from '../../utils/format';
import { useDrawer } from '../../context/DrawerContext';
import { useBidStore, getMinimumBid } from '../../store/useBidStore';
import { DrawerPhotoGallery } from './DrawerPhotoGallery';
import { DrawerSpecsGrid } from './DrawerSpecsGrid';
import { DrawerConditionSection } from './DrawerConditionSection';
import { DrawerDealerSection } from './DrawerDealerSection';
import { DrawerAuctionSection } from './DrawerAuctionSection';
import { BidPanel } from '../bidding/BidPanel';
import { STRINGS } from '../../config/strings';

export function VehicleDrawer() {
  const { selectedVehicle, closeDrawer } = useDrawer();
  const { getBidEntry, buyNow } = useBidStore();
  const isOpen = selectedVehicle !== null;

  const [bidPanelOpen, setBidPanelOpen] = useState(false);
  const [bidPanelInitialStep, setBidPanelInitialStep] = useState<'select' | 'success'>('select');
  const [bidPanelInitialAmount, setBidPanelInitialAmount] = useState<number | undefined>(undefined);

  // Reset bid panel when switching vehicles
  useEffect(() => {
    setBidPanelOpen(false);
  }, [selectedVehicle?.id]);

  // Escape key closes bid panel first, then drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (bidPanelOpen) setBidPanelOpen(false);
      else closeDrawer();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeDrawer, bidPanelOpen]);

  function handlePlaceBid() {
    setBidPanelInitialStep('select');
    setBidPanelInitialAmount(undefined);
    setBidPanelOpen(true);
  }

  function handleBuyNow() {
    if (!selectedVehicle?.buy_now_price) return;
    const entry = getBidEntry(selectedVehicle.id);
    const baseBidCount = entry?.bidCount ?? selectedVehicle.bid_count;
    buyNow(selectedVehicle.id, selectedVehicle.buy_now_price, baseBidCount);
    setBidPanelInitialStep('success');
    setBidPanelInitialAmount(selectedVehicle.buy_now_price);
    setBidPanelOpen(true);
  }

  return (
    <div
      className={`flex-shrink-0 overflow-hidden bg-bg-surface border-l border-border-default transition-[width] duration-300 ease-out ${isOpen ? 'w-[440px]' : 'w-0'}`}
    >
      {isOpen && selectedVehicle && (
        <div className="w-[440px] h-full flex flex-col relative">
          {/* Close button */}
          <button
            onClick={closeDrawer}
            aria-label={STRINGS.drawer.close}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-bg-elevated border border-border-default text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>

          {/* Photo gallery */}
          <DrawerPhotoGallery
            images={selectedVehicle.images}
            vehicleName={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
          />

          {/* Scrollable body */}
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

          {/* Auction footer */}
          <DrawerAuctionSection
            vehicle={selectedVehicle}
            onPlaceBid={handlePlaceBid}
            onBuyNow={handleBuyNow}
          />

          {/* Bid panel slides up over everything */}
          <div
            className={`absolute inset-0 bg-bg-surface z-20 flex flex-col transition-transform duration-300 ease-out ${bidPanelOpen ? 'translate-y-0' : 'translate-y-full'}`}
            aria-hidden={!bidPanelOpen}
          >
            {bidPanelOpen && (
              <BidPanel
                vehicle={selectedVehicle}
                onClose={() => setBidPanelOpen(false)}
                initialStep={bidPanelInitialStep}
                initialAmount={bidPanelInitialAmount}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
