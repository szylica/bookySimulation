package org.szylica.inzynierka.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LocalDto {

    private Long id;
    @NotBlank
    private String name;
    @NotBlank
    private String address;
    @NotBlank
    private String city;
    @NotBlank
    private String postalCode;
    private String phone;
    private ZoneId zoneId;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Integer visitDurationInMinutes;
    private Integer schedulingLimitInDays;

    private List<UserDto> workers = new ArrayList<>();
    private List<ServiceDto> services = new ArrayList<>();
    private List<VisitDto> visits = new ArrayList<>();

    private Long serviceProvider;

}
