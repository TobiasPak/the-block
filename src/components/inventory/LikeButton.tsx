import { memo } from 'react';
import { Heart } from 'lucide-react';
import { useLikeStore } from '../../store/useLikeStore';
import { STRINGS } from '../../config/strings';

interface LikeButtonProps {
  vehicleId: string;
  className?: string;
}

export const LikeButton = memo(function LikeButton({ vehicleId, className }: LikeButtonProps) {
  const { isLiked, toggleLike } = useLikeStore();
  const liked = isLiked(vehicleId);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleLike(vehicleId);
      }}
      aria-label={liked ? STRINGS.likes.unlike : STRINGS.likes.like}
      className={`flex items-center justify-center transition-colors duration-150 ${
        liked ? 'text-red-500 hover:text-red-400' : 'text-text-muted hover:text-red-400'
      } ${className ?? ''}`}
    >
      <Heart
        size={15}
        strokeWidth={2}
        className={liked ? 'fill-red-500' : ''}
        aria-hidden="true"
      />
    </button>
  );
});
