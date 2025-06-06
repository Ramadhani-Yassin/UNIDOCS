package com.suza.connect;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // Disable only during development
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no auth required)
                .requestMatchers(HttpMethod.POST,
                    "/api/users/register",
                    "/api/users/login",
                    "/api/admin/register",
                    "/api/admin/login"
                ).permitAll()

                .requestMatchers(HttpMethod.GET, "/api/users/{id}").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/users/{id}").permitAll() // <-- Add this line
                .requestMatchers(HttpMethod.POST, "/api/users/migrate-passwords").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/letter-requests").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/letter-requests/count/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/letter-requests/recent/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/letter-requests/*/generate").permitAll() // <-- Allow public access to generate endpoint

                // Allow public access to count by email
                .requestMatchers(HttpMethod.GET, "/api/letter-requests/count/**").permitAll()

                // Secure endpoints
                .requestMatchers("/api/users/**").hasAnyRole("STUDENT", "ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/letter-requests/**").hasAnyRole("STUDENT", "ADMIN")

                // Everything else must be authenticated
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.disable()); // Use stateless sessions (e.g., JWT)

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
