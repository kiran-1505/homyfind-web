'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { PGListing } from '@/types';
import { useImageCarousel } from '@/hooks/useImageCarousel';
import { AMENITY_KEYS } from '@/constants';
import {
  MapPin, Star, Users, Utensils, Home, Phone, Mail,
  CheckCircle, XCircle, Calendar, IndianRupee, Shield,
  ArrowLeft, ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const t = useTranslations();
  const [listing, setListing] = useState<PGListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const images = listing?.images && listing.images.length > 0 ? listing.images : [];
  const { currentIndex, imageLoaded, hasMultiple, goToNext, goToPrev, goToIndex, onImageLoad } = useImageCarousel(images);

  const handleImageError = useCallback((idx: number) => {
    setImageErrors(prev => ({ ...prev, [idx]: true }));
  }, []);

  const translateAmenity = (amenity: string) => {
    const key = AMENITY_KEYS[amenity];
    return key ? t(`amenityNames.${key}`) : amenity;
  };

  useEffect(() => {
    const isGoogleListing = params.id.startsWith('google-');

    // Always fetch from API (no client-side storage of search results)
    fetch(`/api/listing/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setListing((prev) => {
            // For Google listings: merge if we had partial data and API returns more images
            if (prev && isGoogleListing && data.data.images && data.data.images.length > (prev.images?.length || 0)) {
              return { ...prev, ...data.data };
            }
            return data.data;
          });
        }
      })
      .catch((error) => console.error('Error fetching listing:', error))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{t('detail.loadingListing')}</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('detail.listingNotFound')}</h2>
          <p className="text-gray-500 text-sm mb-6">{t('detail.listingNotFoundDesc')}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm font-medium transition-colors"
          >
            {t('detail.backToSearch')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 -ml-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/find-my-pg-logo.jpg" alt="Find-My-PG" width={32} height={32} className="h-8 w-auto" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                Find-My-PG
              </span>
            </Link>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Photos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="relative h-72 md:h-96 bg-gray-100">
            {images.length > 0 ? (
              <>
                {!imageLoaded && !imageErrors[currentIndex] && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                {imageErrors[currentIndex] ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Home className="w-16 h-16 text-gray-300" />
                  </div>
                ) : (
                  <Image
                    src={images[currentIndex]}
                    alt={`${listing.pgName} - Photo ${currentIndex + 1}`}
                    fill
                    className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={onImageLoad}
                    onError={() => handleImageError(currentIndex)}
                    unoptimized
                  />
                )}
                {hasMultiple && (
                  <>
                    <button
                      onClick={goToPrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-50 to-primary-100">
                <Home className="w-16 h-16 text-primary-200" />
              </div>
            )}
          </div>

          {hasMultiple && (
            <div className="p-3 flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${
                    currentIndex === index ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  {imageErrors[index] ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Home className="w-6 h-6 text-gray-300" />
                    </div>
                  ) : (
                    <Image
                      src={image}
                      alt={`${listing.pgName} ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={() => handleImageError(index)}
                      unoptimized
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{listing.pgName}</h1>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{listing.address}</span>
                  </div>
                </div>
                {listing.verified && (
                  <span className="flex-shrink-0 flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {t('common.verified')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-sm">{listing.rating}</span>
                <span className="text-gray-400 text-sm">{t('detail.reviews', { count: listing.reviewCount })}</span>
              </div>
            </div>

            {listing.description && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('detail.aboutThisPG')}</h2>
                <p className="text-gray-600 leading-relaxed text-sm">{listing.description}</p>
              </div>
            )}

            {listing.amenities && listing.amenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('detail.amenities')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {listing.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{translateAmenity(amenity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {listing.rules && listing.rules.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('detail.houseRules')}</h2>
                <ul className="space-y-2.5">
                  {listing.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('detail.location')}</h2>
              <p className="text-gray-500 text-sm mb-4">{t('detail.locationDesc')}</p>
              <a
                href={listing.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {t('detail.openInMaps')}
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
              {/* Room Configurations / Pricing */}
              {listing.roomConfigurations && listing.roomConfigurations.length > 1 ? (
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('detail.roomConfigurations')}</h3>
                  <div className="space-y-2">
                    {listing.roomConfigurations.map((rc, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{rc.sharingType} {t('common.sharing')}</span>
                          <span className="text-xs text-gray-500 ml-2">({rc.availableRooms} {t('detail.roomsLabel')})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900">₹{rc.rent.toLocaleString('en-IN')}</span>
                          <span className="text-xs text-gray-400">{t('common.perMonth')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {listing.roomConfigurations?.[0] && (
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-2">
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>{t('detail.deposit')}: ₹{listing.roomConfigurations[0].securityDeposit.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{listing.rent.toLocaleString('en-IN')}
                    </span>
                    <span className="text-gray-400">{t('common.perMonthFull')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>{t('detail.deposit')}: ₹{listing.securityDeposit.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
                {(!listing.roomConfigurations || listing.roomConfigurations.length <= 1) && (
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{t('detail.sharing', { count: listing.sharingOption })}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{listing.preferredGender}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Utensils className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{listing.foodIncluded ? t('detail.foodIncluded') : t('detail.foodNotIncluded')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{t('detail.availableFrom', { date: new Date(listing.availableFrom).toLocaleDateString('en-IN') })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{t('detail.roomsAvailable', { available: listing.availableRooms, total: listing.totalRooms })}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-3">{t('detail.contactOwner')}</h3>
                <div className="space-y-2.5">
                  {listing.ownerName && <p className="text-sm text-gray-700">{listing.ownerName}</p>}
                  {listing.ownerPhone && (
                    <a href={`tel:${listing.ownerPhone}`} className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 font-medium">
                      <Phone className="w-4 h-4" />
                      {listing.ownerPhone}
                    </a>
                  )}
                  {listing.ownerEmail && (
                    <a href={`mailto:${listing.ownerEmail}`} className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 font-medium">
                      <Mail className="w-4 h-4" />
                      {listing.ownerEmail}
                    </a>
                  )}
                  {!listing.ownerPhone && !listing.ownerEmail && (
                    <p className="text-sm text-gray-400">{t('detail.contactOnMaps')}</p>
                  )}
                </div>

                {listing.ownerPhone ? (
                  <a
                    href={`tel:${listing.ownerPhone}`}
                    className="mt-5 w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {t('detail.callOwner')}
                  </a>
                ) : (
                  <a
                    href={listing.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('detail.viewOnMaps')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
