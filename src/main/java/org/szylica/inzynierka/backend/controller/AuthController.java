package org.szylica.inzynierka.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.szylica.inzynierka.backend.model.dto.auth.AuthResponse;
import org.szylica.inzynierka.backend.model.dto.auth.LoginRequestDto;
import org.szylica.inzynierka.backend.model.dto.auth.RegistrationRequestDto;
import org.szylica.inzynierka.backend.model.entity.UserEntity;
import org.szylica.inzynierka.backend.model.utils.UserRole;
import org.szylica.inzynierka.backend.service.AuthService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/customer/register")
    public ResponseEntity<AuthResponse> registerCustomer(@Valid @RequestBody RegistrationRequestDto registerRequest, HttpServletRequest request, HttpServletResponse response) {

        return registerUser(
                registerRequest,
                request,
                response,
                UserRole.ROLE_CUSTOMER
        );
    }

    @PostMapping("/customer/login")
    public ResponseEntity<AuthResponse> loginCustomer(@Valid @RequestBody LoginRequestDto loginRequestDto, HttpServletRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(authService.authenticate(loginRequestDto, request, response, UserRole.ROLE_CUSTOMER));

    }

    @PostMapping("/provider/register")
    public ResponseEntity<AuthResponse> registerProvider(@Valid @RequestBody RegistrationRequestDto registerRequest, HttpServletRequest request, HttpServletResponse response) {

        return registerUser(
                registerRequest,
                request,
                response,
                UserRole.ROLE_PROVIDER
        );
    }

    @PostMapping("/provider/login")
    public ResponseEntity<AuthResponse> loginProvider(@Valid @RequestBody LoginRequestDto loginRequestDto, HttpServletRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(authService.authenticate(loginRequestDto, request, response, UserRole.ROLE_PROVIDER));
    }

    @PostMapping("/worker/register")
    public ResponseEntity<AuthResponse> registerWorker(@Valid @RequestBody RegistrationRequestDto registerRequest, HttpServletRequest request, HttpServletResponse response) {

        return registerUser(
                registerRequest,
                request,
                response,
                UserRole.ROLE_WORKER
        );
    }

    @PostMapping("/worker/login")
    public ResponseEntity<AuthResponse> loginWorker(@Valid @RequestBody LoginRequestDto loginRequestDto, HttpServletRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(authService.authenticate(loginRequestDto, request, response, UserRole.ROLE_WORKER));
    }

    private ResponseEntity<AuthResponse> registerUser(RegistrationRequestDto registerRequest, HttpServletRequest request, HttpServletResponse response, UserRole userRole) {
        UserEntity user = authService.registerUser(registerRequest);

        var loginRequestDto = new LoginRequestDto(registerRequest.getEmail(), registerRequest.getPassword());

        var answer = authService.authenticate(
                loginRequestDto,
                request,
                response,
                userRole
        );

        return ResponseEntity.status(201).body(answer);
    }

}
