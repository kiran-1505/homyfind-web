'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PGListing } from '@/types';
import { 
  MapPin, Star, Users, Utensils, Home, Phone, Mail, 
  CheckCircle, XCircle, Calendar, DollarSign, Shield,
  ArrowLeft, ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [listing, setListing] = useState<PGListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchListingDetails();
  }, [params.id]);

  const fetchListingDetails = async () => {
    try {
      // Fetch from localStorage cache or API
      const cachedListings = localStorage.getItem('pgListings');
      if (cachedListings) {
        const allListings = JSON.parse(cachedListings);
        const found = allListings.find((l: PGListing) => l.id === params.id);
        if (found) {
          setListing(found);
          setLoading(false);
          return;
        }
      }

      // If not in cache, fetch from API
      const response = await fetch(`/api/listing/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setListing(data.data);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h2>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go back to search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <img src="/HomyFind-logo.png" alt="HomyFind" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HomyFind
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Photos Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="relative h-96 bg-gray-200">
            {listing.images && listing.images.length > 0 ? (
              <>
                <img
                  src={listing.images[currentImageIndex]}
                  alt={listing.pgName}
                  className="w-full h-full object-cover"
                />
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {listing.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Home className="w-20 h-20 text-gray-400" />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {listing.images && listing.images.length > 1 && (
            <div className="p-4 flex gap-2 overflow-x-auto">
              {listing.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index ? 'border-blue-600' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`${listing.pgName} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* PG Name & Rating */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.pgName}</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{listing.address}</span>
                  </div>
                </div>
                {listing.verified && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{listing.rating}</span>
                  <span className="text-gray-500">({listing.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">About this PG</h2>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {listing.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            {listing.rules && listing.rules.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">House Rules</h2>
                <ul className="space-y-2">
                  {listing.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Google Maps Link */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">View on Google Maps</h2>
              <p className="text-gray-600 mb-4">
                See the exact location, nearby places, and get directions on Google Maps.
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* Sidebar - Contact & Pricing */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">₹{listing.rent.toLocaleString()}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Security deposit: ₹{listing.securityDeposit.toLocaleString()}</span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{listing.sharingOption} Sharing</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Preferred: {listing.preferredGender}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">
                    Food {listing.foodIncluded ? 'Included' : 'Not Included'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">
                    Available from: {new Date(listing.availableFrom).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">
                    {listing.availableRooms} of {listing.totalRooms} rooms available
                  </span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 mb-3">Contact Owner</h3>
                
                {listing.ownerName && (
                  <div className="text-gray-700">
                    <span className="font-semibold">Name:</span> {listing.ownerName}
                  </div>
                )}

                {listing.ownerPhone && (
                  <a
                    href={`tel:${listing.ownerPhone}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <Phone className="w-5 h-5" />
                    {listing.ownerPhone}
                  </a>
                )}

                {listing.ownerEmail && (
                  <a
                    href={`mailto:${listing.ownerEmail}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <Mail className="w-5 h-5" />
                    {listing.ownerEmail}
                  </a>
                )}

                {(!listing.ownerPhone && !listing.ownerEmail) && (
                  <p className="text-gray-600 text-sm">
                    Contact information available on Google Maps
                  </p>
                )}
              </div>

              <button
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Contact Owner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

