package org.szylica.inzynierka.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDto {
    private Long id;
    private Instant startTime;
    private Instant endTime;
    private boolean isTaken;
}
