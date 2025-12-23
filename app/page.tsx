'use client';

import { useState, useEffect } from 'react';
import { PGListing } from '@/types';
import PGCard from '@/components/PGCard';
import SearchFilters from '@/components/SearchFilters';
import { Home, Users, DollarSign } from 'lucide-react';

export default function HomePage() {
  const [listings, setListings] = useState<PGListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<PGListing | null>(null);
  const [isRealData, setIsRealData] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async (filters?: any) => {
    setLoading(true);
    try {
      // 100% FREE SEARCH - No API keys, No credit card!
      // Scrapes public websites in real-time
      const queryParams = new URLSearchParams();
      if (filters?.location) {
        queryParams.append('location', filters.location);
      } else {
        queryParams.append('location', 'Bangalore'); // Default city
      }

      // REAL-TIME SEARCH - Fetches actual data from websites!
      const response = await fetch(`/api/search-realtime?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        let filteredListings = data.data;
        
        // Track if this is real or mock data
        setIsRealData(data.isRealData || false);
        setDataSource(data.message || '');
        
        // Apply client-side filters
        if (filters) {
          if (filters.maxRent) {
            filteredListings = filteredListings.filter((l: PGListing) => l.rent <= filters.maxRent);
          }
          if (filters.sharingOption) {
            filteredListings = filteredListings.filter((l: PGListing) => l.sharingOption === filters.sharingOption);
          }
          if (filters.gender) {
            filteredListings = filteredListings.filter((l: PGListing) => 
              l.preferredGender === filters.gender || l.preferredGender === 'Any'
            );
          }
          if (filters.foodIncluded !== '') {
            filteredListings = filteredListings.filter((l: PGListing) => l.foodIncluded === filters.foodIncluded);
          }
        }
        
        setListings(filteredListings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: any) => {
    fetchListings(filters);
  };

  const handleViewDetails = (listing: PGListing) => {
    setSelectedListing(listing);
    // TODO: Navigate to details page or open modal
    console.log('View details for:', listing);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/HomyFind-logo.png" alt="HomyFind" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">HomyFind</h1>
              <p className="text-xs text-gray-500">Find Your Perfect PG</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Listings</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">About</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Find Your Perfect PG in India
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover comfortable paying guest accommodations across major cities
            </p>
          </div>
          
          {/* Search Component */}
          <div className="max-w-5xl mx-auto">
            <SearchFilters onSearch={handleSearch} loading={loading} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Verified Properties</h3>
            <p className="text-gray-600">All PG listings are verified for your safety and peace of mind</p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Community Living</h3>
            <p className="text-gray-600">Connect with like-minded people and build lasting friendships</p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Affordable Pricing</h3>
            <p className="text-gray-600">Find quality accommodations that fit your budget</p>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {listings.length > 0 ? `${listings.length} PG Listings Found` : 'Featured PG Listings'}
            </h2>
            {dataSource && (
              <div className="mt-2 flex items-center gap-2">
                {isRealData ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Live Data from Websites
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Sample Data (for demo)
                  </span>
                )}
                <span className="text-sm text-gray-500">{dataSource}</span>
              </div>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading PG listings...</p>
          </div>
        ) : (
          <>
            {listings.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {listings.map((listing) => (
                  <PGCard 
                    key={listing.id} 
                    listing={listing}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-md">
                <Home className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-xl mb-2">No PG listings found</p>
                <p className="text-gray-400">Try adjusting your search filters</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">Are you a PG Owner?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            List your property and connect with thousands of potential tenants across India
          </p>
          <button className="px-10 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl">
            List Your Property
          </button>
        </div>
      </section>
    </div>
  );
}

