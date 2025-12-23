'use client';

import { useState, useEffect } from 'react';
import { PGListing } from '@/types';
import PGCard from '@/components/PGCard';
import SearchFilters from '@/components/SearchFilters';
import { Home, Users, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

const LISTINGS_PER_PAGE = 21;

export default function HomePage() {
  const [listings, setListings] = useState<PGListing[]>([]);
  const [allListings, setAllListings] = useState<PGListing[]>([]); // Store all listings
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<PGListing | null>(null);
  const [isRealData, setIsRealData] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    fetchListings();
  }, []);

  // Update displayed listings when page changes
  useEffect(() => {
    updateDisplayedListings();
  }, [currentPage, allListings]);

  const updateDisplayedListings = () => {
    const startIndex = (currentPage - 1) * LISTINGS_PER_PAGE;
    const endIndex = startIndex + LISTINGS_PER_PAGE;
    setListings(allListings.slice(startIndex, endIndex));
  };

  const totalPages = Math.ceil(allListings.length / LISTINGS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async (filters?: any) => {
    setLoading(true);
    setCurrentPage(1); // Reset to first page on new search
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
        
        // Save all listings to localStorage for detail page access
        localStorage.setItem('pgListings', JSON.stringify(filteredListings));
        
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
        
        setAllListings(filteredListings); // Store all listings
        // updateDisplayedListings will be called by useEffect
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
            <a href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</a>
            <a href="/add-listing" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Advertisement
            </a>
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

      {/* Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {allListings.length > 0 ? `${allListings.length} PG Listings Found` : 'Featured PG Listings'}
            </h2>
            {allListings.length > LISTINGS_PER_PAGE && (
              <p className="text-gray-600 mt-1">
                Showing {((currentPage - 1) * LISTINGS_PER_PAGE) + 1} - {Math.min(currentPage * LISTINGS_PER_PAGE, allListings.length)} of {allListings.length}
              </p>
            )}
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

        {/* Pagination */}
        {!loading && allListings.length > LISTINGS_PER_PAGE && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
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

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Verified Properties */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Verified Properties</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                All PG listings are verified for your safety and peace of mind
              </p>
            </div>

            {/* Community Living */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Community Living</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Connect with like-minded people and build lasting friendships
              </p>
            </div>

            {/* Affordable Pricing */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Affordable Pricing</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Find quality accommodations that fit your budget
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

