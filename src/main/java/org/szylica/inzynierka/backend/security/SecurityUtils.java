package org.szylica.inzynierka.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.szylica.inzynierka.backend.model.entity.UserEntity;
import org.szylica.inzynierka.backend.repository.UserRepository;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    public static Long getCurrentUserId(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.getPrincipal() instanceof UserEntity user){
            return user.getId();
        }
        throw new RuntimeException("User is not logged in");
    }


}
