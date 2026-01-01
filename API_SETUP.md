# API Configuration

## Backend API URL

Create a `.env.local` file in the root of the `hotels-offers` directory with the following content:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## API Endpoints

### Public Endpoints (No Authentication Required)

- `GET /api/banks` - Get all banks
- `GET /api/offers` - Get all hotel offers with pagination
- `GET /api/offers/search` - Search hotel offers with filters

### Protected Endpoints (Authentication Required)

- `POST /api/auth/login` - Login
- `POST /api/offers` - Create new hotel offer
- `PUT /api/offers/{id}` - Update hotel offer
- `DELETE /api/offers/{id}` - Delete hotel offer

## Backend Security Configuration

Make sure your Spring Boot backend has the following security configuration to allow public access to certain endpoints:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors().and()
            .authorizeHttpRequests()
                // Public endpoints
                .requestMatchers("/api/banks/**").permitAll()
                .requestMatchers("/api/offers/search").permitAll()
                .requestMatchers("/api/offers").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                // Protected endpoints
                .anyRequest().authenticated()
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        
        return http.build();
    }
}
```

## CORS Configuration

Add CORS configuration to allow requests from the Next.js frontend:

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

## Usage

1. Start your Spring Boot backend on `http://localhost:8080`
2. Create the `.env.local` file with the API URL
3. Start the Next.js frontend with `npm run dev`
4. The hotel offers page will be publicly accessible
5. Login is only required for admin functions

