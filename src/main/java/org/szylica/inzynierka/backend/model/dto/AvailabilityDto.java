package org.szylica.inzynierka.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDto {
    private Long id;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    private boolean isTaken;
}
