package org.szylica.inzynierka.backend.model.dto;

import java.util.List;

public record LocalAndServicesResponse(Long localId, List<Long> servicesIds) {
}
