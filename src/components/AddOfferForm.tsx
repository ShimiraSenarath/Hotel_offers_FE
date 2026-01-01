'use client';

import { useState, useEffect } from 'react';
import { X, Save, Building, MapPin, CreditCard } from 'lucide-react';
import { HotelOffer, CardType, CreateHotelOfferRequest } from '@/types';
import { useBanks, useCreateHotelOffer, useUpdateHotelOffer } from '@/hooks/useApi';
import { useLocationCascade } from '@/hooks/useLocationApi';
import MultiSelectDropdown from './MultiSelectDropdown';

interface AddOfferFormProps {
  offer?: HotelOffer;
  onSave: (success: boolean) => void;
  onCancel: () => void;
}

export default function AddOfferForm({ offer, onSave, onCancel }: AddOfferFormProps) {
  // Fetch banks
  const { data: banks, loading: banksLoading } = useBanks();
  
  // Location API
  const {
    countries,
    provinces,
    districts,
    cities,
    countriesLoading,
    provincesLoading,
    districtsLoading,
    citiesLoading,
    selectedCountry,
    selectedProvince,
    selectedDistrict,
    handleCountryChange,
    handleProvinceChange,
    handleDistrictChange,
  } = useLocationCascade();
  
  // API hooks
  const { createOffer, loading: createLoading, error: createError } = useCreateHotelOffer();
  const { updateOffer, loading: updateLoading, error: updateError } = useUpdateHotelOffer();
  
  const isEditing = !!offer;
  const isLoading = createLoading || updateLoading;
  const apiError = createError || updateError;
  const [formData, setFormData] = useState({
    hotelName: offer?.hotelName || '',
    description: offer?.description || '',
    location: {
      country: offer?.location.country || '',
      province: offer?.location.province || '',
      district: offer?.location.district || '',
      city: offer?.location.city || '',
    },
    bankIds: offer ? (offer.banks?.map(b => b.id) || (offer.bank ? [offer.bank.id] : [])) : [] as number[],
    cardTypes: offer ? (offer.cardTypes || (offer.cardType ? [offer.cardType] : [])) : [] as CardType[],
    discount: offer?.discount || 0,
    validFrom: offer?.validFrom || '',
    validTo: offer?.validTo || '',
    terms: offer?.terms || '',
    imageUrl: offer?.imageUrl || '',
    isActive: offer?.isActive ?? true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Load image preview when editing
  useEffect(() => {
    if (offer?.imageUrl) {
      // Check if it's a localStorage key
      if (offer.imageUrl.startsWith('localStorage:')) {
        const key = offer.imageUrl.replace('localStorage:', '');
        const storedImage = localStorage.getItem(key);
        if (storedImage) {
          setImagePreview(storedImage);
        }
      } else {
        // It's a regular URL
        setImagePreview(offer.imageUrl);
      }
    }
  }, [offer]);

  // Initialize location selections when editing
  useEffect(() => {
    if (offer && countries.length > 0) {
      const country = countries.find(c => c.name === offer.location.country);
      if (country) {
        handleCountryChange(country.id);
      }
    }
  }, [offer, countries, handleCountryChange]);

  useEffect(() => {
    if (offer && provinces.length > 0) {
      const province = provinces.find(p => p.name === offer.location.province);
      if (province) {
        handleProvinceChange(province.id);
      }
    }
  }, [offer, provinces, handleProvinceChange]);

  useEffect(() => {
    if (offer && districts.length > 0) {
      const district = districts.find(d => d.name === offer.location.district);
      if (district) {
        handleDistrictChange(district.id);
      }
    }
  }, [offer, districts, handleDistrictChange]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.hotelName.trim()) newErrors.hotelName = 'Hotel name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.country) newErrors.country = 'Country is required';
    if (!formData.location.province) newErrors.province = 'Province is required';
    if (!formData.location.district) newErrors.district = 'District is required';
    if (!formData.location.city) newErrors.city = 'City is required';
    if (!formData.bankIds || formData.bankIds.length === 0) newErrors.bankIds = 'At least one bank is required';
    if (!formData.cardTypes || formData.cardTypes.length === 0) newErrors.cardTypes = 'At least one card type is required';
    if (!formData.discount || formData.discount < 1 || formData.discount > 100) {
      newErrors.discount = 'Discount must be between 1 and 100';
    }
    if (!formData.validFrom) newErrors.validFrom = 'Valid from date is required';
    if (!formData.validTo) newErrors.validTo = 'Valid to date is required';
    if (!formData.terms.trim()) newErrors.terms = 'Terms are required';

    if (formData.validFrom && formData.validTo && new Date(formData.validFrom) >= new Date(formData.validTo)) {
      newErrors.validTo = 'Valid to date must be after valid from date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    
    // Remove from localStorage if it was stored there
    if (formData.imageUrl.startsWith('localStorage:')) {
      const key = formData.imageUrl.replace('localStorage:', '');
      localStorage.removeItem(key);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Save image to localStorage if a new file was uploaded
    let imageUrl = formData.imageUrl;
    if (imageFile && imagePreview) {
      const imageKey = `hotel_image_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem(imageKey, imagePreview);
      imageUrl = `localStorage:${imageKey}`;
    }

    const offerData: CreateHotelOfferRequest = {
      hotelName: formData.hotelName,
      description: formData.description,
      location: formData.location,
      bankIds: formData.bankIds,
      cardTypes: formData.cardTypes,
      discount: formData.discount,
      validFrom: formData.validFrom,
      validTo: formData.validTo,
      terms: formData.terms,
      imageUrl: imageUrl,
      isActive: formData.isActive,
    };

    let result;
    if (isEditing && offer) {
      result = await updateOffer(offer.id, offerData);
    } else {
      result = await createOffer(offerData);
    }

    onSave(result.success);
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => {
      const newLocation = { ...prev.location };
      
      if (field === 'country') {
        const country = countries.find(c => c.name === value);
        if (country) {
          handleCountryChange(country.id);
        }
        newLocation.province = '';
        newLocation.district = '';
        newLocation.city = '';
      } else if (field === 'province') {
        const province = provinces.find(p => p.name === value);
        if (province) {
          handleProvinceChange(province.id);
        }
        newLocation.district = '';
        newLocation.city = '';
      } else if (field === 'district') {
        const district = districts.find(d => d.name === value);
        if (district) {
          handleDistrictChange(district.id);
        }
        newLocation.city = '';
      }
      
      newLocation[field as keyof typeof newLocation] = value;
      
      return {
        ...prev,
        location: newLocation
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {offer ? 'Edit Hotel Offer' : 'Add New Hotel Offer'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* API Error Display */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              Error: {apiError}
            </div>
          )}

          {/* Hotel Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Hotel Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  value={formData.hotelName}
                  onChange={(e) => setFormData(prev => ({ ...prev, hotelName: e.target.value }))}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.hotelName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter hotel name"
                />
                {errors.hotelName && <p className="text-red-500 text-xs mt-1">{errors.hotelName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel Image
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Hotel preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {!imagePreview && (
                    <div className="w-full h-48 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400 text-sm">No image selected</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter hotel description"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <select
                  value={formData.location.country}
                  onChange={(e) => handleLocationChange('country', e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.country ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={countriesLoading}
                >
                  <option value="">{countriesLoading ? 'Loading countries...' : 'Select Country'}</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.name}>{country.name}</option>
                  ))}
                </select>
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province *
                </label>
                <select
                  value={formData.location.province}
                  onChange={(e) => handleLocationChange('province', e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.province ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={!formData.location.country || provincesLoading}
                >
                  <option value="">{provincesLoading ? 'Loading provinces...' : 'Select Province'}</option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.name}>{province.name}</option>
                  ))}
                </select>
                {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District *
                </label>
                <select
                  value={formData.location.district}
                  onChange={(e) => handleLocationChange('district', e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.district ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={!formData.location.province || districtsLoading}
                >
                  <option value="">{districtsLoading ? 'Loading districts...' : 'Select District'}</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.name}>{district.name}</option>
                  ))}
                </select>
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <select
                  value={formData.location.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={!formData.location.district || citiesLoading}
                >
                  <option value="">{citiesLoading ? 'Loading cities...' : 'Select City'}</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.name}>{city.name}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
            </div>
          </div>

          {/* Offer Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Offer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <MultiSelectDropdown
                  label="Banks *"
                  options={banks?.map(bank => ({ value: bank.id, label: bank.name })) || []}
                  selectedValues={formData.bankIds}
                  onChange={(selectedIds) => setFormData(prev => ({ ...prev, bankIds: selectedIds }))}
                  placeholder="Select banks"
                  error={errors.bankIds}
                  disabled={banksLoading}
                  searchable={true}
                  searchPlaceholder="Search banks..."
                  getValueKey={(value) => value}
                />
              </div>

              <div>
                <MultiSelectDropdown
                  label="Card Types *"
                  options={[
                    { value: 'CREDIT' as CardType, label: 'Credit Card' },
                    { value: 'DEBIT' as CardType, label: 'Debit Card' },
                  ]}
                  selectedValues={formData.cardTypes}
                  onChange={(selectedTypes) => setFormData(prev => ({ ...prev, cardTypes: selectedTypes }))}
                  placeholder="Select card types"
                  error={errors.cardTypes}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.discount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter discount percentage"
                />
                {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount}</p>}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active Offer
                </label>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid From *
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.validFrom ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.validFrom && <p className="text-red-500 text-xs mt-1">{errors.validFrom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid To *
                </label>
                <input
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.validTo ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.validTo && <p className="text-red-500 text-xs mt-1">{errors.validTo}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions *
              </label>
              <textarea
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                rows={3}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.terms ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter terms and conditions"
              />
              {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Offer' : 'Create Offer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
