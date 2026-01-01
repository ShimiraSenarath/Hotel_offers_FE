'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, EyeOff, Building, MapPin, CreditCard, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { HotelOffer } from '@/types';
import AddOfferForm from '@/components/AddOfferForm';
import { useAuth, useHotelOffers, useDeleteHotelOffer } from '@/hooks/useApi';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, logout, user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<HotelOffer | undefined>();
  const [currentPage, setCurrentPage] = useState(0);
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'DELETED'>('ACTIVE');
  
  // Fetch offers
  const { data: offersResponse, loading: offersLoading, error: offersError, refetch: refetchOffers } = useHotelOffers(currentPage, 50);
  const { deleteOffer, loading: deleteLoading } = useDeleteHotelOffer();
  
  const offers = offersResponse?.content || [];
  const isAdmin = user?.role === 'ADMIN';

  // Client-side search + status filter for the admin table
  // Stats use full 'offers' array; table is filtered by status + search
  const filteredOffers = offers
    .filter((offer) => {
      if (statusFilter === 'ACTIVE') {
        return offer.isActive && !offer.isDeleted;
      }
      if (statusFilter === 'INACTIVE') {
        return !offer.isActive && !offer.isDeleted;
      }
      if (statusFilter === 'DELETED') {
        return !!offer.isDeleted;
      }
      return true; // ALL
    })
    .filter((offer) => {
      if (!tableSearch.trim()) return true;

      const query = tableSearch.toLowerCase();

      const hotelName = offer.hotelName?.toLowerCase() || '';
      const description = offer.description?.toLowerCase() || '';
      const city = offer.location?.city?.toLowerCase() || '';
      const district = offer.location?.district?.toLowerCase() || '';
      const province = offer.location?.province?.toLowerCase() || '';

      const banksText =
        (offer.banks && offer.banks.length > 0
          ? offer.banks.map((b) => b.name).join(', ')
          : offer.bank?.name || ''
        ).toLowerCase();

      return (
        hotelName.includes(query) ||
        description.includes(query) ||
        city.includes(query) ||
        district.includes(query) ||
        province.includes(query) ||
        banksText.includes(query)
      );
    });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAdmin) {
        // Redirect non-admin users to home page
        router.push('/');
      }
    }
  }, [isAuthenticated, authLoading, isAdmin, router]);

  const handleAddOffer = async (success: boolean) => {
    if (success) {
      setShowAddForm(false);
      refetchOffers(); // Refresh the offers list
    }
  };

  const handleEditOffer = async (success: boolean) => {
    if (success) {
      setEditingOffer(undefined);
      refetchOffers(); // Refresh the offers list
    }
  };

  const handleDeleteOffer = async (offerId: number) => {
    const offer = offers.find(o => o.id === offerId);
    const offerName = offer?.hotelName || 'this offer';
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `<p class="text-gray-700 mb-2">You are about to delete:</p><p class="font-semibold text-lg text-gray-900">${offerName}</p><p class="text-red-600 mt-2">This action cannot be undone!</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-6 py-2 rounded-lg font-semibold',
        cancelButton: 'px-6 py-2 rounded-lg font-semibold',
      },
    });

    if (result.isConfirmed) {
      const deleteResult = await deleteOffer(offerId);
      if (deleteResult.success) {
        // Force refresh immediately before showing success message
        refetchOffers();
        
        // Show success message
        await Swal.fire({
          title: 'Deleted!',
          text: `${offerName} has been deleted successfully.`,
          icon: 'success',
          confirmButtonColor: '#2563eb',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        // Show error message
        await Swal.fire({
          title: 'Error!',
          text: deleteResult.error || 'Failed to delete the offer. Please try again.',
          icon: 'error',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK',
        });
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect to login or home
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Manage hotel offers and bookings</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Offer
          </button>
          {/* <button
            onClick={handleLogout}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Logout
          </button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {/* Total Offers (resets status filter to ALL) */}
        <div
          className={`bg-white p-6 rounded-lg shadow-md border cursor-pointer transition ${
            statusFilter === 'ALL' ? 'border-blue-500 ring-1 ring-blue-200' : 'border-transparent hover:border-gray-200'
          }`}
          onClick={() => setStatusFilter('ALL')}
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Offers</p>
              <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
            </div>
          </div>
        </div>

        {/* Active Offers */}
        <div
          className={`bg-white p-6 rounded-lg shadow-md border cursor-pointer transition ${
            statusFilter === 'ACTIVE' ? 'border-green-500 ring-1 ring-green-200' : 'border-transparent hover:border-gray-200'
          }`}
          onClick={() => setStatusFilter('ACTIVE')}
        >
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Offers</p>
              <p className="text-2xl font-bold text-gray-900">
                {offers.filter(offer => offer.isActive).length}
              </p>
            </div>
          </div>
        </div>

        {/* Inactive Offers */}
        <div
          className={`bg-white p-6 rounded-lg shadow-md border cursor-pointer transition ${
            statusFilter === 'INACTIVE' ? 'border-yellow-500 ring-1 ring-yellow-200' : 'border-transparent hover:border-gray-200'
          }`}
          onClick={() => setStatusFilter('INACTIVE')}
        >
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <EyeOff className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Offers</p>
              <p className="text-2xl font-bold text-gray-900">
                {offers.filter(offer => !offer.isActive && !offer.isDeleted).length}
              </p>
            </div>
          </div>
        </div>

        {/* Deleted Offers */}
        <div
          className={`bg-white p-6 rounded-lg shadow-md border cursor-pointer transition ${
            statusFilter === 'DELETED' ? 'border-red-500 ring-1 ring-red-200' : 'border-transparent hover:border-gray-200'
          }`}
          onClick={() => setStatusFilter('DELETED')}
        >
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Deleted Offers</p>
              <p className="text-2xl font-bold text-gray-900">
                {offers.filter(offer => offer.isDeleted).length}
              </p>
            </div>
          </div>
        </div>

        {/* Avg Discount (no filter change) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Discount</p>
              <p className="text-2xl font-bold text-gray-900">
                {offers.length > 0 
                  ? Math.round(offers.reduce((sum, offer) => sum + offer.discount, 0) / offers.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        
      </div>

      {/* Error Display */}
      {offersError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
          Error loading offers: {offersError}
        </div>
      )}

      {/* Offers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Hotel Offers</h2>

          {/* Table Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search by hotel, location, or bank..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Until
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {offersLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading offers...</p>
                  </td>
                </tr>
              ) : filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    No offers match your search.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{offer.hotelName}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {offer.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{offer.location.city}</div>
                    <div className="text-sm text-gray-500">{offer.location.district}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {offer.banks && offer.banks.length > 0 
                        ? offer.banks.map(b => b.name).join(', ')
                        : offer.bank?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {offer.cardTypes && offer.cardTypes.length > 0
                        ? offer.cardTypes.map(ct => ct.charAt(0) + ct.slice(1).toLowerCase() + ' Card').join(', ')
                        : offer.cardType 
                          ? offer.cardType.charAt(0) + offer.cardType.slice(1).toLowerCase() + ' Card'
                          : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      {offer.discount}% OFF
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {offer.isDeleted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Deleted
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        offer.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {offer.isActive ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(offer.validTo).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingOffer(offer)}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-40"
                        title="Edit offer"
                        disabled={offer.isDeleted}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Delete offer"
                        disabled={deleteLoading || offer.isDeleted}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!offersLoading && offers.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hotel offers found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first hotel offer</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Offer
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <AddOfferForm
          onSave={handleAddOffer}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingOffer && (
        <AddOfferForm
          offer={editingOffer}
          onSave={handleEditOffer}
          onCancel={() => setEditingOffer(undefined)}
        />
      )}
    </div>
  );
}
