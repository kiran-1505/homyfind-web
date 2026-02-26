'use client';

import { useState, useEffect, useRef } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import {
  ArrowLeft, LogOut, Plus, Pencil, Trash2, X, Save, Loader2,
  Home, MapPin, Utensils, Wifi, Camera, CheckCircle,
  AlertTriangle, IndianRupee
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { logOut } from '@/lib/auth';
import { AMENITIES_LIST, AMENITY_KEYS, MAX_IMAGES, MAX_IMAGE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '@/constants';
import type { PGAdvertisement } from '@/lib/firestore';
import type { RoomConfiguration } from '@/types';

interface RoomConfigFormData {
  sharingType: number;
  rent: string;
  securityDeposit: string;
  availableRooms: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const t = useTranslations();
  const { user, loading: authLoading, isAuthenticated, phoneNumber, email, getIdToken } = useAuth();

  const [listings, setListings] = useState<PGAdvertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit form state
  const [editDescription, setEditDescription] = useState('');
  const [editAmenities, setEditAmenities] = useState<string[]>([]);
  const [editRoomConfigs, setEditRoomConfigs] = useState<RoomConfigFormData[]>([]);
  const [editFoodIncluded, setEditFoodIncluded] = useState(false);
  const [editAvailableFrom, setEditAvailableFrom] = useState('');
  const [editTotalRooms, setEditTotalRooms] = useState('');
  const [editGender, setEditGender] = useState<'Male' | 'Female' | 'Any'>('Any');
  const [editRules, setEditRules] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch listings using authenticated token
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      if (!authLoading) setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchListings() {
      try {
        const token = await getIdToken();
        if (!token || cancelled) return;

        const res = await fetch('/api/owner/listings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled && data.success) {
          setListings(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchListings();
    return () => { cancelled = true; };
  }, [authLoading, isAuthenticated, getIdToken]);

  const translateAmenity = (amenity: string) => {
    const key = AMENITY_KEYS[amenity];
    return key ? t(`amenityNames.${key}`) : amenity;
  };

  const handleLogout = async () => {
    await logOut();
    router.replace('/');
  };

  // Start editing a listing
  const startEdit = (listing: PGAdvertisement) => {
    setEditingId(listing.id || null);
    setEditDescription(listing.description || '');
    setEditAmenities([...listing.amenities]);
    setEditRoomConfigs(
      listing.roomConfigurations.map(rc => ({
        sharingType: rc.sharingType,
        rent: String(rc.rent),
        securityDeposit: String(rc.securityDeposit),
        availableRooms: String(rc.availableRooms),
      }))
    );
    setEditFoodIncluded(listing.foodIncluded);
    setEditAvailableFrom(listing.availableFrom || '');
    setEditTotalRooms(String(listing.totalRooms || ''));
    setEditGender(listing.preferredGender);
    setEditRules((listing.rules || []).join('\n'));
    setEditImages([...listing.images]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setSaveMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSaveMessage(null);
  };

  // Room config helpers
  const addRoomConfig = () => {
    if (editRoomConfigs.length >= 4) return;
    setEditRoomConfigs([...editRoomConfigs, { sharingType: 1, rent: '', securityDeposit: '', availableRooms: '' }]);
  };

  const removeRoomConfig = (index: number) => {
    if (editRoomConfigs.length <= 1) return;
    setEditRoomConfigs(editRoomConfigs.filter((_, i) => i !== index));
  };

  const updateRoomConfig = (index: number, field: keyof RoomConfigFormData, value: string | number) => {
    const updated = [...editRoomConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setEditRoomConfigs(updated);
  };

  // Image helpers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return false;
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) return false;
      return true;
    });

    const remaining = MAX_IMAGES - editImages.length - newImageFiles.length;
    const filesToAdd = validFiles.slice(0, remaining);

    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setNewImageFiles(prev => [...prev, ...filesToAdd]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeExistingImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Save changes
  const handleSave = async (listingId: string) => {
    setSaving(true);
    setSaveMessage(null);

    try {
      // Upload new images if any
      let allImages = [...editImages];
      if (newImageFiles.length > 0) {
        setUploadProgress(t('addListing.photosSection.uploading'));
        const { uploadMultiplePGImages } = await import('@/lib/storage');
        const uploadedUrls = await uploadMultiplePGImages(
          newImageFiles,
          listingId,
          (completed, total) => {
            setUploadProgress(`${t('addListing.photosSection.uploading')} (${completed}/${total})`);
          }
        );
        allImages = [...allImages, ...uploadedUrls];
      }

      // Build room configurations
      const parsedConfigs: RoomConfiguration[] = editRoomConfigs.map(rc => ({
        sharingType: rc.sharingType,
        rent: parseInt(rc.rent) || 0,
        securityDeposit: parseInt(rc.securityDeposit) || 0,
        availableRooms: parseInt(rc.availableRooms) || 0,
      }));

      const lowestRentConfig = parsedConfigs.reduce((min, c) => c.rent < min.rent ? c : min, parsedConfigs[0]);
      const totalAvailableRooms = parsedConfigs.reduce((sum, c) => sum + c.availableRooms, 0);

      const token = await getIdToken();
      if (!token) {
        setSaveMessage({ type: 'error', text: 'Authentication expired. Please log in again.' });
        setSaving(false);
        return;
      }

      const response = await fetch('/api/owner/update-listing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          listingId,
          updates: {
            description: editDescription,
            amenities: editAmenities,
            roomConfigurations: parsedConfigs,
            foodIncluded: editFoodIncluded,
            availableFrom: editAvailableFrom,
            totalRooms: parseInt(editTotalRooms) || totalAvailableRooms,
            availableRooms: totalAvailableRooms,
            preferredGender: editGender,
            rules: editRules.split('\n').filter(r => r.trim()),
            images: allImages,
            rent: lowestRentConfig.rent,
            securityDeposit: lowestRentConfig.securityDeposit,
            sharingOption: lowestRentConfig.sharingType,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveMessage({ type: 'success', text: t('dashboard.changesSaved') });
        // Update local listings state
        setListings(prev => prev.map(l =>
          l.id === listingId
            ? {
                ...l,
                description: editDescription,
                amenities: editAmenities,
                roomConfigurations: parsedConfigs,
                foodIncluded: editFoodIncluded,
                availableFrom: editAvailableFrom,
                totalRooms: parseInt(editTotalRooms) || totalAvailableRooms,
                availableRooms: totalAvailableRooms,
                preferredGender: editGender,
                rules: editRules.split('\n').filter(r => r.trim()),
                images: allImages,
                rent: lowestRentConfig.rent,
                securityDeposit: lowestRentConfig.securityDeposit,
                sharingOption: lowestRentConfig.sharingType,
              }
            : l
        ));
        setTimeout(() => setEditingId(null), 1500);
      } else {
        setSaveMessage({ type: 'error', text: data.error || t('dashboard.saveFailed') });
      }
    } catch (err) {
      console.error('Error saving:', err);
      setSaveMessage({ type: 'error', text: t('dashboard.saveFailed') });
    } finally {
      setSaving(false);
      setUploadProgress('');
    }
  };

  // Delete listing
  const handleDelete = async (listingId: string) => {
    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch('/api/owner/update-listing', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingId }),
      });

      const data = await response.json();
      if (data.success) {
        setListings(prev => prev.filter(l => l.id !== listingId));
      }
    } catch (err) {
      console.error('Error deleting:', err);
    } finally {
      setDeleteId(null);
    }
  };

  // Loading states
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1.5 -ml-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold text-gray-900">{t('dashboard.pageTitle')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Top bar with Add button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('dashboard.welcomeBack', { name: user?.displayName || phoneNumber || email || '' })}
            </h2>
            <p className="text-sm text-gray-500">{t('dashboard.subtitle')}</p>
          </div>
          <Link
            href="/add-listing"
            className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t('dashboard.addAdvertisement')}
          </Link>
        </div>

        {loading ? (
          /* Loading State */
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Home className="w-10 h-10 text-primary-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('dashboard.noListings')}</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">{t('dashboard.noListingsDesc')}</p>
            <Link
              href="/add-listing"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              {t('dashboard.placeYourAd')}
            </Link>
          </div>
        ) : (
          /* Listings */
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Listing Summary */}
                <div className="p-5">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                      {listing.images && listing.images.length > 0 ? (
                        <Image src={listing.images[0]} alt={listing.pgName} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Home className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base truncate">{listing.pgName}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{listing.address}, {listing.city}</span>
                          </p>
                        </div>
                        <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          listing.verified
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-50 text-gray-500 border border-gray-200'
                        }`}>
                          {listing.verified ? t('common.verified') : 'Free'}
                        </span>
                      </div>

                      {/* Room configs summary */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {listing.roomConfigurations?.map((rc, idx) => (
                          <span key={idx} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-lg font-medium">
                            {rc.sharingType} {t('common.sharing')} — ₹{rc.rent.toLocaleString('en-IN')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {editingId !== listing.id && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => startEdit(listing)}
                        className="flex-1 px-4 py-2.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        {t('dashboard.editListing')}
                      </button>
                      <button
                        onClick={() => setDeleteId(listing.id || null)}
                        className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('dashboard.deleteListing')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline Edit Form */}
                {editingId === listing.id && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50/50 space-y-5">
                    {saveMessage && (
                      <div className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
                        saveMessage.type === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {saveMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {saveMessage.text}
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('dashboard.editDescription')}</label>
                      <textarea
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    {/* Photos */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('dashboard.editPhotos')}</label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {editImages.map((img, idx) => (
                          <div key={`existing-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <Image src={img} alt={`Photo ${idx + 1}`} fill className="object-cover" unoptimized />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {newImagePreviews.map((img, idx) => (
                          <div key={`new-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-dashed border-primary-300">
                            <Image src={img} alt={`New ${idx + 1}`} fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => removeNewImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {(editImages.length + newImageFiles.length) < MAX_IMAGES && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50/30 flex flex-col items-center justify-center text-gray-400 hover:text-primary-500 transition-colors"
                          >
                            <Camera className="w-5 h-5" />
                            <span className="text-xs mt-1">{t('dashboard.addPhotos')}</span>
                          </button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>

                    {/* Room Configurations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('dashboard.editPricing')}</label>
                      <div className="space-y-2">
                        {editRoomConfigs.map((config, index) => (
                          <div key={index} className="bg-white rounded-xl p-3 relative border border-gray-200">
                            {editRoomConfigs.length > 1 && (
                              <button type="button" onClick={() => removeRoomConfig(index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-lg">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">{t('addListing.pricingSection.sharingType')}</label>
                                <select
                                  value={config.sharingType}
                                  onChange={e => updateRoomConfig(index, 'sharingType', parseInt(e.target.value))}
                                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                >
                                  <option value={1}>{t('addListing.pricingSection.single')}</option>
                                  <option value={2}>{t('addListing.pricingSection.double')}</option>
                                  <option value={3}>{t('addListing.pricingSection.triple')}</option>
                                  <option value={4}>{t('addListing.pricingSection.fourPlusSharing')}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">{t('addListing.pricingSection.monthlyRent')}</label>
                                <input
                                  type="number"
                                  value={config.rent}
                                  onChange={e => updateRoomConfig(index, 'rent', e.target.value)}
                                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">{t('addListing.pricingSection.securityDeposit')}</label>
                                <input
                                  type="number"
                                  value={config.securityDeposit}
                                  onChange={e => updateRoomConfig(index, 'securityDeposit', e.target.value)}
                                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">{t('addListing.pricingSection.availableRooms')}</label>
                                <input
                                  type="number"
                                  value={config.availableRooms}
                                  onChange={e => updateRoomConfig(index, 'availableRooms', e.target.value)}
                                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {editRoomConfigs.length < 4 && (
                        <button type="button" onClick={addRoomConfig} className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-primary-300 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-50 transition-colors">
                          <Plus className="w-4 h-4" />
                          {t('addListing.pricingSection.addRoomType')}
                        </button>
                      )}
                    </div>

                    {/* Amenities */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('dashboard.editAmenities')}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {AMENITIES_LIST.map(amenity => (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => setEditAmenities(prev =>
                              prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
                            )}
                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                              editAmenities.includes(amenity)
                                ? 'bg-primary-500 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {translateAmenity(amenity)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Other fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.pricingSection.preferredGender')}</label>
                        <select
                          value={editGender}
                          onChange={e => setEditGender(e.target.value as 'Male' | 'Female' | 'Any')}
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
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
                          value={editTotalRooms}
                          onChange={e => setEditTotalRooms(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('dashboard.editAvailability')}</label>
                        <input
                          type="date"
                          value={editAvailableFrom}
                          onChange={e => setEditAvailableFrom(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Food included */}
                    <label className="flex items-center gap-3 p-3 bg-green-50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFoodIncluded}
                        onChange={e => setEditFoodIncluded(e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">{t('addListing.pricingSection.foodIncluded')}</span>
                      </div>
                    </label>

                    {/* Rules */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addListing.amenitiesSection.rulesTitle')}</label>
                      <textarea
                        value={editRules}
                        onChange={e => setEditRules(e.target.value)}
                        rows={3}
                        placeholder={t('addListing.amenitiesSection.rulesPlaceholder')}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    {/* Save / Cancel buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={cancelEdit}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={() => listing.id && handleSave(listing.id)}
                        disabled={saving}
                        className="flex-1 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {uploadProgress || t('dashboard.savingChanges')}
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {t('common.save')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{t('dashboard.deleteConfirm')}</h3>
            <p className="text-sm text-gray-500 text-center mb-6">{t('dashboard.deleteConfirmDesc')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                {t('dashboard.cancelDelete')}
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
              >
                {t('dashboard.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
