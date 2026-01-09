package org.szylica.inzynierka.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.szylica.inzynierka.backend.model.dto.VisitDto;
import org.szylica.inzynierka.backend.model.entity.VisitEntity;

import java.util.List;

@Mapper(componentModel = "spring", uses = {LocalMapper.class, ServiceMapper.class, UserMapper.class})
public interface VisitMapper {

    @Mapping(source = "local.id", target = "localId")
    @Mapping(source = "service.id", target = "serviceId")
    @Mapping(source = "worker.id", target = "workerId")
    @Mapping(source = "customer.id", target = "customerId")
    VisitDto toDto(VisitEntity visitEntity);

    VisitEntity toEntity(VisitDto visitDto);

    List<VisitDto> toDtoList(List<VisitEntity> visitEntityList);

    List<VisitEntity> toEntityList(List<VisitDto> visitDtoList);
}
