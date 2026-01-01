import { useState, useEffect } from 'react';

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

// Hook for countries
export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/locations/countries`);
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }
        const data = await response.json();
        setCountries(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch countries');
        console.error('Error fetching countries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};

// Hook for provinces
export const useProvinces = (countryId?: number) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const url = countryId 
          ? `${API_BASE_URL}/locations/provinces/country/${countryId}`
          : `${API_BASE_URL}/locations/provinces`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch provinces');
        }
        const data = await response.json();
        setProvinces(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch provinces');
        console.error('Error fetching provinces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, [countryId]);

  return { provinces, loading, error };
};

// Hook for districts
export const useDistricts = (provinceId?: number) => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        setLoading(true);
        const url = provinceId 
          ? `${API_BASE_URL}/locations/districts/province/${provinceId}`
          : `${API_BASE_URL}/locations/districts`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch districts');
        }
        const data = await response.json();
        setDistricts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch districts');
        console.error('Error fetching districts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, [provinceId]);

  return { districts, loading, error };
};

// Hook for cities
export const useCities = (districtId?: number) => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const url = districtId 
          ? `${API_BASE_URL}/locations/cities/district/${districtId}`
          : `${API_BASE_URL}/locations/cities`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }
        const data = await response.json();
        setCities(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cities');
        console.error('Error fetching cities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [districtId]);

  return { cities, loading, error };
};

// Helper hook for cascading location selection
export const useLocationCascade = () => {
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  const { countries, loading: countriesLoading, error: countriesError } = useCountries();
  const { provinces, loading: provincesLoading, error: provincesError } = useProvinces(selectedCountry === null ? undefined : selectedCountry);
  const { districts, loading: districtsLoading, error: districtsError } = useDistricts(selectedProvince === null ? undefined : selectedProvince);
  const { cities, loading: citiesLoading, error: citiesError } = useCities(selectedDistrict === null ? undefined : selectedDistrict);

  const handleCountryChange = (countryId: number) => {
    setSelectedCountry(countryId);
    setSelectedProvince(null);
    setSelectedDistrict(null);
  };

  const handleProvinceChange = (provinceId: number) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(null);
  };

  const handleDistrictChange = (districtId: number) => {
    setSelectedDistrict(districtId);
  };

  return {
    // Data
    countries,
    provinces,
    districts,
    cities,
    
    // Loading states
    countriesLoading,
    provincesLoading,
    districtsLoading,
    citiesLoading,
    
    // Error states
    countriesError,
    provincesError,
    districtsError,
    citiesError,
    
    // Selected values
    selectedCountry,
    selectedProvince,
    selectedDistrict,
    
    // Handlers
    handleCountryChange,
    handleProvinceChange,
    handleDistrictChange,
  };
};
