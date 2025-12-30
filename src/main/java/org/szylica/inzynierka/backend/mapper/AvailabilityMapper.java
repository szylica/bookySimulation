package org.szylica.inzynierka.backend.mapper;

import org.mapstruct.Mapper;
import org.szylica.inzynierka.backend.model.dto.AvailabilityDto;
import org.szylica.inzynierka.backend.model.entity.AvailabilityEntity;

import java.util.List;

@Mapper(componentModel = "spring", uses = {VisitMapper.class})
public interface AvailabilityMapper {

    AvailabilityDto toDto(AvailabilityEntity availabilityEntity);

    AvailabilityEntity toEntity(AvailabilityDto availabilityDto);

    List<AvailabilityDto> toDtoList(List<AvailabilityEntity> availabilityEntityList);

    List<AvailabilityEntity> toEntityList(List<AvailabilityDto> availabilityDtoList);

}
