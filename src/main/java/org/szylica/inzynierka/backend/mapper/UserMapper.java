package org.szylica.inzynierka.backend.mapper;

import org.mapstruct.Mapper;
import org.szylica.inzynierka.backend.model.dto.UserDto;
import org.szylica.inzynierka.backend.model.entity.UserEntity;

import java.util.List;

@Mapper(componentModel = "spring", uses = {LocalMapper.class, VisitMapper.class})
public interface UserMapper {

    UserDto toDto(UserEntity userEntity);

    UserEntity toEntity(UserDto userDto);

    List<UserDto> toDtoList(List<UserEntity> userEntityList);

    List<UserEntity> toEntityList(List<UserDto> userDtoList);

}
