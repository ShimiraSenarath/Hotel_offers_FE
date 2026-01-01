// API configuration and base service
import { API_CONFIG } from '@/config/api';
const API_BASE_URL = API_CONFIG.BASE_URL;

interface ApiResponse<T> {
  data: T;
  error?: string;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        data: null as T,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }

  // Hotel Offers API
  async getHotelOffers(page = 0, size = 20): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.request(`/offers?page=${page}&size=${size}`);
  }

  async searchHotelOffers(params: {
    country?: string;
    province?: string;
    district?: string;
    city?: string;
    bankId?: number;
    cardType?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    
    if (params.country) searchParams.append('country', params.country);
    if (params.province) searchParams.append('province', params.province);
    if (params.district) searchParams.append('district', params.district);
    if (params.city) searchParams.append('city', params.city);
    if (params.bankId) searchParams.append('bankId', params.bankId.toString());
    if (params.cardType) searchParams.append('cardType', params.cardType);
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());

    return this.request(`/offers/search?${searchParams.toString()}`);
  }

  async getHotelOfferById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/offers/${id}`);
  }

  async createHotelOffer(offer: any): Promise<ApiResponse<any>> {
    return this.request('/offers', {
      method: 'POST',
      body: JSON.stringify(offer),
    });
  }

  async updateHotelOffer(id: string, offer: any): Promise<ApiResponse<any>> {
    return this.request(`/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(offer),
    });
  }

  async deleteHotelOffer(id: string): Promise<ApiResponse<void>> {
    return this.request(`/offers/${id}`, {
      method: 'DELETE',
    });
  }

  // Banks API
  async getBanks(): Promise<ApiResponse<any[]>> {
    return this.request('/banks');
  }

  async getBankById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/banks/${id}`);
  }

  // Auth API
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<any>> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // If login successful, store the token
    const data = response.data as { token?: string } | undefined;
    if (data && typeof data.token === 'string') {
      this.setToken(data.token);
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
