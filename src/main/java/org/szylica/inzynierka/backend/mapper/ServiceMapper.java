package org.szylica.inzynierka.backend.mapper;

import org.mapstruct.Mapper;
import org.szylica.inzynierka.backend.model.dto.ServiceDto;
import org.szylica.inzynierka.backend.model.entity.ServiceEntity;

import java.util.List;

@Mapper(componentModel = "spring", uses = {LocalMapper.class})
public interface ServiceMapper {

    ServiceDto toDto(ServiceEntity serviceEntity);

    ServiceEntity toEntity(ServiceDto serviceDto);

    List<ServiceDto> toDtoList(List<ServiceEntity> serviceEntityList);

    List<ServiceEntity> toEntityList(List<ServiceDto> serviceDtoList);


}
