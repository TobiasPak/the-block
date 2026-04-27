import { useState } from 'react';
import { ChevronLeft, ChevronRight, Car } from 'lucide-react';

interface DrawerPhotoGalleryProps {
  images: string[];
  vehicleName: string;
}

export function DrawerPhotoGallery({ images, vehicleName }: DrawerPhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  function prev() {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }
  function next() {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-56 bg-bg-subtle flex items-center justify-center">
        <Car size={40} className="text-text-muted" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0">
      {/* Main image */}
      <div className="relative w-full h-56 bg-bg-subtle overflow-hidden">
        <img
          src={images[activeIndex]}
          alt={vehicleName}
          className="w-full h-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-bg-surface/80 backdrop-blur-sm border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            <button
              onClick={next}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-bg-surface/80 backdrop-blur-sm border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-bg-page/50">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Photo ${i + 1}`}
              className={`flex-shrink-0 w-14 h-10 rounded overflow-hidden transition-opacity ${
                i === activeIndex
                  ? 'ring-2 ring-brand ring-offset-1 ring-offset-bg-surface opacity-100'
                  : 'opacity-50 hover:opacity-80'
              }`}
            >
              <img src={src} alt={`${vehicleName} photo ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
