'use client';

import { useState, useCallback } from 'react';
import { PGListing } from '@/types';
import { MapPin, Star, Users, Utensils, Home, ChevronLeft, ChevronRight, Heart, BadgeCheck } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useImageCarousel } from '@/hooks/useImageCarousel';
import { AMENITY_KEYS } from '@/constants';
import Image from 'next/image';

/**
 * Determines whether a carousel image at `idx` should be loaded.
 * We only load the current image plus its immediate neighbors
 * to avoid overwhelming the photo proxy with concurrent requests.
 */
function shouldLoadImage(idx: number, currentIndex: number, total: number): boolean {
  if (idx === currentIndex) return true;
  // Load adjacent images for smooth transitions
  const prev = (currentIndex - 1 + total) % total;
  const next = (currentIndex + 1) % total;
  return idx === prev || idx === next;
}

interface PGCardProps {
  listing: PGListing;
}

export default function PGCard({ listing }: PGCardProps) {
  const router = useRouter();
  const t = useTranslations();
  const [liked, setLiked] = useState(false);

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const {
    currentIndex,
    imageLoaded,
    hasMultiple,
    goToNext,
    goToPrev,
    goToIndex,
    onImageLoad,
    onMouseEnter,
    onMouseLeave,
  } = useImageCarousel(images, true, 5000);

  const handleImageError = useCallback((idx: number) => {
    setImageErrors(prev => ({ ...prev, [idx]: true }));
  }, []);

  const handleViewDetails = () => {
    router.push(`/listing/${listing.id}`);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  const translateAmenity = (amenity: string) => {
    const key = AMENITY_KEYS[amenity];
    return key ? t(`amenityNames.${key}`) : amenity;
  };

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100 hover:border-gray-200 hover:-translate-y-1 ${
        listing.verificationPlan === 'premium' ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-100' : 'shadow-sm'
      }`}
    >
      {/* Image Carousel with smooth sliding */}
      <div
        className="relative h-56 bg-gray-100 overflow-hidden cursor-pointer"
        onClick={handleViewDetails}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {images.length > 0 ? (
          <>
            {/* Sliding image strip — only loads current + adjacent images */}
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {images.map((src, idx) => (
                <div key={idx} className="relative min-w-full h-full flex-shrink-0">
                  {imageErrors[idx] ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Home className="w-12 h-12 text-gray-300" />
                    </div>
                  ) : shouldLoadImage(idx, currentIndex, images.length) ? (
                    <Image
                      src={src}
                      alt={`${listing.pgName} - Photo ${idx + 1}`}
                      fill
                      className="object-cover"
                      onLoad={idx === currentIndex ? onImageLoad : undefined}
                      onError={() => handleImageError(idx)}
                      unoptimized
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
              ))}
            </div>

            {/* Loading placeholder for first image */}
            {!imageLoaded && currentIndex === 0 && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}

            {/* Gradient overlay at bottom for dots visibility */}
            {hasMultiple && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            )}

            {hasMultiple && (
              <>
                <button
                  onClick={(e) => goToPrev(e)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={(e) => goToNext(e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
              </>
            )}

            {/* Dot indicators - pill shape for active */}
            {hasMultiple && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => goToIndex(index, e)}
                    className={`rounded-full transition-all duration-300 ${
                      currentIndex === index
                        ? 'w-6 h-2 bg-white shadow-md'
                        : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to photo ${index + 1}`}
                  />
                ))}
                {images.length > 5 && (
                  <span className="text-white/80 text-[10px] ml-0.5 self-center">+{images.length - 5}</span>
                )}
              </div>
            )}

            {/* Photo counter badge */}
            {hasMultiple && (
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                {currentIndex + 1}/{images.length}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <Home className="w-16 h-16 text-primary-200" />
          </div>
        )}

        {/* Verification badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {listing.verificationPlan === 'premium' ? (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {t('common.premium')}
            </span>
          ) : listing.source === 'firestore' ? (
            <span className="bg-primary-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
              <BadgeCheck className="w-3.5 h-3.5" />
              {t('common.verified')}
            </span>
          ) : null}
        </div>

        {/* Like button */}
        <button
          onClick={toggleLike}
          className={`absolute top-3 right-3 p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
            liked ? 'bg-red-50' : 'bg-white/80 backdrop-blur-sm hover:bg-white'
          }`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 transition-all duration-300 ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4" onClick={handleViewDetails} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewDetails(); } }} role="button" tabIndex={0}>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-base font-bold text-gray-900 line-clamp-1 flex-1 group-hover:text-primary-600 transition-colors">
            {listing.pgName}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0 bg-yellow-50 px-2 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-gray-800">{listing.rating || 4.0}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary-400" />
          <span className="line-clamp-1">{listing.nearbyLandmark || listing.address || listing.city}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(listing.roomConfigurations && listing.roomConfigurations.length > 1) ? (
            listing.roomConfigurations.map((rc, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-primary-100">
                <Users className="w-3 h-3" />
                {rc.sharingType} {t('common.sharing')}
              </span>
            ))
          ) : (
            <span className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-primary-100">
              <Users className="w-3 h-3" />
              {listing.sharingOption || 1} {t('common.sharing')}
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
            listing.preferredGender === 'Male' ? 'bg-blue-50 text-blue-700 border-blue-100' :
            listing.preferredGender === 'Female' ? 'bg-pink-50 text-pink-700 border-pink-100' :
            'bg-purple-50 text-purple-700 border-purple-100'
          }`}>
            {listing.preferredGender === 'Male' ? t('common.male') :
             listing.preferredGender === 'Female' ? t('common.female') :
             t('common.any')}
          </span>
          {listing.foodIncluded && (
            <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-green-100">
              <Utensils className="w-3 h-3" />
              {t('common.food')}
            </span>
          )}
          {(listing.availableRooms || 0) > 0 && (
            <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-semibold border border-orange-100">
              {t('common.roomsLeft', { count: listing.availableRooms })}
            </span>
          )}
        </div>

        {/* Amenities */}
        {(listing.amenities || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(listing.amenities || []).slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-100 font-medium"
              >
                {translateAmenity(amenity)}
              </span>
            ))}
            {(listing.amenities || []).length > 3 && (
              <span className="text-xs px-2 py-1 text-gray-400 font-medium">
                {t('common.more', { count: (listing.amenities || []).length - 3 })}
              </span>
            )}
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-extrabold text-gray-900">
                {(() => {
                  const configs = listing.roomConfigurations;
                  if (configs && configs.length > 1) {
                    const rents = configs.map(c => c.rent).sort((a, b) => a - b);
                    return `₹${rents[0].toLocaleString('en-IN')} - ₹${rents[rents.length - 1].toLocaleString('en-IN')}`;
                  }
                  return `₹${(listing.rent || 0).toLocaleString('en-IN')}`;
                })()}
              </span>
              <span className="text-gray-400 text-sm font-medium">{t('common.perMonth')}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary-200 active:scale-95"
          >
            {t('common.viewDetails')}
          </button>
        </div>
      </div>
    </div>
  );
}
