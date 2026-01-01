export interface HotelOffer {
  id: number;
  hotelName: string;
  description: string;
  location: Location;
  banks?: Bank[];  // New: array of banks
  cardTypes?: CardType[];  // New: array of card types
  bank?: Bank;  // Backward compatibility: single bank
  cardType?: CardType;  // Backward compatibility: single card type
  discount: number;
  validFrom: string;
  validTo: string;
  terms: string;
  imageUrl?: string;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  country: string;
  province: string;
  district: string;
  city: string;
}

export interface Bank {
  id: number;
  name: string;
  logoUrl?: string;
}

export type CardType = 'CREDIT' | 'DEBIT';

export interface FilterOptions {
  place?: {
    country?: string;
    province?: string;
    district?: string;
    city?: string;
  };
  bank?: number | number[];
  cardType?: CardType | CardType[];
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface LoginResponse {
  token: string;
  type: string;
}

export interface CreateHotelOfferRequest {
  hotelName: string;
  description: string;
  location: Location;
  bankIds: number[];
  cardTypes: CardType[];
  discount: number;
  validFrom: string;
  validTo: string;
  terms: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}
