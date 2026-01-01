// Location API service to replace mock data
// import { CountryDto, ProvinceDto, DistrictDto, CityDto } from '@/types';

const API_BASE_URL = 'http://localhost:8080/api';

export interface Country {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

export interface Province {
  id: number;
  name: string;
  countryId: number;
  isActive: boolean;
}

export interface District {
  id: number;
  name: string;
  provinceId: number;
  isActive: boolean;
}

export interface City {
  id: number;
  name: string;
  districtId: number;
  isActive: boolean;
}

// API functions
export const locationApi = {
  // Get all countries
  async getCountries(): Promise<Country[]> {
    const response = await fetch(`${API_BASE_URL}/locations/countries`);
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    return response.json();
  },

  // Get all provinces
  async getProvinces(): Promise<Province[]> {
    const response = await fetch(`${API_BASE_URL}/locations/provinces`);
    if (!response.ok) {
      throw new Error('Failed to fetch provinces');
    }
    return response.json();
  },

  // Get provinces by country
  async getProvincesByCountry(countryId: number): Promise<Province[]> {
    const response = await fetch(`${API_BASE_URL}/locations/provinces/country/${countryId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch provinces');
    }
    return response.json();
  },

  // Get all districts
  async getDistricts(): Promise<District[]> {
    const response = await fetch(`${API_BASE_URL}/locations/districts`);
    if (!response.ok) {
      throw new Error('Failed to fetch districts');
    }
    return response.json();
  },

  // Get districts by province
  async getDistrictsByProvince(provinceId: number): Promise<District[]> {
    const response = await fetch(`${API_BASE_URL}/locations/districts/province/${provinceId}`);
    // const response = await fetch(`${API_BASE_URL}/locations/districts/province/1`);
    if (!response.ok) {
      throw new Error('Failed to fetch districts');
    }
    return response.json();
  },

  // Get all cities
  async getCities(): Promise<City[]> {
    const response = await fetch(`${API_BASE_URL}/locations/cities`);
    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }
    return response.json();
  },

  // Get cities by district
  async getCitiesByDistrict(districtId: number): Promise<City[]> {
    const response = await fetch(`${API_BASE_URL}/locations/cities/district/${districtId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }
    return response.json();
  },
};

// Helper functions for form data
export const locationHelpers = {
  // Get countries as simple string array for dropdowns
  async getCountryNames(): Promise<string[]> {
    const countries = await locationApi.getCountries();
    return countries.map(country => country.name);
  },

  // Get provinces as simple string array for dropdowns
  async getProvinceNames(): Promise<string[]> {
    const provinces = await locationApi.getProvinces();
    return provinces.map(province => province.name);
  },

  // Get districts by province name
  async getDistrictsByProvinceName(provinceName: string): Promise<string[]> {
    const provinces = await locationApi.getProvinces();
    const province = provinces.find(p => p.name === provinceName);
    if (!province) return [];
    
    const districts = await locationApi.getDistrictsByProvince(province.id);
    return districts.map(district => district.name);
  },

  // Get cities by district name
  async getCitiesByDistrictName(districtName: string): Promise<string[]> {
    const districts = await locationApi.getDistricts();
    const district = districts.find(d => d.name === districtName);
    if (!district) return [];
    
    const cities = await locationApi.getCitiesByDistrict(district.id);
    return cities.map(city => city.name);
  },
};
