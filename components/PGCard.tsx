'use client';

import { PGListing } from '@/types';
import { MapPin, Star, Users, Utensils, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PGCardProps {
  listing: PGListing;
}

export default function PGCard({ listing }: PGCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    // Save listing to localStorage for quick access
    const cachedListings = localStorage.getItem('pgListings');
    const allListings = cachedListings ? JSON.parse(cachedListings) : [];
    const exists = allListings.find((l: PGListing) => l.id === listing.id);
    if (!exists) {
      allListings.push(listing);
      localStorage.setItem('pgListings', JSON.stringify(allListings));
    }
    
    // Navigate to detail page
    router.push(`/listing/${listing.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Carousel - For now showing first image */}
      <div className="relative h-56 bg-gray-200 overflow-hidden group">
        {listing.images && listing.images.length > 0 ? (
          <img 
            src={listing.images[0]} 
            alt={listing.pgName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <Home className="w-20 h-20 text-blue-400" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {listing.verified && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          )}
        </div>
        
        {/* Available Rooms Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            {listing.availableRooms || 0} rooms available
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* Title and Location */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">
            {listing.pgName}
          </h3>
          <div className="flex items-start gap-1 text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{listing.nearbyLandmark || listing.address || listing.city}</span>
          </div>
        </div>
        
        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-blue-600">
                ₹{(listing.rent || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-gray-500 text-sm">/mo</span>
            </div>
            <span className="text-xs text-gray-500">
              + ₹{(listing.securityDeposit || 0).toLocaleString('en-IN')} deposit
            </span>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-gray-800">{listing.rating || 4.0}</span>
            <span className="text-xs text-gray-500">({listing.reviewCount || 0})</span>
          </div>
        </div>
        
        {/* Tags/Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {listing.sharingOption || 1} Sharing
          </span>
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            listing.preferredGender === 'Male' ? 'bg-blue-50 text-blue-700' : 
            listing.preferredGender === 'Female' ? 'bg-pink-50 text-pink-700' : 
            'bg-purple-50 text-purple-700'
          }`}>
            {listing.preferredGender || 'Any'}
          </span>
          {listing.foodIncluded && (
            <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5" />
              Food
            </span>
          )}
        </div>
        
        {/* Amenities */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {(listing.amenities || []).slice(0, 4).map((amenity, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
              >
                {amenity}
              </span>
            ))}
            {(listing.amenities || []).length > 4 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                +{(listing.amenities || []).length - 4} more
              </span>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        <button 
          onClick={handleViewDetails}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

