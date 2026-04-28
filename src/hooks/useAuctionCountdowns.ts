import { useEffect, useRef } from 'react';
import type { Vehicle } from '../types/vehicle';
import { normalizeAuctionStart } from '../utils/format';

export const MILESTONE_MS = [
  60 * 60 * 1000,       // 1 hour
  30 * 60 * 1000,       // 30 min
  10 * 60 * 1000,       // 10 min
  5  * 60 * 1000,       // 5 min
  1  * 60 * 1000,       // 1 min
] as const;

export const MILESTONE_LABEL: Record<number, string> = {
  [60 * 60 * 1000]: '1 hour',
  [30 * 60 * 1000]: '30 minutes',
  [10 * 60 * 1000]: '10 minutes',
  [5  * 60 * 1000]: '5 minutes',
  [1  * 60 * 1000]: '1 minute',
};

export function useAuctionCountdowns(
  watchedVehicles: Vehicle[],
  onMilestone: (vehicle: Vehicle, milestoneMs: number) => void,
) {
  // Track which milestones have already fired per vehicle: Record<vehicleId, Set<milestoneMs>>
  const fired = useRef<Record<string, Set<number>>>({});

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      for (const vehicle of watchedVehicles) {
        const target = normalizeAuctionStart(vehicle.auction_start).getTime();
        const remaining = target - now;
        if (remaining <= 0) continue;

        if (!fired.current[vehicle.id]) fired.current[vehicle.id] = new Set();
        const vehicleFired = fired.current[vehicle.id];

        for (const milestone of MILESTONE_MS) {
          if (remaining <= milestone && !vehicleFired.has(milestone)) {
            vehicleFired.add(milestone);
            onMilestone(vehicle, milestone);
          }
        }
      }
    };

    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [watchedVehicles, onMilestone]);
}
