package org.szylica.inzynierka.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.ZonedDateTime;

@Entity
@Table(name = "availabilities")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    private boolean isTaken;

    @ManyToOne
    @JoinColumn(name = "local_id")
    private LocalEntity local;

}
