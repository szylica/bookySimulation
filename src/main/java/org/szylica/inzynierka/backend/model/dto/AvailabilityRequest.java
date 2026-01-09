package org.szylica.inzynierka.backend.model.dto;

import java.time.LocalDate;

public record AvailabilityRequest(LocalDto localDto, LocalDate date) {
}
