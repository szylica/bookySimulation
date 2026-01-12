package org.szylica.inzynierka.backend.model.dto;

import java.util.List;

public record LocalAndServicesInfoRequest(LocalDto localDto, List<ServiceDto> services) {
}
