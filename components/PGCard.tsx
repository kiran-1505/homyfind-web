'use client';

import { useState } from 'react';
import { PGListing } from '@/types';
import { MapPin, Star, Users, Utensils, Home, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useImageCarousel } from '@/hooks/useImageCarousel';
import { safeParseJSON, safeSetLocalStorage } from '@/utils';
import { AMENITY_KEYS } from '@/constants';
import Image from 'next/image';

interface PGCardProps {
  listing: PGListing;
}

export default function PGCard({ listing }: PGCardProps) {
  const router = useRouter();
  const t = useTranslations();
  const [liked, setLiked] = useState(false);

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const { currentIndex, imageLoaded, hasMultiple, goToNext, goToPrev, goToIndex, onImageLoad } = useImageCarousel(images);

  const handleViewDetails = () => {
    const allListings = safeParseJSON<PGListing[]>(localStorage.getItem('pgListings')) || [];
    const exists = allListings.find((l) => l.id === listing.id);
    if (!exists) {
      allListings.push(listing);
      safeSetLocalStorage('pgListings', JSON.stringify(allListings));
    }
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
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Image Carousel */}
      <div className="relative h-56 bg-gray-100 overflow-hidden cursor-pointer" onClick={handleViewDetails}>
        {images.length > 0 ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <Image
              src={images[currentIndex]}
              alt={`${listing.pgName} - Photo ${currentIndex + 1}`}
              fill
              className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={onImageLoad}
              unoptimized
            />

            {hasMultiple && (
              <>
                <button
                  onClick={(e) => goToPrev(e)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={(e) => goToNext(e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
              </>
            )}

            {hasMultiple && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => goToIndex(index, e)}
                    className={`rounded-full transition-all duration-200 ${
                      currentIndex === index
                        ? 'w-2.5 h-2.5 bg-white shadow-md'
                        : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to photo ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {hasMultiple && (
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                {currentIndex + 1}/{images.length}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <Home className="w-16 h-16 text-primary-200" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          {listing.verified && (
            <span className="bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('common.verified')}
            </span>
          )}
        </div>

        <button
          onClick={toggleLike}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200"
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 transition-colors duration-200 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4" onClick={handleViewDetails} role="button" tabIndex={0}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-1 flex-1">
            {listing.pgName}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-gray-800">{listing.rating || 4.0}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{listing.nearbyLandmark || listing.address || listing.city}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded-md text-xs font-medium flex items-center gap-1">
            <Users className="w-3 h-3" />
            {listing.sharingOption || 1} {t('common.sharing')}
          </span>
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
            listing.preferredGender === 'Male' ? 'bg-primary-50 text-primary-600' :
            listing.preferredGender === 'Female' ? 'bg-pink-50 text-pink-700' :
            'bg-purple-50 text-purple-700'
          }`}>
            {listing.preferredGender === 'Male' ? t('common.male') :
             listing.preferredGender === 'Female' ? t('common.female') :
             t('common.any')}
          </span>
          {listing.foodIncluded && (
            <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium flex items-center gap-1">
              <Utensils className="w-3 h-3" />
              {t('common.food')}
            </span>
          )}
          {(listing.availableRooms || 0) > 0 && (
            <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium">
              {t('common.roomsLeft', { count: listing.availableRooms })}
            </span>
          )}
        </div>

        {(listing.amenities || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {(listing.amenities || []).slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded border border-gray-100"
              >
                {translateAmenity(amenity)}
              </span>
            ))}
            {(listing.amenities || []).length > 3 && (
              <span className="text-xs px-2 py-0.5 text-gray-400">
                {t('common.more', { count: (listing.amenities || []).length - 3 })}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-gray-900">
                ₹{(listing.rent || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-gray-400 text-sm">{t('common.perMonth')}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-lg font-medium transition-colors duration-200"
          >
            {t('common.viewDetails')}
          </button>
        </div>
      </div>
    </div>
  );
}
