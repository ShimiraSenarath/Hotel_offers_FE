// API configuration and helper functions
import { Bank, HotelOffer, PaginatedResponse, LoginResponse, CreateHotelOfferRequest } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// JWT utility functions
interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  role?: string;
  email?: string;
  name?: string;
  id?: number;
}

// Decode JWT token without verification (just to read expiration and claims)
export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Extract user info from token
export const getUserFromToken = (token: string | null): { id: string; email: string; name: string; role: 'ADMIN' | 'USER' } | null => {
  if (!token) return null;
  
  const decoded = decodeJwt(token);
  if (!decoded) return null;
  
  // Extract role and normalize it (ADMIN -> ADMIN, USER -> USER)
  const role = decoded.role || 'USER';
  const normalizedRole: 'ADMIN' | 'USER' = role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
  
  return {
    id: decoded.id?.toString() || decoded.sub || '',
    email: decoded.email || decoded.sub || '',
    name: decoded.name || '',
    role: normalizedRole,
  };
};

// Check if token is expired
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  
  // Check if token is expired (with 5 second buffer to account for clock skew)
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  return currentTime >= (expirationTime - 5000);
};

// Logout callback - will be set by useAuth hook
let logoutCallback: (() => void) | null = null;

// Set logout callback (called by useAuth hook)
export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

// Trigger logout
const triggerLogout = () => {
  if (logoutCallback) {
    logoutCallback();
  } else {
    // Fallback: clear localStorage and dispatch event
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      window.dispatchEvent(new Event('authChange'));
    }
  }
};

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false
): Promise<{ data?: T; error?: string; success: boolean }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add auth token if required
    if (requireAuth) {
      const token = getAuthToken();
      
      // Check if token is expired before making the request
      if (!token || isTokenExpired(token)) {
        triggerLogout();
        return {
          success: false,
          error: 'Your session has expired. Please log in again.',
        };
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      triggerLogout();
      return {
        success: false,
        error: 'Your session has expired. Please log in again.',
      };
    }

    if (!response.ok) {
      let errorText = await response.text();
      try {
        // Try to parse as JSON (validation errors)
        const errorJson = JSON.parse(errorText);
        // If it's a validation error object, format it nicely
        if (typeof errorJson === 'object' && !errorJson.error) {
          const errorMessages = Object.entries(errorJson)
            .map(([field, message]) => {
              // Map old field names to new ones for backward compatibility
              const mappedField = field === 'bankId' ? 'bankIds' : 
                                 field === 'cardType' ? 'cardTypes' : field;
              return `${mappedField}: ${message}`;
            })
            .join(', ');
          errorText = errorMessages || errorText;
        } else if (errorJson.error) {
          errorText = errorJson.error;
        }
      } catch {
        // Not JSON, use as-is
      }
      return {
        success: false,
        error: errorText || response.statusText,
      };
    }

    // Handle 204 No Content (DELETE requests typically return this)
    if (response.status === 204 || response.status === 201) {
      // Check if there's content to parse
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      if (!contentType?.includes('application/json') || contentLength === '0') {
        return { success: true, data: undefined };
      }
    }

    // Try to parse JSON, but handle empty responses
    const text = await response.text();
    if (!text || text.trim() === '') {
      return { success: true, data: undefined };
    }

    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (e) {
      // If parsing fails but status is OK, still return success
      return { success: true, data: undefined };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

export const api = {
  // Public endpoints (no auth required)
  getBanks: () => apiRequest<Bank[]>('/banks', {}, false),
  
  getHotelOffers: (page: number = 0, size: number = 20) =>
    apiRequest<PaginatedResponse<HotelOffer>>(`/offers?page=${page}&size=${size}`, {}, false),
  
  searchHotelOffers: (params: {
    country?: string;
    province?: string;
    district?: string;
    city?: string;
    bankId?: number | number[];
    cardType?: string | string[];
    page?: number;
    size?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params.country) queryParams.append('country', params.country);
    if (params.province) queryParams.append('province', params.province);
    if (params.district) queryParams.append('district', params.district);
    if (params.city) queryParams.append('city', params.city);
    
    // Handle multiple bank IDs
    if (params.bankId) {
      if (Array.isArray(params.bankId)) {
        params.bankId.forEach(id => queryParams.append('bankId', id.toString()));
      } else {
        queryParams.append('bankId', params.bankId.toString());
      }
    }
    
    // Handle multiple card types
    if (params.cardType) {
      if (Array.isArray(params.cardType)) {
        params.cardType.forEach(type => queryParams.append('cardType', type));
      } else {
        queryParams.append('cardType', params.cardType);
      }
    }
    
    queryParams.append('page', (params.page || 0).toString());
    queryParams.append('size', (params.size || 20).toString());
    
    return apiRequest<PaginatedResponse<HotelOffer>>(`/offers/search?${queryParams.toString()}`, {}, false);
  },

  getHotelOfferById: (id: number) =>
    apiRequest<HotelOffer>(`/offers/${id}`, {}, false),

  // Auth endpoints
  register: (data: { name: string; email: string; password: string }) =>
    apiRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false),

  login: (credentials: { email: string; password: string }) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false),

  // Protected endpoints (auth required)
  createHotelOffer: (data: CreateHotelOfferRequest) =>
    apiRequest<HotelOffer>('/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  updateHotelOffer: (id: number, data: CreateHotelOfferRequest) =>
    apiRequest<HotelOffer>(`/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),

  deleteHotelOffer: (id: number) =>
    apiRequest<void>(`/offers/${id}`, {
      method: 'DELETE',
    }, true),
};

