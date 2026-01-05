package org.szylica.inzynierka.backend.model.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.*;
import org.szylica.inzynierka.backend.model.utils.UserRole;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationRequestDto {

    private String name;
    private String surname;

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank
    private String phone;

    @NotNull(message = "Role must be selected")
    private UserRole role;

    private String companyName;
    private String nip;
}
