package org.szylica.inzynierka.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VisitDto {

    private Long id;

    LocalDate date;
    LocalTime time;
    // Cena będzie kopiowana z usługi aby uniknąć zmian ceny wizyty gdyby cena usługi zmieniła się po umówieniu wizyty
    BigDecimal price;

    private Long localId;
    private Long serviceId;
    private Long workerId;
    private Long customerId;


}
