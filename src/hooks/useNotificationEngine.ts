import { useEffect, useRef, useCallback, useMemo } from 'react';
import type { Vehicle } from '../types/vehicle';
import { vehicles as allVehicles } from '../data/vehicles';
import { formatCurrency } from '../utils/format';
import { getMinimumBid, useBidStore } from '../store/useBidStore';
import type { BidEntry } from '../store/useBidStore';
import { useLikeStore } from '../store/useLikeStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuctionCountdowns, MILESTONE_LABEL } from './useAuctionCountdowns';
import { playNotificationSound } from '../utils/sound';
import { STRINGS } from '../config/strings';

export function useNotificationEngine() {
  const { bidEntries } = useBidStore();
  const { getLikedIds } = useLikeStore();
  const {
    addNotification,
    hasNotificationType,
    unreadCount,
  } = useNotificationStore();

  // ── Tab title ───────────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) THE BLOCK` : 'THE BLOCK';
  }, [unreadCount]);

  // ── Bid status change detection ─────────────────────────────────────────────
  // Per-vehicle status tracking — avoids stale-ref issues from render batching
  const prevStatuses = useRef<Record<string, BidEntry['status']>>({});

  // Seed prevStatuses from rehydrated localStorage on mount so no false
  // notifications fire for already-resolved auctions after a page reload
  useEffect(() => {
    for (const [vehicleId, entry] of Object.entries(bidEntries)) {
      prevStatuses.current[vehicleId] = entry.status;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only

  useEffect(() => {
    for (const [vehicleId, entry] of Object.entries(bidEntries)) {
      const prevStatus = prevStatuses.current[vehicleId] ?? 'idle';
      const currStatus = entry.status;

      // Always update immediately so the next dispatch sees the correct previous status
      prevStatuses.current[vehicleId] = currStatus;

      if (prevStatus === currStatus) continue;

      const vehicle = allVehicles.find((v) => v.id === vehicleId);
      if (!vehicle) continue;

      const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
      const minimumBid  = getMinimumBid(entry.currentBid, vehicle.starting_bid);

      // Outbid — only notify on winning → outbid to suppress duplicate OUTBID dispatches
      if (currStatus === 'outbid' && prevStatus === 'winning') {
        if (!hasNotificationType(vehicleId, 'outbid')) {
          addNotification({
            type: 'outbid',
            vehicleId,
            vehicleName,
            lot: vehicle.lot,
            message: STRINGS.notifications.outbid(vehicleName, formatCurrency(entry.currentBid)),
            urgent: true,
            quickBidAmount: minimumBid,
          });
          playNotificationSound('outbid');
        }
      }

      // Won
      if (currStatus === 'won' && prevStatus !== 'won') {
        if (!hasNotificationType(vehicleId, 'auction_won')) {
          addNotification({
            type: 'auction_won',
            vehicleId,
            vehicleName,
            lot: vehicle.lot,
            message: STRINGS.notifications.won(vehicleName, formatCurrency(entry.myBid ?? 0)),
            urgent: false,
          });
          playNotificationSound('won');
        }
      }

      // Reserve not met
      if (currStatus === 'reserve_not_met' && prevStatus !== 'reserve_not_met') {
        if (!hasNotificationType(vehicleId, 'reserve_not_met')) {
          addNotification({
            type: 'reserve_not_met',
            vehicleId,
            vehicleName,
            lot: vehicle.lot,
            message: STRINGS.notifications.reserveNotMet(vehicleName),
            urgent: false,
            quickBidAmount: minimumBid,
          });
          playNotificationSound('urgent');
        }
      }
    }
  }, [bidEntries, addNotification, hasNotificationType]);

  // ── Countdown milestones ────────────────────────────────────────────────────
  const likedIds = useMemo(() => getLikedIds(), [getLikedIds]);

  const watchedVehicles = useMemo<Vehicle[]>(() => {
    const winningIds = new Set(
      Object.entries(bidEntries)
        .filter(([, e]) => e.status === 'winning')
        .map(([id]) => id),
    );
    const likedSet = new Set(likedIds);
    return allVehicles.filter((v) => winningIds.has(v.id) || likedSet.has(v.id));
  }, [bidEntries, likedIds]);

  const handleMilestone = useCallback(
    (vehicle: Vehicle, milestoneMs: number) => {
      const entry   = bidEntries[vehicle.id];
      const isBidding = !!entry && entry.status === 'winning';
      const isLiked   = likedIds.includes(vehicle.id);
      const label     = MILESTONE_LABEL[milestoneMs] ?? '';
      const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

      if (isBidding) {
        const typeMap: Record<number, 'ending_1hr' | 'ending_30min' | 'ending_10min' | 'ending_5min' | 'ending_1min'> = {
          [60 * 60 * 1000]: 'ending_1hr',
          [30 * 60 * 1000]: 'ending_30min',
          [10 * 60 * 1000]: 'ending_10min',
          [5  * 60 * 1000]: 'ending_5min',
          [1  * 60 * 1000]: 'ending_1min',
        };
        const type = typeMap[milestoneMs];
        if (!type || hasNotificationType(vehicle.id, type)) return;

        const urgent = milestoneMs <= 5 * 60 * 1000;
        addNotification({
          type,
          vehicleId: vehicle.id,
          vehicleName,
          lot: vehicle.lot,
          message: STRINGS.notifications.endingSoon(vehicleName, label),
          urgent,
          quickBidAmount: getMinimumBid(entry.currentBid, vehicle.starting_bid),
        });
        playNotificationSound(urgent ? 'urgent' : 'info');

      } else if (isLiked) {
        if (hasNotificationType(vehicle.id, 'liked_ending_soon')) return;
        addNotification({
          type: 'liked_ending_soon',
          vehicleId: vehicle.id,
          vehicleName,
          lot: vehicle.lot,
          message: STRINGS.notifications.likedEndingSoon(vehicleName, label),
          urgent: false,
          quickBidAmount: vehicle.starting_bid,
        });
        playNotificationSound('info');
      }
    },
    [bidEntries, likedIds, addNotification, hasNotificationType],
  );

  useAuctionCountdowns(watchedVehicles, handleMilestone);
}
