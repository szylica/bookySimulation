package org.szylica.inzynierka.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.szylica.inzynierka.backend.model.dto.UserDto;
import org.szylica.inzynierka.backend.service.UserService;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @PatchMapping("/change-settings")
    public ResponseEntity<?> changeSettings(@RequestBody UserDto userDto){
        userService.changeUserData(userDto);
        return ResponseEntity.ok().build();
    }
}
