package org.szylica.inzynierka.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.szylica.inzynierka.backend.model.dto.AuthPrincipal;
import org.szylica.inzynierka.backend.model.entity.UserEntity;
import org.szylica.inzynierka.backend.repository.UserRepository;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    public static AuthPrincipal getCurrentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("User is not logged in");
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof AuthPrincipal p) {
            return p;
        }

        if (principal instanceof UserEntity u) {
            return new AuthPrincipal(u.getId(), u.getEmail(), u.getRole(), u.getName());
        }

        throw new RuntimeException("Unsupported principal type: " + principal.getClass());
    }

    public static Long getCurrentUserId(){
        return getCurrentPrincipal().id();
    }



}
