package org.szylica.inzynierka.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.szylica.inzynierka.backend.model.dto.ServiceDto;
import org.szylica.inzynierka.backend.model.entity.ServiceEntity;

import java.util.List;

@Mapper(componentModel = "spring", uses = {LocalMapper.class, UserMapper.class})
public interface ServiceMapper {

    @Mapping(target = "duration", expression = "java(java.time.Duration.ofMinutes(serviceDto.getDuration()))")
    ServiceEntity toEntity(ServiceDto serviceDto);

    @Mapping(target = "duration", expression = "java(serviceEntity.getDuration().toMinutes())")
    ServiceDto toDto(ServiceEntity serviceEntity);

    List<ServiceDto> toDtoList(List<ServiceEntity> serviceEntityList);

    List<ServiceEntity> toEntityList(List<ServiceDto> serviceDtoList);


}
