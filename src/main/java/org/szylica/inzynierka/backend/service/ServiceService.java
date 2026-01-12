package org.szylica.inzynierka.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.model.entity.ServiceEntity;
import org.szylica.inzynierka.backend.model.entity.UserEntity;
import org.szylica.inzynierka.backend.repository.ServiceRepository;
import org.szylica.inzynierka.backend.repository.UserRepository;
import org.szylica.inzynierka.backend.security.SecurityUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    public void saveService(ServiceEntity serviceEntity){
        serviceEntity.setServiceProvider(userRepository.findById(SecurityUtils.getCurrentUserId()).orElseThrow());
        serviceRepository.save(serviceEntity);
    }

    public List<ServiceEntity> findAllUsersServices(Long userId){

        var user = userRepository.findById(userId).orElseThrow();
        return user.getServices();
    }
}
