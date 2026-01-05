package org.szylica.inzynierka.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.model.dto.auth.RegistrationRequestDto;
import org.szylica.inzynierka.backend.model.entity.UserEntity;
import org.szylica.inzynierka.backend.repository.UserRepository;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;


    public void registerCustomer(RegistrationRequestDto dto) {
        if(isEmailTaken(dto.getEmail())){
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
                .build();

        userRepository.save(customer);
    }



    private boolean isEmailTaken(String email){
        return userRepository.findByEmail(email).isPresent();
    }

}
