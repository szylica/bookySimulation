package org.szylica.inzynierka.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Duration;

@Getter
@Setter
@Entity
@Table(name = "services")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ServiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "local_id")
    private LocalEntity local;
    private String name;
    private String description;
    private Double price;
    private Duration duration;


}
