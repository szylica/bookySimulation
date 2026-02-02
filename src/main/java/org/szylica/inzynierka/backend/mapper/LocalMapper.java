package org.szylica.inzynierka.backend.mapper;

import org.mapstruct.*;
import org.szylica.inzynierka.backend.model.dto.LocalDto;
import org.szylica.inzynierka.backend.model.dto.LocalShortDto;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ServiceMapper.class, VisitMapper.class, UserMapper.class})
public interface LocalMapper {

    @Mapping(source = "serviceProvider.id", target = "serviceProvider")
    LocalDto toDto(LocalEntity localEntity);

    @Mapping(target = "serviceProvider", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    LocalEntity toEntity(LocalDto localDto);

    //@Mapping(source = "serviceProvider.id", target = "serviceProvider")
    LocalShortDto toShortDto(LocalEntity localEntity);

    List<LocalDto> toDtoList(List<LocalEntity> localEntityList);

    List<LocalEntity> toEntityList(List<LocalDto> localDtoList);

    List<LocalShortDto> toShortDtoList(List<LocalEntity> localEntityList);

    @Mapping(target = "serviceProvider", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(LocalDto dto, @MappingTarget LocalEntity entity);

}
