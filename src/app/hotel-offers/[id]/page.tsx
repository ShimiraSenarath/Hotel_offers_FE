'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Building, 
  CreditCard, 
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useHotelOfferById } from '@/hooks/useApi';
import Link from 'next/link';

export default function HotelOfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params?.id ? parseInt(params.id as string) : null;
  
  const { data: offer, loading, error } = useHotelOfferById(offerId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The hotel offer you are looking for does not exist.'}</p>
          <Link
            href="/hotel-offers"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Offers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/hotel-offers" className="hover:text-gray-900">Hotel Offers</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{offer.hotelName}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Main Content - Image Left, Details Right */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Side - Image */}
            <div className="bg-gray-100">
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
                        <div class="h-full min-h-[500px] flex items-center justify-center">
                          <div class="text-center text-gray-400">
                            <svg class="h-24 w-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                            <p class="text-lg">Hotel Image</p>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="h-full min-h-[500px] flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Building className="h-24 w-24 mx-auto mb-4" />
                    <p className="text-lg">Hotel Image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Details */}
            <div className="p-8 lg:p-12">
              {/* Collection/Bank Badge */}
              <div className="mb-4">
                <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                  {offer.banks && offer.banks.length > 0 
                    ? offer.banks.map(b => b.name).join(', ')
                    : offer.bank?.name || 'N/A'}
                </span>
              </div>

              {/* Hotel Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {offer.hotelName}
              </h1>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {offer.discount}% OFF
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    Special Offer
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  (Terms and conditions apply)
                </p>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  offer.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {offer.isActive ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Active Offer
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Inactive Offer
                    </>
                  )}
                </span>
              </div>

              {/* Card Type Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Card Types
                </h3>
                <div className="flex gap-2">
                  {(['CREDIT', 'DEBIT'] as const).map(cardType => {
                    const cardTypes = offer.cardTypes || (offer.cardType ? [offer.cardType] : []);
                    const isSelected = cardTypes.includes(cardType);
                    return (
                      <button
                        key={cardType}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          isSelected
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {cardType.charAt(0) + cardType.slice(1).toLowerCase()} Card
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-red-600 mt-2">
                  Valid for {offer.cardTypes && offer.cardTypes.length > 0
                    ? offer.cardTypes.map(ct => ct.charAt(0) + ct.slice(1).toLowerCase() + ' Card').join(' and ')
                    : offer.cardType 
                      ? offer.cardType.charAt(0) + offer.cardType.slice(1).toLowerCase() + ' Card'
                      : 'N/A'} holders only
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mb-8 flex gap-4">
                <button className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Save Offer
                </button>
                <button className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Book Now
                </button>
              </div>

              {/* Product Details */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Offer Details
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {offer.description}
                </p>
              </div>

              {/* Location & Bank Info */}
              <div className="mb-6 space-y-3">
                <div className="flex items-start text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-gray-400" />
                  <div>
                    <div className="font-medium">{offer.location.city}</div>
                    <div className="text-sm text-gray-500">
                      {offer.location.district}, {offer.location.province}, {offer.location.country}
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Building className="h-5 w-5 mr-3 flex-shrink-0 text-gray-400" />
                  <span>
                    {offer.banks && offer.banks.length > 0 
                      ? offer.banks.map(b => b.name).join(', ')
                      : offer.bank?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CreditCard className="h-5 w-5 mr-3 flex-shrink-0 text-gray-400" />
                  <span>
                    {offer.cardTypes && offer.cardTypes.length > 0
                      ? offer.cardTypes.map(ct => ct.charAt(0) + ct.slice(1).toLowerCase() + ' Card').join(', ')
                      : offer.cardType 
                        ? offer.cardType.charAt(0) + offer.cardType.slice(1).toLowerCase() + ' Card'
                        : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 flex-shrink-0 text-gray-400" />
                  <div className="text-sm">
                    <div>Valid from: {new Date(offer.validFrom).toLocaleDateString()}</div>
                    <div>Valid until: {new Date(offer.validTo).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              {offer.terms && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Terms & Conditions
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {offer.terms}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

