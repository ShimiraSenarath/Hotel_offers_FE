import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { api, setLogoutCallback, isTokenExpired, getUserFromToken } from '@/lib/api';
import { 
  Bank, 
  HotelOffer, 
  PaginatedResponse, 
  LoginCredentials, 
  LoginResponse, 
  CreateHotelOfferRequest,
  User
} from '@/types';

// Custom hook for data fetching
function useApiData<T>(
  apiCall: () => Promise<{ data?: T; error?: string; success: boolean }>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, refreshKey]);

  const refetch = useCallback(async () => {
    setRefreshKey(prev => prev + 1);
    // Also directly call fetchData to ensure immediate refresh
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Banks
export function useBanks() {
  return useApiData<Bank[]>(() => api.getBanks(), []);
}

// Hotel Offers
export function useHotelOffers(page: number = 0, size: number = 20) {
  return useApiData<PaginatedResponse<HotelOffer>>(
    () => api.getHotelOffers(page, size),
    [page, size]
  );
}

export function useSearchHotelOffers(params: {
  country?: string;
  province?: string;
  district?: string;
  city?: string;
  bankId?: number | number[];
  cardType?: string | string[];
  page?: number;
  size?: number;
}) {
  // Memoize the params to avoid unnecessary re-renders
  const paramsKey = useMemo(() => {
    // Stringify arrays properly for comparison
    const bankIdKey = Array.isArray(params.bankId) 
      ? params.bankId.sort().join(',') 
      : params.bankId;
    const cardTypeKey = Array.isArray(params.cardType) 
      ? params.cardType.sort().join(',') 
      : params.cardType;
    
    return JSON.stringify({
      ...params,
      bankId: bankIdKey,
      cardType: cardTypeKey,
    });
  }, [
    params.country,
    params.province,
    params.district,
    params.city,
    Array.isArray(params.bankId) ? params.bankId.join(',') : params.bankId,
    Array.isArray(params.cardType) ? params.cardType.join(',') : params.cardType,
    params.page,
    params.size,
  ]);

  return useApiData<PaginatedResponse<HotelOffer>>(
    () => api.searchHotelOffers(params),
    [paramsKey]
  );
}

// Get Single Hotel Offer by ID
export function useHotelOfferById(id: number | null) {
  return useApiData<HotelOffer>(
    () => {
      if (!id) {
        return Promise.resolve({ success: false, error: 'No ID provided' });
      }
      return api.getHotelOfferById(id);
    },
    [id]
  );
}

// Create Hotel Offer
export function useCreateHotelOffer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOffer = async (data: CreateHotelOfferRequest) => {
    setLoading(true);
    setError(null);

    const result = await api.createHotelOffer(data);

    if (!result.success) {
      // Parse validation errors if they exist
      let errorMessage = result.error || 'Failed to create offer';
      try {
        // Check if error contains JSON validation errors
        if (errorMessage.includes('bankId') || errorMessage.includes('cardType') || 
            errorMessage.includes('bankIds') || errorMessage.includes('cardTypes')) {
          // Try to extract and format validation errors
          const errorMatch = errorMessage.match(/\{.*\}/);
          if (errorMatch) {
            const errorObj = JSON.parse(errorMatch[0]);
            const formattedErrors = Object.entries(errorObj)
              .map(([field, msg]) => {
                // Map old field names to new ones
                const mappedField = field === 'bankId' ? 'bankIds' : 
                                   field === 'cardType' ? 'cardTypes' : field;
                return `${mappedField}: ${msg}`;
              })
              .join('; ');
            errorMessage = formattedErrors || errorMessage;
          }
        }
      } catch {
        // If parsing fails, use original error
      }
      setError(errorMessage);
    }

    setLoading(false);
    return result;
  };

  return { createOffer, loading, error };
}

// Update Hotel Offer
export function useUpdateHotelOffer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOffer = async (id: number, data: CreateHotelOfferRequest) => {
    setLoading(true);
    setError(null);

    const result = await api.updateHotelOffer(id, data);

    if (!result.success) {
      setError(result.error || 'Failed to update offer');
    }

    setLoading(false);
    return result;
  };

  return { updateOffer, loading, error };
}

// Delete Hotel Offer
export function useDeleteHotelOffer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteOffer = async (id: number) => {
    setLoading(true);
    setError(null);

    const result = await api.deleteHotelOffer(id);

    if (!result.success) {
      setError(result.error || 'Failed to delete offer');
    }

    setLoading(false);
    return result;
  };

  return { deleteOffer, loading, error };
}

// Authentication
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const tokenCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
    
    // Clear token check interval
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }
  }, []);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('authToken');
    
    // Check if token exists and is not expired
    if (token && !isTokenExpired(token)) {
      // Extract user info from token
      const userInfo = getUserFromToken(token);
      if (userInfo) {
        setIsAuthenticated(true);
        setUser(userInfo);
      } else {
        // Invalid token - logout
        logout();
      }
    } else {
      // Token expired or missing - logout
      if (token) {
        logout();
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    setLoading(false);
  }, [logout]);

  useEffect(() => {
    // Set logout callback for API layer
    setLogoutCallback(logout);

    // Check if user is authenticated on mount
    checkAuth();

    // Set up periodic token expiration check (every 30 seconds)
    tokenCheckIntervalRef.current = setInterval(() => {
      const token = localStorage.getItem('authToken');
      if (token && isTokenExpired(token)) {
        logout();
      }
    }, 30000); // Check every 30 seconds

    // Listen for storage changes (when login/logout happens in other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        checkAuth();
      }
    };

    // Listen for custom auth events (for same-tab updates)
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }
    };
  }, [checkAuth, logout]);

  const login = async (credentials: LoginCredentials) => {
    const result = await api.login(credentials);

    if (result.success && result.data) {
      const loginData = result.data as LoginResponse;
      localStorage.setItem('authToken', loginData.token);
      
      // Extract user info from token
      const userInfo = getUserFromToken(loginData.token);
      if (userInfo) {
        setIsAuthenticated(true);
        setUser(userInfo);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('authChange'));
        return { success: true };
      } else {
        return { success: false, error: 'Failed to decode user information from token' };
      }
    }

    return { success: false, error: result.error || 'Login failed' };
  };

  return { isAuthenticated, loading, user, login, logout };
}
