'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { SearchFilters as FilterOptions } from '@/types';
import { RENT_BRACKETS, EMPTY_FILTERS } from '@/constants';

interface SearchFiltersProps {
  onSearch: (filters: FilterOptions) => void;
  loading?: boolean;
}

export default function SearchFilters({ onSearch, loading }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({ ...EMPTY_FILTERS });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = { ...EMPTY_FILTERS };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const hasActiveFilters = filters.sharingOption !== null || filters.maxRent !== null || filters.gender !== null || filters.foodIncluded !== null;

  return (
    <div className="w-full">
      {/* Main Search Bar */}
      <div className="bg-white rounded-2xl shadow-xl p-2">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Location Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search city, area, or landmark..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative px-4 py-3.5 rounded-xl font-medium transition-colors flex items-center gap-2 justify-center text-sm ${
              showFilters || hasActiveFilters
                ? 'bg-blue-50 text-blue-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2 justify-center"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 px-2 pb-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 pl-1">
                  Sharing Type
                </label>
                <select
                  value={filters.sharingOption ?? ''}
                  onChange={(e) => setFilters({ ...filters, sharingOption: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border-0 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All</option>
                  <option value="1">Single</option>
                  <option value="2">Double</option>
                  <option value="3">Triple</option>
                  <option value="4">Four+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 pl-1">
                  Max Rent
                </label>
                <select
                  value={filters.maxRent ?? ''}
                  onChange={(e) => setFilters({ ...filters, maxRent: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border-0 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Any budget</option>
                  {RENT_BRACKETS.map((bracket) => (
                    <option key={bracket.value} value={bracket.value}>{bracket.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 pl-1">
                  Gender
                </label>
                <select
                  value={filters.gender ?? ''}
                  onChange={(e) => setFilters({ ...filters, gender: (e.target.value || null) as FilterOptions['gender'] })}
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border-0 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Any">Co-living</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 pl-1">
                  Food
                </label>
                <select
                  value={filters.foodIncluded === null ? '' : filters.foodIncluded ? 'true' : 'false'}
                  onChange={(e) => setFilters({ ...filters, foodIncluded: e.target.value === '' ? null : e.target.value === 'true' })}
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border-0 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Any</option>
                  <option value="true">Included</option>
                  <option value="false">Not included</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
