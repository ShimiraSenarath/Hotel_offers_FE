'use client';

import { X, MapPin, Building, CreditCard, Calendar } from 'lucide-react';
import { HotelOffer } from '@/types';
import Link from 'next/link';

interface CompareOffersDialogProps {
  offers: HotelOffer[];
  isOpen: boolean;
  onClose: () => void;
}

export default function CompareOffersDialog({ offers, isOpen, onClose }: CompareOffersDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Compare Offers ({offers.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {offers.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No offers selected</h3>
              <p className="text-gray-600">Select offers from the list to compare them</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  {/* Hotel Name */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.hotelName}</h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {offer.discount}% OFF
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {offer.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start text-sm text-gray-700">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{offer.location.city}</div>
                        <div className="text-gray-500 text-xs">
                          {offer.location.district}, {offer.location.province}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-700">
                      <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>
                        {offer.banks && offer.banks.length > 0 
                          ? offer.banks.map(b => b.name).join(', ')
                          : offer.bank?.name || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-700">
                      <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>
                        {offer.cardTypes && offer.cardTypes.length > 0
                          ? offer.cardTypes.map(ct => ct.charAt(0) + ct.slice(1).toLowerCase() + ' Card').join(', ')
                          : offer.cardType 
                            ? offer.cardType.charAt(0) + offer.cardType.slice(1).toLowerCase() + ' Card'
                            : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div className="text-xs">
                        <div>From: {new Date(offer.validFrom).toLocaleDateString()}</div>
                        <div>To: {new Date(offer.validTo).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  {offer.terms && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">Terms & Conditions:</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{offer.terms}</p>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      offer.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Link
                      href={`/hotel-offers/${offer.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={onClose}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

