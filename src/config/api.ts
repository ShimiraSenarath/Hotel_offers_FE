// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 10000, // 10 seconds
};

// You can override this by setting NEXT_PUBLIC_API_URL environment variable
// Example: NEXT_PUBLIC_API_URL=http://localhost:8080/api
