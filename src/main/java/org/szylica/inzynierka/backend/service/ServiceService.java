package org.szylica.inzynierka.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.model.entity.ServiceEntity;
import org.szylica.inzynierka.backend.repository.ServiceRepository;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;

    public void saveService(ServiceEntity serviceEntity){
        serviceRepository.save(serviceEntity);
    }
}
