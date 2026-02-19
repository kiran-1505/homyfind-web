import { useState, useCallback } from 'react';

export function useImageCarousel(images: string[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasMultiple = images.length > 1;

  const goToNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hasMultiple) {
      setImageLoaded(false);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  }, [hasMultiple, images.length]);

  const goToPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hasMultiple) {
      setImageLoaded(false);
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  }, [hasMultiple, images.length]);

  const goToIndex = useCallback((index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setImageLoaded(false);
    setCurrentIndex(index);
  }, []);

  const onImageLoad = useCallback(() => setImageLoaded(true), []);

  return {
    currentIndex,
    imageLoaded,
    hasMultiple,
    currentImage: images[currentIndex] || null,
    goToNext,
    goToPrev,
    goToIndex,
    onImageLoad,
  };
}
