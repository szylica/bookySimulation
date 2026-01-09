package org.szylica.inzynierka.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.szylica.inzynierka.backend.mapper.VisitMapper;
import org.szylica.inzynierka.backend.model.dto.LocalDto;
import org.szylica.inzynierka.backend.model.dto.UserDto;
import org.szylica.inzynierka.backend.model.dto.VisitDto;
import org.szylica.inzynierka.backend.security.SecurityUtils;
import org.szylica.inzynierka.backend.service.LocalService;
import org.szylica.inzynierka.backend.service.UserService;
import org.szylica.inzynierka.backend.service.VisitService;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final VisitService visitService;
    private final VisitMapper visitMapper;
    private final LocalService localService;

    /*

            USER

     */


    @PatchMapping("/change-settings")
    public ResponseEntity<?> changeSettings(@RequestBody UserDto userDto){
        userService.changeUserData(userDto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<List<VisitDto>> myReservations(){
        var visits = visitService.getUserVisits(SecurityUtils.getCurrentUserEntity());
        return ResponseEntity.ok().body(visitMapper.toDtoList(visits));
    }

    @DeleteMapping("/delete-user")
    public ResponseEntity<?> deleteUser(){
        userService.deleteUser(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok().build();
    }

    /*

            PROVIDER

     */

    @GetMapping("/my-locals")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> myLocals(@AuthenticationPrincipal String username){
        return ResponseEntity.ok().body(localService.findAllLocalsForLoggedUserShort());
    }

    @PostMapping("/add-local")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> addLocal(@RequestBody LocalDto localDto){
        localService.addLocal(localDto);

        return ResponseEntity.ok().build();
    }

}
