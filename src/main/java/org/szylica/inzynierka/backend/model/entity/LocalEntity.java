package org.szylica.inzynierka.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "locals")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class LocalEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String city;
    private String postalCode;
    private String address;
    private String phone;

    private LocalTime openingTime;
    private LocalTime closingTime;

    private Integer visitDurationInMinutes;
    private Integer schedulingLimitInDays;

    private ZoneId zoneId;


    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JoinTable(
            name = "workers_locals",
            joinColumns = @JoinColumn(name = "local_id"),
            inverseJoinColumns = @JoinColumn(name = "worker_id", referencedColumnName = "id")
    )
    @Builder.Default
    private List<UserEntity> workers = new ArrayList<>();

    @OneToMany(mappedBy = "local", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ServiceEntity> serviceList = new ArrayList<>();

    @OneToMany(mappedBy = "local")
    @Builder.Default
    private List<VisitEntity> visits = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "service_provider_id")
    private UserEntity serviceProvider;

    @OneToMany(mappedBy = "local")
    @Builder.Default
    private List<AvailabilityEntity> availabilities = new ArrayList<>();

    public String toString(){
        return "%s, %s, %s".formatted(id, name, address);
    }

}
