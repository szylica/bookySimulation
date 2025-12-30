package org.szylica.inzynierka.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.model.dto.auth.RegistrationCustomerRequestDto;
import org.szylica.inzynierka.backend.repository.UserRepository;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

//    private final CustomerRepository customerRepository;
//    private final ServiceProviderRepository serviceProviderRepository;
//    private final WorkerRepository workerRepository;

    public void registerCustomer(RegistrationCustomerRequestDto dto) {
//        if(!isEmailTaken(dto.getEmail())){
//            throw new RuntimeException("Email is already taken");
//        }
//
//        String encodedPassword = passwordEncoder.encode(dto.getPassword());
//        CustomerEntity customer = CustomerEntity.builder()
//                .email(dto.getEmail())
//                .name(dto.getName())
//                .surname(dto.getSurname())
//                .password(encodedPassword)
//                .phone(dto.getPhone())
//                .build();
//
//        customerRepository.save(customer);
    }

    public void registerServiceProvider(RegistrationCustomerRequestDto dto) {
//        if(!isEmailTaken(dto.getEmail())){
//            throw new RuntimeException("Email is already taken");
//        }
//
//        String encodedPassword = passwordEncoder.encode(dto.getPassword());
//        CustomerEntity customer = CustomerEntity.builder()
//                .email(dto.getEmail())
//                .name(dto.getName())
//                .surname(dto.getSurname())
//                .password(encodedPassword)
//                .phone(dto.getPhone())
//                .build();
//
//        customerRepository.save(customer);
    }



    private boolean isEmailTaken(String email){
//        return customerRepository.findByEmail(email).isEmpty()
//                && serviceProviderRepository.findByEmail(email).isEmpty()
//                && workerRepository.findByEmail(email).isEmpty();

        return false;
    }

}
