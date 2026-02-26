import { useState, useCallback, useEffect, useRef } from 'react';

export function useImageCarousel(images: string[], autoPlay = false, interval = 3000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hasMultiple = images.length > 1;
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-play: slide every `interval` ms only when enabled, not hovered, AND image is loaded
  useEffect(() => {
    if (autoPlay && hasMultiple && !isHovered && imageLoaded) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setImageLoaded(false); // Reset so next slide waits for its image to load
      }, interval);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, hasMultiple, isHovered, imageLoaded, images.length, interval]);

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

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  return {
    currentIndex,
    imageLoaded,
    hasMultiple,
    currentImage: images[currentIndex] || null,
    goToNext,
    goToPrev,
    goToIndex,
    onImageLoad,
    onMouseEnter,
    onMouseLeave,
  };
}
