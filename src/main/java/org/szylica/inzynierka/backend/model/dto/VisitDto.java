package org.szylica.inzynierka.backend.model.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class VisitDto {

    private Long id;

    private ZonedDateTime date;

    private Long availabilityId;

    // Cena będzie kopiowana z usługi aby uniknąć zmian ceny wizyty gdyby cena usługi zmieniła się po umówieniu wizyty
    // lub usługa została usunięta przez providera
    private Double price;
    private String serviceName;
    private String serviceDescription;
    private Long duration;

    private Long localId;
    private Long serviceId;
    private Long workerId;
    private Long customerId;

    private UserDto worker;
    private UserDto customer;
    private LocalShortDto local;
}
