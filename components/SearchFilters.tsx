'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface FilterOptions {
  location: string;
  sharingOption: number | '';
  maxRent: number | '';
  gender: 'Male' | 'Female' | 'Any' | '';
  foodIncluded: boolean | '';
}

interface SearchFiltersProps {
  onSearch: (filters: FilterOptions) => void;
  loading?: boolean;
}

export default function SearchFilters({ onSearch, loading }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    sharingOption: '',
    maxRent: '',
    gender: '',
    foodIncluded: ''
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      location: '',
      sharingOption: '',
      maxRent: '',
      gender: '',
      foodIncluded: ''
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  return (
    <div className="w-full">
      {/* Main Search Bar */}
      <div className="bg-white rounded-xl shadow-xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Location Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by location (e.g., Bangalore, Mumbai)..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
          
          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Sharing Option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sharing Type
                </label>
                <select
                  value={filters.sharingOption}
                  onChange={(e) => setFilters({ ...filters, sharingOption: e.target.value ? parseInt(e.target.value) : '' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">All Types</option>
                  <option value="1">Single</option>
                  <option value="2">Double</option>
                  <option value="3">Triple</option>
                  <option value="4">Four+</option>
                </select>
              </div>
              
              {/* Max Rent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Rent (₹/month)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 15000"
                  value={filters.maxRent}
                  onChange={(e) => setFilters({ ...filters, maxRent: e.target.value ? parseInt(e.target.value) : '' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              {/* Gender Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender Preference
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({ ...filters, gender: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Any">Co-living</option>
                </select>
              </div>
              
              {/* Food Included */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Preference
                </label>
                <select
                  value={filters.foodIncluded === '' ? '' : filters.foodIncluded ? 'true' : 'false'}
                  onChange={(e) => setFilters({ ...filters, foodIncluded: e.target.value === '' ? '' : e.target.value === 'true' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Any</option>
                  <option value="true">Food Included</option>
                  <option value="false">No Food</option>
                </select>
              </div>
            </div>
            
            {/* Reset Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

