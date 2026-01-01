# Frontend Setup Guide

## Environment Configuration

1. **Create `.env.local` file** in the root of the `hotels-offers` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

This tells the frontend where your Spring Boot backend API is running.

## How It Works

### API Client (`src/lib/api.ts`)

The API client handles all HTTP requests to the backend:

- **Public endpoints** (no authentication required):
  - `GET /api/banks` - Get all banks
  - `GET /api/offers` - Get hotel offers with pagination
  - `GET /api/offers/search` - Search offers with filters

- **Protected endpoints** (authentication required):
  - `POST /api/offers` - Create new offer (Admin only)
  - `PUT /api/offers/{id}` - Update offer (Admin only)
  - `DELETE /api/offers/{id}` - Delete offer (Admin only)

### Custom Hooks (`src/hooks/useApi.ts`)

The hooks make it easy to use the API in React components:

#### Public Hooks (No Auth)
```typescript
// Get all banks
const { data: banks, loading, error } = useBanks();

// Get all offers with pagination
const { data: offersResponse, loading, error } = useHotelOffers(page, size);

// Search offers with filters
const { data: offersResponse, loading, error } = useSearchHotelOffers({
  country: 'Sri Lanka',
  province: 'Western Province',
  bankId: 1,
  cardType: 'credit',
  page: 0,
  size: 20
});
```

#### Authentication Hook
```typescript
const { isAuthenticated, loading, user, login, logout } = useAuth();

// Login
const result = await login({ email: 'admin@hoteloffers.com', password: 'admin123' });
if (result.success) {
  // Redirect to admin page
}

// Logout
logout();
```

#### Admin Hooks (Auth Required)
```typescript
// Create new offer
const { createOffer, loading, error } = useCreateHotelOffer();
const result = await createOffer(offerData);

// Update offer
const { updateOffer, loading, error } = useUpdateHotelOffer();
const result = await updateOffer(offerId, offerData);

// Delete offer
const { deleteOffer, loading, error } = useDeleteHotelOffer();
const result = await deleteOffer(offerId);
```

## Key Features

### 1. Automatic Token Management
- JWT tokens are automatically stored in `localStorage` on login
- Protected endpoints automatically include the `Authorization: Bearer {token}` header
- Tokens are removed on logout

### 2. Optimized Re-fetching
- The `useSearchHotelOffers` hook uses `useMemo` to prevent unnecessary API calls
- Only re-fetches when filter parameters actually change

### 3. Error Handling
- All API calls return `{ success: boolean, data?: T, error?: string }`
- Hooks expose loading states and error messages
- Components can display loading spinners and error messages

### 4. Type Safety
- Full TypeScript support with proper type definitions
- API responses are properly typed
- Compile-time error checking

## Running the Application

1. **Make sure backend is running**:
   ```bash
   cd hotels-offers-backend
   mvn spring-boot:run
   ```

2. **Install dependencies** (first time only):
   ```bash
   cd hotels-offers
   npm install
   ```

3. **Create `.env.local`** with the API URL (see above)

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open browser** to `http://localhost:3000`

## Testing

### Test Public Access (No Login Required)
1. Go to `http://localhost:3000/hotel-offers`
2. You should see hotel offers without logging in
3. Try using the filters (place, bank, card type)

### Test Admin Functions (Login Required)
1. Go to `http://localhost:3000/admin` - should redirect to login
2. Go to `http://localhost:3000/login`
3. Use credentials: `admin@hoteloffers.com` / `admin123`
4. Should redirect to admin dashboard
5. Try creating, editing, and deleting offers

## Troubleshooting

### Getting 403 Errors
- Make sure your backend Spring Security configuration allows public access to:
  - `/api/banks`
  - `/api/offers`
  - `/api/offers/search`
- See `BACKEND_SECURITY_CONFIG.md` for the correct configuration

### CORS Errors
- Make sure your backend has CORS configured to allow `http://localhost:3000`
- Check the CORS configuration in `BACKEND_SECURITY_CONFIG.md`

### Can't Login
- Check that `/api/auth/login` endpoint is working in backend
- Check browser console for error messages
- Verify backend returns proper JWT token format

### Offers Not Loading
- Open browser DevTools → Network tab
- Check if API calls are being made
- Check response status codes and data
- Verify `.env.local` has the correct API URL

## Project Structure

```
hotels-offers/
├── src/
│   ├── app/              # Next.js pages
│   │   ├── page.tsx      # Home page
│   │   ├── hotel-offers/ # Hotel offers page
│   │   ├── admin/        # Admin dashboard
│   │   └── login/        # Login page
│   ├── components/       # React components
│   │   ├── Layout.tsx    # Main layout
│   │   └── AddOfferForm.tsx # Offer form
│   ├── hooks/            # Custom React hooks
│   │   └── useApi.ts     # API hooks
│   ├── lib/              # Utility functions
│   │   └── api.ts        # API client
│   ├── types/            # TypeScript types
│   │   └── index.ts      # Type definitions
│   └── data/             # Mock data
│       └── mockData.ts   # Sample data
├── .env.local            # Environment variables (create this!)
└── package.json          # Dependencies
```

