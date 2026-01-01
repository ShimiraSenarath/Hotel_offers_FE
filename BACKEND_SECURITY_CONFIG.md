# Backend Security Configuration for Hotel Offers API

## Problem
The frontend was getting 403 errors when trying to access `/api/offers/search` and `/api/banks` endpoints because these were requiring authentication. However, these endpoints should be publicly accessible - only admin operations should require authentication.

## Solution

### 1. Update Spring Security Configuration

Update your `SecurityConfig.java` to allow public access to certain endpoints:

```java
package com.hoteloffers.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configure(http))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - NO authentication required
                .requestMatchers(
                    "/api/banks",
                    "/api/banks/**",
                    "/api/offers",
                    "/api/offers/search",
                    "/api/auth/login",
                    "/api/auth/register"
                ).permitAll()
                
                // All other /api/** endpoints require authentication
                .requestMatchers("/api/**").authenticated()
                
                // Allow everything else (if any)
                .anyRequest().permitAll()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        return http.build();
    }
}
```

### 2. CORS Configuration

Make sure your CORS configuration allows requests from the Next.js frontend:

```java
package com.hoteloffers.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow requests from Next.js frontend
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ));
        
        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"
        ));
        
        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // How long the response from a pre-flight request can be cached
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        
        return source;
    }
}
```

### 3. JWT Authentication Filter (Optional but Recommended)

If you're using JWT tokens, make sure your filter only validates tokens when they're present:

```java
package com.hoteloffers.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        // Get Authorization header
        String authHeader = request.getHeader("Authorization");
        
        // Only process if Authorization header exists and starts with "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            
            try {
                // Validate JWT and set authentication
                // ... your JWT validation logic here
                
            } catch (Exception e) {
                // Log the error but don't throw exception
                // This allows the request to continue to the controller
                // where Spring Security will deny access if needed
                logger.error("JWT validation failed", e);
            }
        }
        
        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}
```

### 4. Controller Level Security (Optional)

You can also add `@PreAuthorize` annotations to specific controller methods:

```java
package com.hoteloffers.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/offers")
public class HotelOfferController {
    
    // Public endpoints - no annotation needed
    @GetMapping
    public ResponseEntity<?> getAllOffers(@RequestParam int page, @RequestParam int size) {
        // ...
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchOffers(@RequestParam Map<String, String> params) {
        // ...
    }
    
    // Protected endpoints - require authentication
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createOffer(@RequestBody HotelOfferRequest request) {
        // ...
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOffer(@PathVariable Long id, @RequestBody HotelOfferRequest request) {
        // ...
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteOffer(@PathVariable Long id) {
        // ...
    }
}
```

## Testing

After applying these changes:

1. **Test Public Endpoints** (should work without authentication):
   ```bash
   curl http://localhost:8080/api/banks
   curl http://localhost:8080/api/offers?page=0&size=20
   curl http://localhost:8080/api/offers/search?page=0&size=20
   ```

2. **Test Protected Endpoints** (should return 401/403 without token):
   ```bash
   curl -X POST http://localhost:8080/api/offers -H "Content-Type: application/json" -d '{...}'
   ```

3. **Test Frontend**:
   - Visit `http://localhost:3000/hotel-offers` - should load without login
   - Visit `http://localhost:3000/admin` - should redirect to login
   - Login and try creating/editing offers - should work with JWT token

## Frontend Configuration

Create a `.env.local` file in the `hotels-offers` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Summary of Changes

### What Should Be Public (No Auth):
- GET `/api/banks` - List all banks
- GET `/api/offers` - List all offers (paginated)
- GET `/api/offers/search` - Search offers with filters
- POST `/api/auth/login` - Login endpoint

### What Should Be Protected (Auth Required):
- POST `/api/offers` - Create new offer (Admin only)
- PUT `/api/offers/{id}` - Update offer (Admin only)
- DELETE `/api/offers/{id}` - Delete offer (Admin only)

This configuration ensures that regular users can browse hotel offers without logging in, while administrative functions require authentication.

