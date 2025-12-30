package org.szylica.inzynierka.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;

import java.time.Duration;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDto {

    private Long id;
    private Long localId;
    private String name;
    private String description;
    private Double price;
    private Duration duration;

}
