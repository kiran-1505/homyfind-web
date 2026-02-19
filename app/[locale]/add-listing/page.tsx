'use client';

import { useState } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import {
  Home, MapPin, IndianRupee, Utensils, Wifi,
  ArrowLeft, CheckCircle, ChevronRight, Phone, Mail, User, FileText,
  Shield
} from 'lucide-react';
import { ADD_LISTING_STEPS, AMENITIES_LIST, DEFAULT_STATE, ADD_LISTING_STEP_KEYS, AMENITY_KEYS } from '@/constants';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AddListingPage() {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    pgName: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    address: '',
    city: '',
    state: DEFAULT_STATE,
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

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const translateAmenity = (amenity: string) => {
    const key = AMENITY_KEYS[amenity];
    return key ? t(`amenityNames.${key}`) : amenity;
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
          images: [],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/'), 3000);
      } else {
        setError(data.error || 'Failed to add listing');
      }
    } catch (err: unknown) {
      setError(t('addListing.failedSubmit'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('addListing.success.title')}</h2>
          <p className="text-gray-500 mb-6">
            {t('addListing.success.message')}
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 font-medium transition-colors"
          >
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1.5 -ml-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold text-gray-900">{t('addListing.pageTitle')}</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Step Indicator */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
          {ADD_LISTING_STEPS.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(index)}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                index === currentStep
                  ? 'bg-primary-500 text-white'
                  : index < currentStep
                  ? 'bg-primary-50 text-primary-500'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold border ${
                  index === currentStep ? 'border-white/30' : index < currentStep ? 'border-primary-200' : 'border-gray-300'
                }">
                  {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </span>
                <span className="hidden sm:inline">{t(`addListing.steps.${ADD_LISTING_STEP_KEYS[index]}`)}</span>
              </div>
              {index < ADD_LISTING_STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Step 0: PG Details */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary-500" />
                  {t('addListing.pgDetails.title')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.pgDetails.pgName')}</label>
                    <input
                      type="text"
                      placeholder={t('addListing.pgDetails.pgNamePlaceholder')}
                      required
                      value={formData.pgName}
                      onChange={e => setFormData({ ...formData, pgName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.pgDetails.description')}</label>
                    <textarea
                      placeholder={t('addListing.pgDetails.descriptionPlaceholder')}
                      required
                      rows={3}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-500" />
                  {t('addListing.contactDetails.title')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.contactDetails.ownerName')}</label>
                    <input
                      type="text"
                      placeholder={t('addListing.contactDetails.ownerNamePlaceholder')}
                      required
                      value={formData.ownerName}
                      onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.contactDetails.phone')}</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          placeholder={t('addListing.contactDetails.phonePlaceholder')}
                          required
                          value={formData.ownerPhone}
                          onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.contactDetails.email')}</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          placeholder={t('addListing.contactDetails.emailPlaceholder')}
                          required
                          value={formData.ownerEmail}
                          onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Location */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" />
                {t('addListing.locationSection.title')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.locationSection.fullAddress')}</label>
                  <textarea
                    placeholder={t('addListing.locationSection.addressPlaceholder')}
                    required
                    rows={2}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.locationSection.city')}</label>
                    <input
                      type="text"
                      placeholder={t('addListing.locationSection.cityPlaceholder')}
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.locationSection.state')}</label>
                    <input
                      type="text"
                      placeholder={t('addListing.locationSection.statePlaceholder')}
                      required
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.locationSection.pincode')}</label>
                    <input
                      type="text"
                      placeholder={t('addListing.locationSection.pincodePlaceholder')}
                      required
                      value={formData.pincode}
                      onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.locationSection.nearbyLandmark')}</label>
                  <input
                    type="text"
                    placeholder={t('addListing.locationSection.landmarkPlaceholder')}
                    value={formData.nearbyLandmark}
                    onChange={e => setFormData({ ...formData, nearbyLandmark: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Availability */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-primary-500" />
                {t('addListing.pricingSection.title')}
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.pricingSection.sharingType')}</label>
                    <select
                      value={formData.sharingOption}
                      onChange={e => setFormData({ ...formData, sharingOption: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value={1}>{t('addListing.pricingSection.single')}</option>
                      <option value={2}>{t('addListing.pricingSection.double')}</option>
                      <option value={3}>{t('addListing.pricingSection.triple')}</option>
                      <option value={4}>{t('addListing.pricingSection.fourPlusSharing')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.pricingSection.preferredGender')}</label>
                    <select
                      value={formData.preferredGender}
                      onChange={e => setFormData({ ...formData, preferredGender: e.target.value as 'Male' | 'Female' | 'Any' })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value="Male">{t('addListing.pricingSection.maleOnly')}</option>
                      <option value="Female">{t('addListing.pricingSection.femaleOnly')}</option>
                      <option value="Any">{t('addListing.pricingSection.any')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.pricingSection.monthlyRent')}</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder={t('addListing.pricingSection.rentPlaceholder')}
                        required
                        value={formData.rent}
                        onChange={e => setFormData({ ...formData, rent: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.pricingSection.securityDeposit')}</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder={t('addListing.pricingSection.depositPlaceholder')}
                        required
                        value={formData.securityDeposit}
                        onChange={e => setFormData({ ...formData, securityDeposit: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.pricingSection.totalRooms')}</label>
                    <input
                      type="number"
                      placeholder={t('addListing.pricingSection.totalRoomsPlaceholder')}
                      required
                      value={formData.totalRooms}
                      onChange={e => setFormData({ ...formData, totalRooms: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.pricingSection.availableRooms')}</label>
                    <input
                      type="number"
                      placeholder={t('addListing.pricingSection.availableRoomsPlaceholder')}
                      required
                      value={formData.availableRooms}
                      onChange={e => setFormData({ ...formData, availableRooms: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.pricingSection.availableFrom')}</label>
                    <input
                      type="date"
                      value={formData.availableFrom}
                      onChange={e => setFormData({ ...formData, availableFrom: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 p-4 bg-green-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.foodIncluded}
                    onChange={e => setFormData({ ...formData, foodIncluded: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">{t('addListing.pricingSection.foodIncluded')}</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Amenities & Rules */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-primary-500" />
                  {t('addListing.amenitiesSection.title')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {AMENITIES_LIST.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        formData.amenities.includes(amenity)
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {translateAmenity(amenity)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" />
                  {t('addListing.amenitiesSection.rulesTitle')}
                </h2>
                <textarea
                  placeholder={t('addListing.amenitiesSection.rulesPlaceholder')}
                  rows={4}
                  value={formData.rules}
                  onChange={e => setFormData({ ...formData, rules: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 gap-4">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t('common.back')}
              </button>
            ) : (
              <Link
                href="/"
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </Link>
            )}

            {currentStep < ADD_LISTING_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-8 py-3 text-sm font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors shadow-sm flex items-center gap-2"
              >
                {t('common.next')}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 text-sm font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('addListing.submitting') : t('addListing.submitListing')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
