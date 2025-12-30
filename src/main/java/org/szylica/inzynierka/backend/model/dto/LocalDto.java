package org.szylica.inzynierka.backend.model.dto;

import lombok.*;
import org.apache.catalina.User;

import java.util.ArrayList;
import java.util.List;

@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LocalDto {

    private Long id;
    private String name;
    private String address;
    private List<UserDto> workers = new ArrayList<>();


    private List<ServiceDto> serviceList = new ArrayList<>();


    private List<VisitDto> visits = new ArrayList<>();
    private Long serviceProvider;

}
