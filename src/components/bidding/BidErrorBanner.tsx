import { AlertCircle } from 'lucide-react';

interface BidErrorBannerProps {
  message: string | null;
}

export function BidErrorBanner({ message }: BidErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 bg-status-salvage/10 border border-status-salvage/30 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-bottom-1 duration-150">
      <AlertCircle size={14} className="text-status-salvage flex-shrink-0" aria-hidden="true" />
      <p className="text-sm text-status-salvage">{message}</p>
    </div>
  );
}
