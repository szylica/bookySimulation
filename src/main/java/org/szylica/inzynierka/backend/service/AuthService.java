package org.szylica.inzynierka.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.model.dto.AuthPrincipal;
import org.szylica.inzynierka.backend.model.dto.auth.AuthResponse;
import org.szylica.inzynierka.backend.model.dto.auth.LoginRequestDto;
import org.szylica.inzynierka.backend.model.dto.auth.RegistrationRequestDto;
import org.szylica.inzynierka.backend.model.entity.UserEntity;
import org.szylica.inzynierka.backend.model.utils.UserRole;
import org.szylica.inzynierka.backend.repository.UserRepository;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    private final AuthenticationManager authenticationManager;


    public UserEntity registerUser(RegistrationRequestDto dto) {
        if(isEmailTaken(dto.getEmail(), dto.getRole())){
            throw new RuntimeException("Email is already taken");
        }

        String encodedPassword = passwordEncoder.encode(dto.getPassword());
        UserEntity customer = UserEntity.builder()
                .email(dto.getEmail())
                .name(dto.getName())
                .surname(dto.getSurname())
                .password(encodedPassword)
                .phone(dto.getPhone())
                .role(dto.getRole())
                .companyName(dto.getCompanyName())
                .NIP(dto.getNip())
                .build();

        return userRepository.save(customer);
    }

    public AuthResponse authenticate(LoginRequestDto request, HttpServletRequest httpRequest,
                                     HttpServletResponse httpResponse, UserRole role) {

        // SZUKANIE UZYTKOWNIKU PO MAILU I ROLI
        UserEntity user = userRepository.findByEmailAndRole(request.getUsername(), role)
                .orElseThrow(() -> new BadCredentialsException("Nie znaleziono użytkownika z taką rolą"));

        // RECZNE SPRAWDZNAIE HASLA
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Błędne hasło");
        }

        var principal = new AuthPrincipal(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getName()
        );

        // TWORZENIE OBIEKTU AUTHENTICATION DLA KONKRETNEGO UŻYTKOWNIKA
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, user.getAuthorities());

        // ZAPISUJEMY W SecurityContext I SESJI
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);


        return AuthResponse.builder()
                .message("Successfully logged in")
                .email(user.getEmail())
                .role(user.getRole().name())
                .name(user.getName())
                .build();
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        // OBECNA AUTENTYKACJA
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if(auth != null){


            // SecurityContextLogoutHandler robi 3 rzeczy:
            //    - Unieważnia HttpSession (co automatycznie usuwa sesję z Redisa)
            //    - Czyści SecurityContextHolder
            //    - Usuwa autentykację z sesji
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }
    }


    private boolean isEmailTaken(String email, UserRole role){
        return !userRepository.findByEmailAndRole(email, role).isEmpty();

    }

    public ResponseEntity<AuthResponse> registerUser(RegistrationRequestDto registerRequest, HttpServletRequest request, HttpServletResponse response, UserRole userRole) {
        UserEntity user = this.registerUser(registerRequest);

        var loginRequestDto = new LoginRequestDto(registerRequest.getEmail(), registerRequest.getPassword());

        var answer = this.authenticate(
                loginRequestDto,
                request,
                response,
                userRole
        );

        return ResponseEntity.status(201).body(answer);
    }

}
