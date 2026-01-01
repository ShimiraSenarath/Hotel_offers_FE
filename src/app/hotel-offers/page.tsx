'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, MapPin, Building, CreditCard, GitCompare, Grid3x3, List } from 'lucide-react';
import { HotelOffer, FilterOptions } from '@/types';
import { useSearchHotelOffers, useBanks } from '@/hooks/useApi';
import { countries, provinces, districts, cities } from '@/data/mockData';
import CompareOffersDialog from '@/components/CompareOffersDialog';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';
import Link from 'next/link';

export default function HotelOffersPage() {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedOffersMap, setSelectedOffersMap] = useState<Map<number, HotelOffer>>(new Map());
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const pageSize = 20;

  // Fetch banks
  const { data: banks, loading: banksLoading } = useBanks();

  // Fetch hotel offers with search and filters
  const searchParams = {
    ...filters.place,
    bankId: filters.bank,
    cardType: filters.cardType,
    page: currentPage,
    size: pageSize,
  };

  const { data: offersResponse, loading: offersLoading, error: offersError } = useSearchHotelOffers(searchParams);

  // Get offers from API response
  const offers = offersResponse?.content || [];
  const totalOffers = offersResponse?.totalElements || 0;

  // Client-side text search filter (backend doesn't support text search)
  const filteredOffers = useMemo(() => {
    if (!searchTerm) return offers;
    
    return offers.filter(offer => 
      offer.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [offers, searchTerm]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(0);
  };

  const getDistrictsForProvince = (province: string) => {
    return districts[province as keyof typeof districts] || [];
  };

  const getCitiesForDistrict = (district: string) => {
    return cities[district as keyof typeof cities] || [];
  };

  const handleOfferSelect = (offer: HotelOffer) => {
    setSelectedOffersMap(prev => {
      const newMap = new Map(prev);
      if (newMap.has(offer.id)) {
        newMap.delete(offer.id);
      } else {
        newMap.set(offer.id, offer);
      }
      return newMap;
    });
  };

  const handleCompareOffers = () => {
    setIsCompareDialogOpen(true);
  };

  // Update selected offers with latest data if they appear in filtered results
  useEffect(() => {
    setSelectedOffersMap(prev => {
      const newMap = new Map(prev);
      filteredOffers.forEach(offer => {
        if (newMap.has(offer.id)) {
          // Update with latest offer data
          newMap.set(offer.id, offer);
        }
      });
      return newMap;
    });
  }, [filteredOffers]);

  const selectedOffersData = useMemo(() => {
    return Array.from(selectedOffersMap.values());
  }, [selectedOffersMap]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Hotel Offers</h1>
        <p className="text-lg text-gray-600">
          Discover exclusive hotel deals and discounts from top banks
        </p>
      </div>

      {/* Two Column Layout: Filters Left, Results Right */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar - Filters */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h2>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hotels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-6">
              {/* Place Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </label>
                <div className="space-y-3">
                  <select
                    value={filters.place?.country || ''}
                    onChange={(e) => handleFilterChange('place', { ...filters.place, country: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>

                  <select
                    value={filters.place?.province || ''}
                    onChange={(e) => handleFilterChange('place', { 
                      ...filters.place, 
                      province: e.target.value,
                      district: '',
                      city: ''
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!filters.place?.country}
                  >
                    <option value="">Select Province</option>
                    {provinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>

                  <select
                    value={filters.place?.district || ''}
                    onChange={(e) => handleFilterChange('place', { 
                      ...filters.place, 
                      district: e.target.value,
                      city: ''
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!filters.place?.province}
                  >
                    <option value="">Select District</option>
                    {getDistrictsForProvince(filters.place?.province || '').map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>

                  <select
                    value={filters.place?.city || ''}
                    onChange={(e) => handleFilterChange('place', { 
                      ...filters.place, 
                      city: e.target.value 
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!filters.place?.district}
                  >
                    <option value="">Select City</option>
                    {getCitiesForDistrict(filters.place?.district || '').map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bank Filter - Multiple Selection with Search */}
              <div>
                <div className="flex items-center mb-1">
                  <Building className="h-4 w-4 inline mr-1 text-gray-700" />
                  <label className="block text-sm font-medium text-gray-700">
                    Bank (Select Multiple)
                  </label>
                </div>
                <MultiSelectDropdown<number>
                  options={banksLoading ? [] : (banks?.map(bank => ({ value: bank.id, label: bank.name })) || [])}
                  selectedValues={Array.isArray(filters.bank) ? filters.bank : (filters.bank ? [filters.bank] : [])}
                  onChange={(selectedIds: number[]) => {
                    handleFilterChange('bank', selectedIds.length > 0 ? selectedIds : undefined);
                  }}
                  placeholder="Select banks"
                  disabled={banksLoading}
                  searchable={true}
                  searchPlaceholder="Search banks..."
                  getValueKey={(value: number) => value}
                />
              </div>

              {/* Card Type Filter - Multiple Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="h-4 w-4 inline mr-1" />
                  Card Type (Select Multiple)
                </label>
                <div className="border border-gray-300 rounded-lg p-3 bg-white">
                  <div className="space-y-2">
                    {(['CREDIT', 'DEBIT'] as const).map(cardType => {
                      const selectedCardTypes = Array.isArray(filters.cardType) ? filters.cardType : (filters.cardType ? [filters.cardType] : []);
                      const isSelected = selectedCardTypes.includes(cardType);
                      return (
                        <label key={cardType} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const selectedCardTypes = Array.isArray(filters.cardType) ? filters.cardType : (filters.cardType ? [filters.cardType] : []);
                              if (e.target.checked) {
                                handleFilterChange('cardType', [...selectedCardTypes, cardType]);
                              } else {
                                const newCardTypes = selectedCardTypes.filter(type => type !== cardType);
                                handleFilterChange('cardType', newCardTypes.length > 0 ? newCardTypes : undefined);
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {cardType.charAt(0) + cardType.slice(1).toLowerCase()} Card
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Hotel Offers Grid */}
        <div className="flex-1 min-w-0">
          {/* Results Count and View Toggle */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
            <p className="text-gray-600">
              Showing {filteredOffers.length} hotel offer{filteredOffers.length !== 1 ? 's' : ''}
              {(Array.isArray(filters.bank) && filters.bank.length > 0) || 
               (Array.isArray(filters.cardType) && filters.cardType.length > 0) ? 
               ' (filtered)' : ''}
            </p>
            <div className="flex items-center gap-3">
              {/* View Toggle Buttons */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors border-l border-gray-300 ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-label="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
              
              {selectedOffersMap.size > 0 && (
                <>
                  <button
                    onClick={handleCompareOffers}
                    disabled={selectedOffersMap.size === 0}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    <GitCompare className="h-4 w-4" />
                    Compare Offers ({selectedOffersMap.size})
                  </button>
                  <button
                    onClick={() => setSelectedOffersMap(new Map())}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear Selection
                  </button>
                </>
              )}
            </div>
          </div>
          
          {offersError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
              Error loading offers: {offersError}
            </div>
          )}

          {/* Loading State */}
          {offersLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading hotel offers...</p>
            </div>
          )}

          {/* Hotel Offers - Grid or List View */}
          {!offersLoading && (
            viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOffers.map(offer => (
                  <div key={offer.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative flex flex-col">
                    {/* Selection Checkbox */}
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedOffersMap.has(offer.id)}
                        onChange={() => handleOfferSelect(offer)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        aria-label={`Select ${offer.hotelName} for comparison`}
                      />
                    </div>

                    {/* Thumbnail Image - Always shown */}
                    <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                      {offer.imageUrl ? (
                        <img
                          src={offer.imageUrl.startsWith('localStorage:') 
                            ? localStorage.getItem(offer.imageUrl.replace('localStorage:', '')) || ''
                            : offer.imageUrl}
                          alt={offer.hotelName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="text-gray-400 text-center">
                                  <svg class="h-16 w-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                  </svg>
                                  <p class="text-sm">No Image</p>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <Building className="h-16 w-16 mx-auto mb-2" />
                          <p className="text-sm">No Image</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Details Section - Consistent padding and layout */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Title and Discount Badge */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 pr-2 flex-1">{offer.hotelName}</h3>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium flex-shrink-0">
                          {offer.discount}% OFF
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                        {offer.description}
                      </p>

                      {/* Details - All at same level */}
                      <div className="space-y-2 mb-4 flex-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{offer.location.city}, {offer.location.district}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {offer.banks && offer.banks.length > 0 
                              ? offer.banks.map(b => b.name).join(', ')
                              : offer.bank?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {offer.cardTypes && offer.cardTypes.length > 0
                              ? offer.cardTypes.map(ct => ct.charAt(0) + ct.slice(1).toLowerCase() + ' Card').join(', ')
                              : offer.cardType 
                                ? offer.cardType.charAt(0) + offer.cardType.slice(1).toLowerCase() + ' Card'
                                : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>Valid: {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validTo).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-auto">
                        <Link
                          href={`/hotel-offers/${offer.id}`}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                        >
                          View Details
                        </Link>
                        <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {filteredOffers.map(offer => (
                  <div key={offer.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative flex flex-col md:flex-row">
                    {/* Selection Checkbox */}
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedOffersMap.has(offer.id)}
                        onChange={() => handleOfferSelect(offer)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        aria-label={`Select ${offer.hotelName} for comparison`}
                      />
                    </div>

                    {/* Thumbnail Image - Always shown */}
                    <div className="w-full md:w-64 h-48 md:h-auto bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {offer.imageUrl ? (
                        <img
                          src={offer.imageUrl.startsWith('localStorage:') 
                            ? localStorage.getItem(offer.imageUrl.replace('localStorage:', '')) || ''
                            : offer.imageUrl}
                          alt={offer.hotelName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="text-gray-400 text-center">
                                  <svg class="h-16 w-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                  </svg>
                                  <p class="text-sm">No Image</p>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <Building className="h-16 w-16 mx-auto mb-2" />
                          <p className="text-sm">No Image</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Details Section */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Title and Discount Badge */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 pr-2 flex-1">{offer.hotelName}</h3>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex-shrink-0">
                          {offer.discount}% OFF
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {offer.description}
                      </p>

                      {/* Details - Grid layout for list view */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{offer.location.city}, {offer.location.district}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>
                            {offer.banks && offer.banks.length > 0 
                              ? offer.banks.map(b => b.name).join(', ')
                              : offer.bank?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>
                            {offer.cardTypes && offer.cardTypes.length > 0
                              ? offer.cardTypes.map(ct => ct.charAt(0) + ct.slice(1).toLowerCase() + ' Card').join(', ')
                              : offer.cardType 
                                ? offer.cardType.charAt(0) + offer.cardType.slice(1).toLowerCase() + ' Card'
                                : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>Valid: {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validTo).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-auto">
                        <Link
                          href={`/hotel-offers/${offer.id}`}
                          className="bg-blue-600 text-white py-2 px-6 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                        >
                          View Details
                        </Link>
                        <button className="border border-blue-600 text-blue-600 py-2 px-6 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* No Results */}
          {!offersLoading && filteredOffers.length === 0 && (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hotel offers found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compare Offers Dialog */}
      <CompareOffersDialog
        offers={selectedOffersData}
        isOpen={isCompareDialogOpen}
        onClose={() => setIsCompareDialogOpen(false)}
      />
    </div>
  );
}
