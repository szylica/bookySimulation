package org.szylica.inzynierka.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.mapper.LocalMapper;
import org.szylica.inzynierka.backend.mapper.ServiceMapper;
import org.szylica.inzynierka.backend.model.dto.LocalDto;
import org.szylica.inzynierka.backend.model.dto.LocalShortDto;
import org.szylica.inzynierka.backend.model.dto.LonAndLat;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;
import org.szylica.inzynierka.backend.model.entity.ServiceEntity;
import org.szylica.inzynierka.backend.model.entity.UserEntity;
import org.szylica.inzynierka.backend.model.utils.GeoUtils;
import org.szylica.inzynierka.backend.repository.AvailabilityRepository;
import org.szylica.inzynierka.backend.repository.LocalRepository;
import org.szylica.inzynierka.backend.repository.ServiceRepository;
import org.szylica.inzynierka.backend.repository.UserRepository;
import org.szylica.inzynierka.backend.security.SecurityUtils;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LocalService {

    private final LocalRepository localRepository;
    private final LocalMapper localMapper;
    private final GeoService geoService;
    private final UserRepository userRepository;
    private final AvailabilityService availabilityService;
    private final ServiceRepository serviceRepository;

    public List<UserEntity> findAllWorkersByLocal(LocalEntity localEntity){
        return localRepository.findAllByWorkers_Id(localEntity);
    }

    public void saveLocal(LocalEntity localEntity){
        localRepository.save(localEntity);
    }

    public List<LocalDto> findAllLocals(){
        var entities = localRepository.findAll();
        return localMapper.toDtoList(entities);
    }

    public List<LocalShortDto> findAllLocalsForLoggedUserShort(){

        var currentUserId = SecurityUtils.getCurrentUserId();
        var locals = localRepository.findAllByServiceProviderId(currentUserId);
        return localMapper.toShortDtoList(locals);
    }

    public void addLocal(LocalDto localDto){

        LonAndLat lonAndLat = geoService.getLonAndLat(geoService.getCityData(localDto.getCity()));

        var zoneId = GeoUtils.getZoneId(lonAndLat.lat(), lonAndLat.lon());


        var localEntity = LocalEntity.builder()
                .name(localDto.getName())
                .address(localDto.getAddress())
                .city(localDto.getCity())
                .postalCode(localDto.getPostalCode())
                .phone(localDto.getPhone())
                .openingTime(localDto.getOpeningTime())
                .closingTime(localDto.getClosingTime())
                .schedulingLimitInDays(localDto.getSchedulingLimitInDays())
                .visitDurationInMinutes(localDto.getVisitDurationInMinutes())
                .zoneId(zoneId)
                .serviceProvider(userRepository.findById(SecurityUtils.getCurrentUserId()).orElseThrow())
                .build();

        localRepository.save(localEntity);

        //TODO
        // dodać możliwość ustawiania przez użytkownika od kiedy lokal ma zacząć działac
        // usprawnic requesty do bazy danych, żeby nie wysyłało 1000 tylko 1 przy tworzeniu wielu obiektów
        availabilityService.setUpSlotsFirstTime(localEntity, LocalDate.now());
    }

    public List<LocalEntity> findRandomLocals(){
        return localRepository.findRandomLocals();
    }

    @Transactional
    public LocalDto findById(Long id){
        var entity = localRepository.findById(id).orElseThrow();
        return localMapper.toDto(entity);
    }

    public void addWorkerToLocal(Long workerId, Long localId){
        var userEntity = userRepository.findById(workerId).orElseThrow();
        var localEntity = localRepository.findById(localId).orElseThrow();

        localEntity.addWorker(userEntity);
        localRepository.save(localEntity);
    }

    @Transactional
    public void setUpServicesForLocal(Long localId, List<Long> serviceIds){
        var localEntity = localRepository.findById(localId).orElseThrow();

        List<ServiceEntity> serviceEntities = serviceRepository.findAllById(serviceIds);


        localEntity.addAllServices(serviceEntities);
        localRepository.save(localEntity);

    }



}
