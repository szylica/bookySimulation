package org.szylica.inzynierka.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.mapper.LocalMapper;
import org.szylica.inzynierka.backend.model.dto.LocalDto;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;
import org.szylica.inzynierka.backend.model.entity.UserEntity;
import org.szylica.inzynierka.backend.repository.AvailabilityRepository;
import org.szylica.inzynierka.backend.repository.LocalRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocalService {

    private final LocalRepository localRepository;
    private final LocalMapper localMapper;
    private final AvailabilityRepository availabilityRepository;

    public List<UserEntity> findAllWorkersByLocal(LocalEntity localEntity){
        return localRepository.findAllByWorkers_Id(localEntity);
    }

    public void saveLocal(LocalEntity localEntity){
        localRepository.save(localEntity);
    }

    public List<LocalDto> findAllLocals(){
        var entities = localRepository.findAll();
        System.out.println("---------------- W SERWISIE ----------------");
        System.out.println(entities);
        return localMapper.toDtoList(entities);
    }

}
