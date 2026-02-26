'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Home, MapPin, IndianRupee, Utensils, Wifi,
  ArrowLeft, CheckCircle, ChevronRight, Phone, Mail, User, FileText,
  Plus, X, Camera, Upload, LogIn
} from 'lucide-react';
import { ADD_LISTING_STEPS, AMENITIES_LIST, RULES_LIST, DEFAULT_STATE, ADD_LISTING_STEP_KEYS, AMENITY_KEYS, RULE_KEYS, MAX_IMAGES, MAX_IMAGE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '@/constants';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Image from 'next/image';
import type { RoomConfiguration } from '@/types';

interface RoomConfigFormData {
  sharingType: number;
  rent: string;
  securityDeposit: string;
  availableRooms: string;
}

export default function AddListingPage() {
  const router = useRouter();
  const t = useTranslations();
  const { getIdToken, isAuthenticated, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  // Prevent accidental submission when step changes (Next button and Submit button occupy the same position)
  const [submitGuardActive, setSubmitGuardActive] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Image state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Room configurations — start with one default row
  const [roomConfigs, setRoomConfigs] = useState<RoomConfigFormData[]>([
    { sharingType: 2, rent: '', securityDeposit: '', availableRooms: '' }
  ]);

  const [formData, setFormData] = useState({
    pgName: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    area: '',
    address: '',
    city: '',
    state: DEFAULT_STATE,
    pincode: '',
    nearbyLandmark: '',
    googleMapsLink: '',
    foodIncluded: false,
    preferredGender: 'Any',
    amenities: [] as string[],
    selectedRules: [] as string[],
    customRules: '',
    description: '',
    totalRooms: '',
    availableFrom: new Date().toISOString().split('T')[0],
  });

  // Room config helpers
  const addRoomConfig = () => {
    if (roomConfigs.length >= 4) return;
    setRoomConfigs([...roomConfigs, { sharingType: 1, rent: '', securityDeposit: '', availableRooms: '' }]);
  };

  const removeRoomConfig = (index: number) => {
    if (roomConfigs.length <= 1) return;
    setRoomConfigs(roomConfigs.filter((_, i) => i !== index));
  };

  const updateRoomConfig = (index: number, field: keyof RoomConfigFormData, value: string | number) => {
    const updated = [...roomConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setRoomConfigs(updated);
  };

  // Image helpers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  const addImages = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return false;
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) return false;
      return true;
    });

    const remaining = MAX_IMAGES - imageFiles.length;
    const filesToAdd = validFiles.slice(0, remaining);

    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(prev => [...prev, ...filesToAdd]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const toggleRule = (rule: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRules: prev.selectedRules.includes(rule)
        ? prev.selectedRules.filter(r => r !== rule)
        : [...prev.selectedRules, rule]
    }));
  };

  const translateRule = (rule: string) => {
    const key = RULE_KEYS[rule];
    return key ? t(`ruleNames.${key}`) : rule;
  };

  const translateAmenity = (amenity: string) => {
    const key = AMENITY_KEYS[amenity];
    return key ? t(`amenityNames.${key}`) : amenity;
  };

  // Per-step validation before allowing "Next"
  const validateStep = (step: number): string | null => {
    switch (step) {
      case 0: {
        if (!formData.pgName.trim()) return t('addListing.pgDetails.pgName') + ' is required';
        if (formData.pgName.trim().length < 2) return t('addListing.pgDetails.pgName') + ' must be at least 2 characters';
        if (!formData.description.trim()) return t('addListing.pgDetails.description') + ' is required';
        if (!formData.ownerName.trim()) return t('addListing.contactDetails.ownerName') + ' is required';
        if (!formData.ownerPhone.trim()) return t('addListing.contactDetails.phone') + ' is required';
        if (!/^[6-9]\d{9}$/.test(formData.ownerPhone.trim())) return 'Enter a valid 10-digit Indian mobile number';
        if (formData.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) return 'Enter a valid email address';
        return null;
      }
      case 1: {
        if (!formData.address.trim()) return t('addListing.locationSection.fullAddress') + ' is required';
        if (formData.address.trim().length < 5) return t('addListing.locationSection.fullAddress') + ' must be at least 5 characters';
        if (!formData.area.trim()) return t('addListing.locationSection.area') + ' is required';
        if (formData.area.trim().length < 2) return t('addListing.locationSection.area') + ' must be at least 2 characters';
        if (!formData.city.trim()) return t('addListing.locationSection.city') + ' is required';
        if (!formData.state.trim()) return t('addListing.locationSection.state') + ' is required';
        if (!/^\d{6}$/.test(formData.pincode.trim())) return 'Enter a valid 6-digit pincode';
        return null;
      }
      case 2: {
        const hasInvalidConfig = roomConfigs.some(rc => {
          const rent = parseInt(rc.rent);
          const deposit = parseInt(rc.securityDeposit);
          const rooms = parseInt(rc.availableRooms);
          return !rent || rent < 1000 || isNaN(deposit) || !rooms || rooms < 1;
        });
        if (hasInvalidConfig) return 'Fill all room configuration fields (rent must be at least ₹1,000)';
        if (!formData.totalRooms || parseInt(formData.totalRooms) < 1) return t('addListing.pricingSection.totalRooms') + ' is required';
        return null;
      }
      default:
        return null;
    }
  };

  const goToNextStep = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    // Activate guard so the Submit button (which replaces Next in the same position) can't be accidentally tapped
    setSubmitGuardActive(true);
    setCurrentStep(currentStep + 1);
    setTimeout(() => setSubmitGuardActive(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: only submit on the final step
    if (currentStep < ADD_LISTING_STEPS.length - 1) return;

    // Guard: prevent accidental submission from double-tap when step just changed
    if (submitGuardActive) return;

    setLoading(true);
    setError('');

    try {
      // Convert room configs to proper types
      const parsedConfigs: RoomConfiguration[] = roomConfigs.map(rc => ({
        sharingType: rc.sharingType,
        rent: parseInt(rc.rent) || 0,
        securityDeposit: parseInt(rc.securityDeposit) || 0,
        availableRooms: parseInt(rc.availableRooms) || 0,
      }));

      // Derive legacy single fields from lowest-rent config
      const lowestRentConfig = parsedConfigs.reduce((min, c) => c.rent < min.rent ? c : min, parsedConfigs[0]);
      const totalAvailableRooms = parsedConfigs.reduce((sum, c) => sum + c.availableRooms, 0);

      // Step 1: Create listing (without images). Send auth token if logged in so listing is linked to user.
      const token = await getIdToken?.();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/add-advertisement', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...formData,
          roomConfigurations: parsedConfigs,
          sharingOption: lowestRentConfig.sharingType,
          rent: lowestRentConfig.rent,
          securityDeposit: lowestRentConfig.securityDeposit,
          totalRooms: parseInt(formData.totalRooms) || totalAvailableRooms,
          availableRooms: totalAvailableRooms,
          rules: [
            ...formData.selectedRules,
            ...formData.customRules.split('\n').filter(r => r.trim()),
          ],
          images: [],
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to add listing');
        return;
      }

      const listingId = data.advertisementId;

      // Step 2: Upload images if any
      if (imageFiles.length > 0 && listingId) {
        setUploadProgress(t('addListing.photosSection.uploading'));
        try {
          const { uploadMultiplePGImages } = await import('@/lib/storage');
          const imageUrls = await uploadMultiplePGImages(
            imageFiles,
            listingId,
            (completed, total) => {
              setUploadProgress(`${t('addListing.photosSection.uploading')} (${completed}/${total})`);
            }
          );

          // Step 3: Update listing with image URLs (send token for ownership verification)
          if (imageUrls.length > 0) {
            setUploadProgress(t('addListing.photosSection.saving'));
            const patchHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
            const patchToken = await getIdToken?.();
            if (patchToken) patchHeaders['Authorization'] = `Bearer ${patchToken}`;
            const patchRes = await fetch('/api/add-advertisement', {
              method: 'PATCH',
              headers: patchHeaders,
              body: JSON.stringify({ listingId, images: imageUrls }),
            });
            if (!patchRes.ok) {
              const patchData = await patchRes.json().catch(() => ({}));
              console.error('Image PATCH failed:', patchData);
              setError(`Listing created but photos failed to save: ${patchData.error || 'Unknown error'}. You can add photos later from the Dashboard.`);
              setLoading(false);
              setUploadProgress('');
              return;
            }
          }
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          setError(`Listing created but photo upload failed: ${uploadErr instanceof Error ? uploadErr.message : 'Unknown error'}. You can add photos later from the Dashboard.`);
          setLoading(false);
          setUploadProgress('');
          return;
        }
      }

      setSuccess(true);
      setTimeout(() => router.push('/'), 3000);
    } catch (err: unknown) {
      setError(t('addListing.failedSubmit'));
      console.error(err);
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  // Show loading spinner while checking auth
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

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
              onClick={() => { if (index <= currentStep) setCurrentStep(index); }}
              disabled={index > currentStep}
              className={`flex items-center gap-2 flex-shrink-0 ${index > currentStep ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                index === currentStep
                  ? 'bg-primary-500 text-white'
                  : index < currentStep
                  ? 'bg-primary-50 text-primary-500'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold border ${
                  index === currentStep ? 'border-white/30' : index < currentStep ? 'border-primary-200' : 'border-gray-300'
                }`}>
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

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // Prevent Enter from submitting the form unless focus is on the submit button
            if (e.key === 'Enter' && (e.target as HTMLElement).getAttribute('type') !== 'submit') {
              e.preventDefault();
            }
          }}
        >
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
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t('addListing.contactDetails.email')}
                        <span className="text-gray-400 font-normal ml-1">({t('addListing.contactDetails.optional')})</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          placeholder={t('addListing.contactDetails.emailPlaceholder')}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.locationSection.area')}</label>
                  <input
                    type="text"
                    placeholder={t('addListing.locationSection.areaPlaceholder')}
                    required
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('addListing.locationSection.googleMapsLink')}
                    <span className="text-gray-400 font-normal ml-1">({t('addListing.contactDetails.optional')})</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      placeholder={t('addListing.locationSection.googleMapsPlaceholder')}
                      value={formData.googleMapsLink}
                      onChange={e => setFormData({ ...formData, googleMapsLink: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Room Configurations */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-primary-500" />
                {t('addListing.pricingSection.title')}
              </h2>
              <div className="space-y-5">
                {/* Room Configurations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t('addListing.pricingSection.roomConfigTitle')}</label>
                  <div className="space-y-3">
                    {roomConfigs.map((config, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 relative">
                        {roomConfigs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRoomConfig(index)}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('addListing.pricingSection.removeRoomType')}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('addListing.pricingSection.sharingType')}</label>
                            <select
                              value={config.sharingType}
                              onChange={e => updateRoomConfig(index, 'sharingType', parseInt(e.target.value))}
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            >
                              <option value={1}>{t('addListing.pricingSection.single')}</option>
                              <option value={2}>{t('addListing.pricingSection.double')}</option>
                              <option value={3}>{t('addListing.pricingSection.triple')}</option>
                              <option value={4}>{t('addListing.pricingSection.fourPlusSharing')}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('addListing.pricingSection.monthlyRent')}</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">&#8377;</span>
                              <input
                                type="number"
                                placeholder="8000"
                                required
                                value={config.rent}
                                onChange={e => updateRoomConfig(index, 'rent', e.target.value)}
                                className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('addListing.pricingSection.securityDeposit')}</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">&#8377;</span>
                              <input
                                type="number"
                                placeholder="10000"
                                required
                                value={config.securityDeposit}
                                onChange={e => updateRoomConfig(index, 'securityDeposit', e.target.value)}
                                className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('addListing.pricingSection.availableRooms')}</label>
                            <input
                              type="number"
                              placeholder="3"
                              required
                              value={config.availableRooms}
                              onChange={e => updateRoomConfig(index, 'availableRooms', e.target.value)}
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {roomConfigs.length < 4 && (
                    <button
                      type="button"
                      onClick={addRoomConfig}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-primary-300 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-50 hover:border-primary-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('addListing.pricingSection.addRoomType')}
                    </button>
                  )}
                </div>

                {/* Gender & General Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Step 3: Amenities, Photos & Rules */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Photos Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary-500" />
                  {t('addListing.photosSection.title')}
                </h2>

                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">{t('addListing.photosSection.uploadText')}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('addListing.photosSection.maxFiles')}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {imageFiles.length}/{MAX_IMAGES} {t('addListing.photosSection.photosAdded')}
                </p>
              </div>

              {/* Amenities */}
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

              {/* Rules */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" />
                  {t('addListing.amenitiesSection.rulesTitle')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                  {RULES_LIST.map((rule) => (
                    <button
                      key={rule}
                      type="button"
                      onClick={() => toggleRule(rule)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                        formData.selectedRules.includes(rule)
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {translateRule(rule)}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('addListing.amenitiesSection.customRulesLabel')}</label>
                  <textarea
                    placeholder={t('addListing.amenitiesSection.customRulesPlaceholder')}
                    rows={3}
                    value={formData.customRules}
                    onChange={e => setFormData({ ...formData, customRules: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors resize-none"
                  />
                </div>
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
                onClick={goToNextStep}
                className="px-8 py-3 text-sm font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors shadow-sm flex items-center gap-2"
              >
                {t('common.next')}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || submitGuardActive}
                className="px-8 py-3 text-sm font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (uploadProgress || t('addListing.submitting')) : t('addListing.submitListing')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
