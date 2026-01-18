package org.szylica.inzynierka.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;
import org.szylica.inzynierka.backend.model.dto.VisitDto;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;
import org.szylica.inzynierka.backend.model.entity.ServiceEntity;
import org.szylica.inzynierka.backend.model.entity.UserEntity;
import org.szylica.inzynierka.backend.model.entity.VisitEntity;
import org.szylica.inzynierka.backend.repository.LocalRepository;
import org.szylica.inzynierka.backend.repository.ServiceRepository;
import org.szylica.inzynierka.backend.repository.UserRepository;

import java.time.Duration;
import java.util.List;

@Mapper(componentModel = "spring", uses = {LocalMapper.class, ServiceMapper.class, UserMapper.class})
public abstract class VisitMapper {

    @Autowired
    LocalRepository localRepository;
    @Autowired
    ServiceRepository serviceRepository;
    @Autowired
    UserRepository userRepository;

    @Mapping(source = "local.id", target = "localId")
    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "worker.id", target = "workerId")
    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(target = "duration", expression = "java(visitEntity.getDuration().toMinutes())")
    public abstract VisitDto toDto(VisitEntity visitEntity);

    //@Mapping(target = "duration", expression = "java(java.time.Duration.ofMinutes(visitDto.getDuration()))")
    @Mapping(target = "local", source = "localId", qualifiedByName = "idToLocal")
    @Mapping(target = "service", source = "serviceId", qualifiedByName = "idToService")
    @Mapping(target = "worker", source = "workerId", qualifiedByName = "idToUser")
    @Mapping(target = "customer", source = "customerId", qualifiedByName = "idToUser")
    @Mapping(target = "duration", source = "duration", qualifiedByName = "longToDuration")
    public abstract VisitEntity toEntity(VisitDto visitDto);

    public abstract List<VisitDto> toDtoList(List<VisitEntity> visitEntityList);

    public abstract List<VisitEntity> toEntityList(List<VisitDto> visitDtoList);


    @Named("idToLocal")
    LocalEntity idToLocal(Long id) {
        return id == null ? null : localRepository.findById(id).orElse(null);
    }

    @Named("idToService")
    ServiceEntity idToService(Long id) {
        return id == null ? null : serviceRepository.findById(id).orElse(null);
    }

    @Named("idToUser")
    UserEntity idToUser(Long id) {
        return id == null ? null : userRepository.findById(id).orElse(null);
    }

    @Named("longToDuration")
    Duration longToDuration(Long duration) {
        return duration == null ? null : Duration.ofMinutes(duration);
    }
}
