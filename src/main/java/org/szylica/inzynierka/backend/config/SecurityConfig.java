package org.szylica.inzynierka.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.szylica.inzynierka.backend.security.CustomUserDetailService;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                // TUTAJ DEFINIUJE JAKIE ROLE MOGĄ WCHODZIĆ NA JAKIE ADRESY, CZY UZYTKOWNIK MUSI BYC ZALOGOWANY CZY NIE
                // LUB CZY MA MIEC JAKAS ROLE DO WEJSCIA GDZIES
                // KOLEJNOŚĆ MA ZNACZENIE OD NAJBARDZIEJ OGÓLNYCH DO NAJBARDZIEJ KONKRETNYCH
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/allLocals2", "/auth/**").permitAll() //Publiczne
                        .anyRequest().authenticated() // Zalogowani
                        // .hasRole("PROVIDER")
                        // .hasAnyRole("CUSTOMER", "PROVIDER")
                )
                .formLogin(form -> form
                        .loginProcessingUrl("/api/auth/*/login")
                        .usernameParameter("email")
                        .passwordParameter("password")
                        .successHandler(((request, response, authentication) ->
                                response.setStatus(200)))
                        .defaultSuccessUrl("/home", true))

                .logout(Customizer.withDefaults());

        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        http.userDetailsService(userDetailsService);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // Adres frontendu
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }


}
