package org.szylica.inzynierka.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LocalShortDto {

    private Long id;
    private String name;
    private String city;
    private String address;
    private String phone;
    private Long serviceProvider;

}
