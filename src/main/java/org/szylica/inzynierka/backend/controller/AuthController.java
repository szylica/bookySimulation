package org.szylica.inzynierka.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.szylica.inzynierka.backend.model.dto.auth.RegistrationCustomerRequestDto;
import org.szylica.inzynierka.backend.service.AuthService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/customers/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegistrationCustomerRequestDto registerRequest) {

        authService.registerCustomer(registerRequest);



        return ResponseEntity.status(201).build();
    }

    private ResponseEntity<Void> registerServiceProvider(RegistrationCustomerRequestDto registerRequest){


        return ResponseEntity.status(201).build();
    }


}
