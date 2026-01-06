package org.szylica.inzynierka.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.model.dto.auth.AuthResponse;
import org.szylica.inzynierka.backend.model.dto.auth.LoginRequestDto;
import org.szylica.inzynierka.backend.model.dto.auth.RegistrationRequestDto;
import org.szylica.inzynierka.backend.model.entity.UserEntity;
import org.szylica.inzynierka.backend.model.utils.UserRole;

@Service
@RequiredArgsConstructor
public class UserService {


}
