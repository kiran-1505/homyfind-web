'use client';

import { useState, useEffect } from 'react';
import { PGListing, SearchFilters as FilterOptions } from '@/types';
import PGCard from '@/components/PGCard';
import SearchFilters from '@/components/SearchFilters';
import { Home, ChevronLeft, ChevronRight, Shield, Users, IndianRupee, Plus, Menu, X, MapPin, Building2, Sparkles, LogIn, LayoutDashboard } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { LISTINGS_PER_PAGE, DEFAULT_LOCATION } from '@/constants';
import { safeSetLocalStorage } from '@/utils';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const t = useTranslations();
  const { isAuthenticated } = useAuth();
  const [listings, setListings] = useState<PGListing[]>([]);
  const [allListings, setAllListings] = useState<PGListing[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    fetchListings(undefined, abortController.signal);
    return () => abortController.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchListings = async (filters?: FilterOptions, signal?: AbortSignal) => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const queryParams = new URLSearchParams();
      if (filters?.location) {
        queryParams.append('location', filters.location);
      } else {
        queryParams.append('location', DEFAULT_LOCATION);
      }

      const response = await fetch(`/api/search-realtime?${queryParams}`, { signal });
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
      // Ignore abort errors (expected during React strict mode cleanup)
      if (error instanceof DOMException && error.name === 'AbortError') return;
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
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image src="/HomyFind-logo.png" alt="HomyFind" width={36} height={36} className="h-9 w-auto group-hover:scale-105 transition-transform" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                HomyFind
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 rounded-lg hover:bg-primary-50 transition-colors"
              >
                {t('common.home')}
              </Link>
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t('common.dashboard')}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  {t('common.login')}
                </Link>
              )}
              <LanguageSwitcher />
              <Link
                href="/add-listing"
                className="ml-2 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-200 hover:shadow-lg hover:shadow-primary-300"
              >
                <Plus className="w-4 h-4" />
                {t('common.listYourPG')}
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
            <div className="md:hidden pb-4 border-t border-gray-100 pt-3 space-y-2 animate-in">
              <Link href="/" className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">
                {t('common.home')}
              </Link>
              {isAuthenticated ? (
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">
                  <LayoutDashboard className="w-4 h-4" />
                  {t('common.dashboard')}
                </Link>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">
                  <LogIn className="w-4 h-4" />
                  {t('common.login')}
                </Link>
              )}
              <div className="px-4 py-1">
                <LanguageSwitcher />
              </div>
              <Link
                href="/add-listing"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                {t('common.listYourPG')}
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800">
        {/* Animated background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-200/10 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-400/5 rounded-full blur-3xl" />
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/10">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-primary-100 text-sm font-medium tracking-wide">
                {t('hero.trustLine')}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-primary-100/90 max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Search */}
          <div className="max-w-4xl mx-auto">
            <SearchFilters onSearch={handleSearch} loading={loading} />
          </div>

          {/* Quick stats cards */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-12">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-300" />
              </div>
              <span className="text-white text-sm font-medium">{t('hero.verifiedListings')}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-300" />
              </div>
              <span className="text-white text-sm font-medium">{t('hero.genderOptions')}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-yellow-300" />
              </div>
              <span className="text-white text-sm font-medium">{t('hero.startingPrice')}</span>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C240 0 480 0 720 15C960 30 1200 45 1440 30V60H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {loading ? t('common.searching') : allListings.length > 0 ? t('listings.pgsFound', { count: allListings.length }) : t('listings.pgListings')}
            </h2>
            {!loading && allListings.length > LISTINGS_PER_PAGE && (
              <p className="text-sm text-gray-500 mt-1">
                {t('listings.showing', {
                  start: ((currentPage - 1) * LISTINGS_PER_PAGE) + 1,
                  end: Math.min(currentPage * LISTINGS_PER_PAGE, allListings.length),
                  total: allListings.length
                })}
              </p>
            )}
          </div>
          {dataSource && !loading && (
            <div className="flex items-center gap-2">
              {isRealData ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {t('common.liveData')}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {t('common.sampleData')}
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          /* Skeleton loader grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="h-56 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-7 bg-gray-100 rounded-lg w-20 animate-pulse" />
                    <div className="h-7 bg-gray-100 rounded-lg w-14 animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="h-7 bg-gray-200 rounded-lg w-28 animate-pulse" />
                    <div className="h-10 bg-primary-100 rounded-xl w-28 animate-pulse" />
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
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Home className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-900 text-xl font-semibold mb-2">{t('listings.noListings')}</p>
            <p className="text-gray-500 text-sm max-w-md mx-auto">{t('listings.noListingsHint')}</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-sm"
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
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
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
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">{t('cta.title')}</h2>
              <p className="text-gray-400 max-w-lg text-lg">
                {t('cta.subtitle')}
              </p>
            </div>
            <Link
              href="/add-listing"
              className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-base"
            >
              <Plus className="w-5 h-5" />
              {t('common.listYourPG')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-sm font-semibold text-primary-500 uppercase tracking-widest mb-3">
            {t('features.whyChoose')}
          </h3>
          <p className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-14 max-w-2xl mx-auto">
            Making your PG search simple, safe, and affordable
          </p>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-green-100 transition-colors group-hover:scale-105 transform duration-300">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">{t('features.verifiedTitle')}</h4>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                {t('features.verifiedDesc')}
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-100 transition-colors group-hover:scale-105 transform duration-300">
                <Users className="w-8 h-8 text-primary-500" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">{t('features.communityTitle')}</h4>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                {t('features.communityDesc')}
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-yellow-100 transition-colors group-hover:scale-105 transform duration-300">
                <IndianRupee className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">{t('features.pricingTitle')}</h4>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                {t('features.pricingDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-10">
            Popular Cities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Bangalore', emoji: '🏙️' },
              { name: 'Mumbai', emoji: '🌊' },
              { name: 'Delhi', emoji: '🏛️' },
              { name: 'Pune', emoji: '📚' },
              { name: 'Hyderabad', emoji: '💎' },
              { name: 'Chennai', emoji: '🌴' },
            ].map((city) => (
              <button
                key={city.name}
                onClick={() => handleSearch({ location: city.name, sharingOption: null, maxRent: null, gender: null, foodIncluded: null })}
                className="group bg-white rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-primary-200"
              >
                <span className="text-3xl mb-3 block">{city.emoji}</span>
                <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-500 transition-colors flex items-center justify-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {city.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image src="/HomyFind-logo.png" alt="HomyFind" width={32} height={32} className="h-8 w-auto" />
              <div>
                <span className="text-base font-bold text-gray-900">HomyFind</span>
                <p className="text-sm text-gray-400">{t('footer.tagline')}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span>6 Cities</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span>Verified Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Google Maps Data</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
            <div className="flex items-center gap-6 text-sm">
              <Link href="/about" className="text-gray-500 hover:text-primary-500 transition-colors">{t('footer.about')}</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-primary-500 transition-colors">{t('footer.privacy')}</Link>
              <Link href="/contact" className="text-gray-500 hover:text-primary-500 transition-colors">{t('footer.contact')}</Link>
              <Link href="/terms" className="text-gray-500 hover:text-primary-500 transition-colors">{t('footer.terms')}</Link>
            </div>
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} HomyFind. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
