export type NotificationType =
  | 'outbid'
  | 'auction_won'
  | 'reserve_not_met'
  | 'ending_1hr'
  | 'ending_30min'
  | 'ending_10min'
  | 'ending_5min'
  | 'ending_1min'
  | 'liked_ending_soon'
  | 'liked_bid_started';

export interface Notification {
  id: string;
  type: NotificationType;
  vehicleId: string;
  vehicleName: string;
  lot: string;
  message: string;
  timestamp: number;
  read: boolean;
  dismissed: boolean;
  urgent: boolean;
  quickBidAmount?: number;
}

export const URGENT_TYPES: NotificationType[] = [
  'outbid', 'ending_5min', 'ending_1min',
];

export const TOAST_DURATION: Record<NotificationType, number> = {
  outbid:            8000,
  auction_won:       6000,
  reserve_not_met:   6000,
  ending_1hr:        3500,
  ending_30min:      3500,
  ending_10min:      5000,
  ending_5min:       7000,
  ending_1min:       10000,
  liked_ending_soon: 3500,
  liked_bid_started: 3500,
};
