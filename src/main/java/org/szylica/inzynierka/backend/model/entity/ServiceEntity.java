package org.szylica.inzynierka.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.szylica.inzynierka.backend.model.converter.DurationMinutesConverter;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "services")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class ServiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double price;

    @Convert(converter = DurationMinutesConverter.class)
    private Duration duration;

    @ManyToOne
    @JoinColumn(name = "service_provider_id")
    private UserEntity serviceProvider;

    @ManyToMany(mappedBy = "services", fetch = FetchType.LAZY)
    private List<LocalEntity> locals;


}
