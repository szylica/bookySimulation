package org.szylica.inzynierka.backend.model.dto.auth;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private String message;
    private String email;
    private String role;
    private String name;

}
