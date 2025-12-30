package org.szylica.inzynierka.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.model.entity.CustomerEntity;
import org.szylica.inzynierka.backend.model.entity.ServiceProviderEntity;
import org.szylica.inzynierka.backend.model.entity.WorkerEntity;
import org.szylica.inzynierka.backend.repository.CustomerRepository;
import org.szylica.inzynierka.backend.repository.ServiceProviderRepository;
import org.szylica.inzynierka.backend.repository.WorkerRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {

    private final CustomerRepository customerRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final WorkerRepository workerRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<CustomerEntity> customer = customerRepository.findByEmail(email);
        if (customer.isPresent()) return customer.get();

        Optional<ServiceProviderEntity> provider = serviceProviderRepository.findByEmail((email));
        if (provider.isPresent()) return provider.get();

        // 3. Szukamy w Pracownikach
        Optional<WorkerEntity> worker = workerRepository.findByEmail((email));
        if (worker.isPresent()) return worker.get();

        // Jeśli nigdzie nie ma:
        throw new UsernameNotFoundException("Użytkownik o emailu " + email + " nie istnieje.");
    }
}
