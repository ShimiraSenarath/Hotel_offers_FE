# Frontend-Backend API Integration

This document describes the integration between the frontend Next.js application and the backend Spring Boot API.

## Overview

The frontend has been updated to use real API endpoints instead of mock data. The integration includes:

- **Authentication**: JWT-based authentication with login/logout functionality
- **Hotel Offers**: CRUD operations for managing hotel offers
- **Banks**: Fetching bank information for dropdowns
- **Search & Filtering**: Advanced search with location, bank, and card type filters

## API Configuration

### Environment Setup

The API base URL is configured in `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 10000, // 10 seconds
};
```

To override the default URL, set the `NEXT_PUBLIC_API_URL` environment variable:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Backend Requirements

Ensure your Spring Boot backend is running on:
- **URL**: `http://localhost:8080`
- **Context Path**: `/api`
- **CORS**: Enabled for `http://localhost:3000` (Next.js default)

## API Service Layer

### Core API Service (`src/services/api.ts`)

The `ApiService` class handles all HTTP requests with:

- **Authentication**: Automatic JWT token management
- **Error Handling**: Consistent error responses
- **Type Safety**: TypeScript interfaces for all API responses

### Custom Hooks (`src/hooks/useApi.ts`)

React hooks for easy API integration:

- `useApi<T>()`: Generic hook for any API call
- `useHotelOffers()`: Fetch hotel offers with pagination
- `useSearchHotelOffers()`: Search offers with filters
- `useBanks()`: Fetch available banks
- `useAuth()`: Authentication state management
- `useCreateHotelOffer()`: Create new hotel offers
- `useUpdateHotelOffer()`: Update existing offers
- `useDeleteHotelOffer()`: Delete offers

## Updated Components

### 1. Hotel Offers Page (`src/app/hotel-offers/page.tsx`)

**Changes:**
- Replaced mock data with API calls
- Added loading and error states
- Integrated real-time search and filtering
- Pagination support

**API Endpoints Used:**
- `GET /api/offers/search` - Search with filters
- `GET /api/banks` - Fetch banks for filter dropdown

### 2. Login Page (`src/app/login/page.tsx`)

**Changes:**
- Integrated with backend authentication
- JWT token management
- Proper error handling

**API Endpoints Used:**
- `POST /api/auth/login` - User authentication

### 3. Admin Dashboard (`src/app/admin/page.tsx`)

**Changes:**
- Real-time data fetching
- CRUD operations for hotel offers
- Authentication state management
- Loading and error states

**API Endpoints Used:**
- `GET /api/offers` - Fetch all offers
- `POST /api/offers` - Create new offer
- `PUT /api/offers/{id}` - Update offer
- `DELETE /api/offers/{id}` - Delete offer

### 4. Add/Edit Offer Form (`src/components/AddOfferForm.tsx`)

**Changes:**
- API integration for create/update operations
- Real bank data from API
- Form validation with API error handling
- Loading states during submission

**API Endpoints Used:**
- `GET /api/banks` - Fetch banks for dropdown
- `POST /api/offers` - Create new offer
- `PUT /api/offers/{id}` - Update existing offer

## Data Type Updates

### Updated Types (`src/types/index.ts`)

**Key Changes:**
- `HotelOffer.id`: Changed from `string` to `number` to match backend
- `Bank.id`: Changed from `string` to `number` to match backend
- Added API response interfaces: `ApiResponse<T>`, `PaginatedResponse<T>`
- Added request interfaces: `CreateHotelOfferRequest`, `LoginResponse`

## Authentication Flow

1. **Login**: User submits credentials → API validates → JWT token returned
2. **Token Storage**: Token stored in localStorage and API service
3. **Request Headers**: Token automatically included in authenticated requests
4. **Logout**: Token removed from storage and API service

## Error Handling

The integration includes comprehensive error handling:

- **Network Errors**: Connection failures, timeouts
- **API Errors**: HTTP error responses with meaningful messages
- **Validation Errors**: Form validation with API error display
- **Authentication Errors**: Token expiration, unauthorized access

## Development Setup

### 1. Start Backend

```bash
cd hotels-offers-backend
./mvnw spring-boot:run
```

Ensure backend is running on `http://localhost:8080`

### 2. Start Frontend

```bash
cd hotels-offers
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### 3. Test Integration

1. **Public Access**: Visit `http://localhost:3000/hotel-offers` to see offers
2. **Admin Access**: 
   - Go to `http://localhost:3000/login`
   - Use backend credentials (check your database)
   - Access admin dashboard at `http://localhost:3000/admin`

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/offers` | Get all hotel offers (paginated) |
| `GET` | `/api/offers/search` | Search offers with filters |
| `GET` | `/api/offers/{id}` | Get specific offer |
| `POST` | `/api/offers` | Create new offer |
| `PUT` | `/api/offers/{id}` | Update offer |
| `DELETE` | `/api/offers/{id}` | Delete offer |
| `GET` | `/api/banks` | Get all banks |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/me` | Get current user |

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for frontend domain
2. **Connection Refused**: Verify backend is running on correct port
3. **Authentication Errors**: Check JWT token validity and user credentials
4. **Data Type Mismatches**: Ensure frontend types match backend DTOs

### Debug Mode

Enable debug logging by setting environment variable:
```bash
NODE_ENV=development
```

This will show detailed API request/response logs in browser console.

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live data updates
- **Offline Support**: Service worker for offline functionality
- **Caching**: React Query for better data caching
- **File Upload**: Image upload for hotel photos
- **Advanced Filtering**: More filter options and saved searches
