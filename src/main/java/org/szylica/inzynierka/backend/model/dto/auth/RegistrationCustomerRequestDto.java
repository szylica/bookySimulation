package org.szylica.inzynierka.backend.model.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationCustomerRequestDto {

    @NotBlank
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
}
