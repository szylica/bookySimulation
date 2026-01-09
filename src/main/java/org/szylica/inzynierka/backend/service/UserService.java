package org.szylica.inzynierka.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.mapper.UserMapper;
import org.szylica.inzynierka.backend.model.dto.UserDto;
import org.szylica.inzynierka.backend.model.dto.auth.AuthResponse;
import org.szylica.inzynierka.backend.model.dto.auth.LoginRequestDto;
import org.szylica.inzynierka.backend.model.dto.auth.RegistrationRequestDto;
import org.szylica.inzynierka.backend.model.entity.UserEntity;
import org.szylica.inzynierka.backend.model.utils.UserRole;
import org.szylica.inzynierka.backend.repository.UserRepository;
import org.szylica.inzynierka.backend.security.SecurityUtils;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public void changeUserData(UserDto userDto){
        UserEntity userEntity = userRepository.findById(SecurityUtils.getCurrentUserId()).orElseThrow();
        System.out.println("DTO:" + userDto);
        userMapper.updateEntityFromDto(userDto, userEntity);
        System.out.println("entity:" + userEntity);

        userRepository.save(userEntity);
    }

    public void deleteUser(Long userId){
        userRepository.deleteById(userId);
    }

}
