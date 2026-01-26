package org.szylica.inzynierka.backend.model.dto;

import lombok.*;

@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String nip;
    private String email;
    private String companyName;
    private String name;
    private String phone;
    private String surname;
}
