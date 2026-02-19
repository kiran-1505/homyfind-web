'use client';

import { useState, useEffect } from 'react';
import { PGListing, SearchFilters as FilterOptions } from '@/types';
import PGCard from '@/components/PGCard';
import SearchFilters from '@/components/SearchFilters';
import { Home, ChevronLeft, ChevronRight, Shield, Users, IndianRupee, Plus, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { LISTINGS_PER_PAGE, DEFAULT_LOCATION } from '@/constants';
import { safeSetLocalStorage } from '@/utils';

export default function HomePage() {
  const [listings, setListings] = useState<PGListing[]>([]);
  const [allListings, setAllListings] = useState<PGListing[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    const startIndex = (currentPage - 1) * LISTINGS_PER_PAGE;
    const endIndex = startIndex + LISTINGS_PER_PAGE;
    setListings(allListings.slice(startIndex, endIndex));
  }, [currentPage, allListings]);

  const totalPages = Math.ceil(allListings.length / LISTINGS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchListings = async (filters?: FilterOptions) => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const queryParams = new URLSearchParams();
      if (filters?.location) {
        queryParams.append('location', filters.location);
      } else {
        queryParams.append('location', DEFAULT_LOCATION);
      }

      const response = await fetch(`/api/search-realtime?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        let filteredListings = data.data;
        safeSetLocalStorage('pgListings', JSON.stringify(filteredListings));
        setIsRealData(data.isRealData || false);
        setDataSource(data.message || '');

        if (filters) {
          if (filters.maxRent) {
            filteredListings = filteredListings.filter((l: PGListing) => l.rent <= filters.maxRent!);
          }
          if (filters.sharingOption) {
            filteredListings = filteredListings.filter((l: PGListing) => l.sharingOption === filters.sharingOption);
          }
          if (filters.gender) {
            filteredListings = filteredListings.filter((l: PGListing) =>
              l.preferredGender === filters.gender || l.preferredGender === 'Any'
            );
          }
          if (filters.foodIncluded !== null) {
            filteredListings = filteredListings.filter((l: PGListing) => l.foodIncluded === filters.foodIncluded);
          }
        }

        setAllListings(filteredListings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: FilterOptions) => {
    fetchListings(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/HomyFind-logo.png" alt="HomyFind" width={36} height={36} className="h-9 w-auto" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HomyFind
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/add-listing"
                className="ml-2 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                List Your PG
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-100 pt-3 space-y-2">
              <Link href="/" className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">
                Home
              </Link>
              <Link
                href="/add-listing"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                List Your PG
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-10">
            <p className="text-blue-200 text-sm font-medium tracking-wide uppercase mb-3">
              Trusted by 10,000+ tenants across India
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Find Your Perfect<br className="hidden sm:block" /> PG Accommodation
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Browse verified paying guest accommodations in Bangalore, Mumbai, Delhi and more
            </p>
          </div>

          {/* Search */}
          <div className="max-w-4xl mx-auto">
            <SearchFilters onSearch={handleSearch} loading={loading} />
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-10 text-blue-100 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Verified Listings</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Male, Female & Co-living</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              <span>Starting at Rs 5,000/mo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? 'Searching...' : allListings.length > 0 ? `${allListings.length} PGs Found` : 'PG Listings'}
            </h2>
            {!loading && allListings.length > LISTINGS_PER_PAGE && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {((currentPage - 1) * LISTINGS_PER_PAGE) + 1}-{Math.min(currentPage * LISTINGS_PER_PAGE, allListings.length)} of {allListings.length}
              </p>
            )}
          </div>
          {dataSource && !loading && (
            <div className="flex items-center gap-2">
              {isRealData ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Live Data
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Sample Data
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          /* Skeleton loader grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-100 rounded w-16" />
                    <div className="h-6 bg-gray-100 rounded w-12" />
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-24" />
                    <div className="h-9 bg-gray-200 rounded w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <PGCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 text-lg font-medium mb-1">No PG listings found</p>
            <p className="text-gray-500 text-sm">Try a different location or adjust your filters</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                if (totalPages <= 5) return true;
                if (page === 1 || page === totalPages) return true;
                return Math.abs(page - currentPage) <= 1;
              })
              .map((pageNum, idx, arr) => {
                const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1;
                return (
                  <span key={pageNum} className="flex items-center">
                    {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  </span>
                );
              })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Own a PG? List it for free</h2>
              <p className="text-gray-400 max-w-lg">
                Reach thousands of tenants looking for PG accommodation. Get enquiries within hours.
              </p>
            </div>
            <Link
              href="/add-listing"
              className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              List Your PG
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-10">
            Why choose HomyFind
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Verified Properties</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Every listing is verified for your safety and peace of mind
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Community Living</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Connect with like-minded people and build lasting friendships
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <IndianRupee className="w-6 h-6 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Affordable Pricing</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Find quality accommodations that fit your budget
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/HomyFind-logo.png" alt="HomyFind" width={28} height={28} className="h-7 w-auto opacity-60" />
              <span className="text-sm text-gray-400">HomyFind</span>
            </div>
            <p className="text-sm text-gray-400">Find your home away from home</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
