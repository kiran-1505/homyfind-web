'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, MapPin, DollarSign, Users, Utensils, Shield, Wifi, Upload } from 'lucide-react';

export default function AddListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    pgName: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    address: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    nearbyLandmark: '',
    sharingOption: 2,
    rent: '',
    securityDeposit: '',
    foodIncluded: false,
    preferredGender: 'Any',
    amenities: [] as string[],
    rules: '',
    description: '',
    totalRooms: '',
    availableRooms: '',
    availableFrom: new Date().toISOString().split('T')[0],
  });

  const amenitiesList = [
    'WiFi', 'AC', 'TV', 'Washing Machine', 'Fridge', 'Microwave',
    'Parking', 'CCTV', 'Security Guard', 'Power Backup', 'Water Purifier',
    'Laundry Service', 'Housekeeping', 'Gym'
  ];

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/add-advertisement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rent: parseInt(formData.rent),
          securityDeposit: parseInt(formData.securityDeposit),
          totalRooms: parseInt(formData.totalRooms),
          availableRooms: parseInt(formData.availableRooms),
          rules: formData.rules.split('\n').filter(r => r.trim()),
          images: [], // Will add image upload later
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/'), 3000);
      } else {
        setError(data.error || 'Failed to add listing');
      }
    } catch (err: any) {
      setError('Failed to submit. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Advertisement Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your PG listing has been submitted for verification. It will be visible to users once approved.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <img src="/HomyFind-logo.png" alt="HomyFind" className="h-12 w-auto" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Add Your PG Advertisement
            </h1>
          </div>
          <p className="text-gray-600">Fill in the details to list your PG on HomyFind</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* PG Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Home className="w-5 h-5" /> PG Details
            </h2>
            
            <input
              type="text"
              placeholder="PG Name *"
              required
              value={formData.pgName}
              onChange={e => setFormData({ ...formData, pgName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <textarea
              placeholder="Description *"
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Owner Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Owner/Contact Details</h2>
            
            <input
              type="text"
              placeholder="Owner Name *"
              required
              value={formData.ownerName}
              onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="tel"
                placeholder="Phone Number *"
                required
                value={formData.ownerPhone}
                onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email *"
                required
                value={formData.ownerEmail}
                onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Location
            </h2>
            
            <textarea
              placeholder="Full Address *"
              required
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="City *"
                required
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="State *"
                required
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Pincode *"
                required
                value={formData.pincode}
                onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <input
              type="text"
              placeholder="Nearby Landmark"
              value={formData.nearbyLandmark}
              onChange={e => setFormData({ ...formData, nearbyLandmark: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Pricing & Availability */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Pricing & Availability
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sharing Type *</label>
                <select
                  value={formData.sharingOption}
                  onChange={e => setFormData({ ...formData, sharingOption: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>Single Sharing</option>
                  <option value={2}>Double Sharing</option>
                  <option value={3}>Triple Sharing</option>
                  <option value={4}>4+ Sharing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Gender *</label>
                <select
                  value={formData.preferredGender}
                  onChange={e => setFormData({ ...formData, preferredGender: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Male">Male Only</option>
                  <option value="Female">Female Only</option>
                  <option value="Any">Any</option>
                </select>
              </div>

              <input
                type="number"
                placeholder="Monthly Rent (₹) *"
                required
                value={formData.rent}
                onChange={e => setFormData({ ...formData, rent: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="number"
                placeholder="Security Deposit (₹) *"
                required
                value={formData.securityDeposit}
                onChange={e => setFormData({ ...formData, securityDeposit: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="number"
                placeholder="Total Rooms *"
                required
                value={formData.totalRooms}
                onChange={e => setFormData({ ...formData, totalRooms: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="number"
                placeholder="Available Rooms *"
                required
                value={formData.availableRooms}
                onChange={e => setFormData({ ...formData, availableRooms: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="date"
                value={formData.availableFrom}
                onChange={e => setFormData({ ...formData, availableFrom: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="foodIncluded"
                  checked={formData.foodIncluded}
                  onChange={e => setFormData({ ...formData, foodIncluded: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="foodIncluded" className="ml-2 text-sm font-medium text-gray-700">
                  Food Included
                </label>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Wifi className="w-5 h-5" /> Amenities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {amenitiesList.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.amenities.includes(amenity)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">House Rules</h2>
            <textarea
              placeholder="Enter each rule on a new line&#10;Example:&#10;No smoking&#10;Visitors allowed till 9 PM&#10;Maintain cleanliness"
              rows={4}
              value={formData.rules}
              onChange={e => setFormData({ ...formData, rules: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Advertisement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

