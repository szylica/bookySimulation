package org.szylica.inzynierka.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "availabilities")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AvailabilityEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Instant startTime;
    private Instant endTime;
    private boolean isTaken;

    @ManyToOne
    @JoinColumn(name = "local_id")
    private LocalEntity local;

}
