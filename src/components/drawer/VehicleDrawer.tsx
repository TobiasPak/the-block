import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Vehicle } from '../../types/vehicle';
import { formatOdometer } from '../../utils/format';
import { useDrawer } from '../../context/DrawerContext';
import { DrawerPhotoGallery } from './DrawerPhotoGallery';
import { DrawerSpecsGrid } from './DrawerSpecsGrid';
import { DrawerConditionSection } from './DrawerConditionSection';
import { DrawerDealerSection } from './DrawerDealerSection';
import { DrawerAuctionSection } from './DrawerAuctionSection';
import { STRINGS } from '../../config/strings';

export function VehicleDrawer() {
  const { selectedVehicle, closeDrawer } = useDrawer();
  const isOpen = selectedVehicle !== null;

  // Keep rendered vehicle in state so content stays visible during close animation
  const [renderedVehicle, setRenderedVehicle] = useState<Vehicle | null>(null);
  useEffect(() => {
    if (selectedVehicle) setRenderedVehicle(selectedVehicle);
  }, [selectedVehicle]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeDrawer]);

  return (
    <div
      className={`
        fixed inset-0 z-50
        md:relative md:inset-auto
        md:flex-shrink-0 md:overflow-hidden
        md:border-l md:border-border-default
        bg-bg-surface
        flex flex-col
        transition-transform duration-300 ease-out
        md:transition-[width] md:duration-300 md:ease-out
        ${isOpen
          ? 'translate-y-0 md:w-[440px]'
          : 'translate-y-full md:translate-y-0 md:w-0'
        }
      `}
    >
      {renderedVehicle && (
        <div className="w-full md:w-[440px] flex flex-col h-full">
          {/* Mobile drag handle */}
          <div className="flex justify-center pt-3 pb-1 md:hidden flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-border-default" />
          </div>

          <button
            onClick={closeDrawer}
            aria-label={STRINGS.drawer.close}
            className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-bg-elevated border border-border-default text-text-secondary hover:text-text-primary active:opacity-70 transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>

          {/* Photo — fixed at top, never scrolls */}
          <div className="flex-shrink-0">
            <DrawerPhotoGallery
              images={renderedVehicle.images}
              vehicleName={`${renderedVehicle.year} ${renderedVehicle.make} ${renderedVehicle.model}`}
            />
          </div>

          {/* Specs — fills remaining space, scrolls internally */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6 min-h-0">
            <div>
              <h2 className="text-lg font-bold text-text-primary leading-tight">
                {renderedVehicle.year} {renderedVehicle.make} {renderedVehicle.model}{' '}
                {renderedVehicle.trim}
              </h2>
              <p className="text-sm text-text-secondary mt-0.5 capitalize">
                {formatOdometer(renderedVehicle.odometer_km)} · {renderedVehicle.body_style} ·{' '}
                {renderedVehicle.fuel_type}
              </p>
            </div>
            <DrawerSpecsGrid vehicle={renderedVehicle} />
            <DrawerConditionSection vehicle={renderedVehicle} />
            <DrawerDealerSection vehicle={renderedVehicle} />
          </div>

          {/* Footer — takes natural height, always visible at bottom */}
          <div className="flex-shrink-0">
            <DrawerAuctionSection vehicle={renderedVehicle} />
          </div>
        </div>
      )}
    </div>
  );
}
