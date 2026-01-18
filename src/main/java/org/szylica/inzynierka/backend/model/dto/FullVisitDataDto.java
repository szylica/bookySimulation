package org.szylica.inzynierka.backend.model.dto;

import org.szylica.inzynierka.backend.model.entity.UserEntity;

import java.util.List;

public record FullVisitDataDto(List<UserDto> workers,
        List<ServiceDto> services,
        LocalDto local) {
}
