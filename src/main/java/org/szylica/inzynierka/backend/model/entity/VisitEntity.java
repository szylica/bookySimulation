package org.szylica.inzynierka.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.context.annotation.PropertySource;
import org.szylica.inzynierka.backend.model.converter.DurationMinutesConverter;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;

@Entity
@Table(name = "visits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class VisitEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private ZonedDateTime date;
    // Cena będzie kopiowana z usługi aby uniknąć zmian ceny wizyty gdyby cena usługi zmieniła się po umówieniu wizyty
    private Double price;

    private String serviceName;
    private String serviceDescription;

    @Convert(converter = DurationMinutesConverter.class)
    private Duration duration;

    private boolean isCanceled;


    @ManyToOne
    @JoinColumn(name = "local_id")
    private LocalEntity local;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private ServiceEntity service;

//    @ManyToOne
//    @JoinColumn(name = "worker_id")
//    private WorkerEntity worker;
//
//    @ManyToOne
//    @JoinColumn(name = "customer_id")
//    private CustomerEntity customer1;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity customer;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private UserEntity worker;

}
