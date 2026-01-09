package org.szylica.inzynierka.backend.model.dto;

import lombok.*;

@ToString
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String nip;
    private String email;
    private String companyName;
    private String name;
    private String password;
    private String phone;
    private String surname;
}
