package org.szylica.inzynierka.backend.model.dto;

import lombok.*;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;

import java.time.Duration;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ServiceDto {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private Long duration;

}
