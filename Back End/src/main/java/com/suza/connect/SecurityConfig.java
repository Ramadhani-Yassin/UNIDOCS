package com.suza.connect;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
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
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // PUBLIC ENDPOINTS
                .requestMatchers(HttpMethod.POST,
                    "/api/users/register",
                    "/api/users/login",
                    "/api/users/student-login", // <-- ADD THIS LIN
                    "/api/admin/register",
                    "/api/admin/login",
                    "/api/letter-requests",
                    "/api/cv-requests"
                ).permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/letter-requests/{id}/status").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users/{id}").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/users/{id}").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users/migrate-passwords").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/letter-requests/analytics/general").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/letter-requests/count/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/letter-requests/recent/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/letter-requests/*/generate").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/cv-requests/*/generate").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users/students").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/letter-requests").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/letter-requests/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/letter-requests/analytics/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/letter-requests").permitAll()
                .requestMatchers("/api/admin/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/users/{id}/activate").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/users/{id}/deactivate").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/users/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/announcements/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/announcements").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/announcements/{id}").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/announcements/{id}").permitAll()
                // Everything else under /api/users/** requires role
                .requestMatchers("/api/users/**").hasAnyRole("STUDENT", "ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200")); // Only allow your frontend origin
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With", 
            "X-User-Role" // <-- ADD THIS LINE
        ));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
