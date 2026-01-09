package org.szylica.inzynierka.backend.model.dto;

import org.szylica.inzynierka.backend.model.utils.UserRole;

import java.io.Serializable;

public record AuthPrincipal(Long id, String email, UserRole role, String name) implements Serializable {
}
