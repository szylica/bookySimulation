package org.szylica.inzynierka.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.szylica.inzynierka.backend.model.dto.LocalDto;
import org.szylica.inzynierka.backend.repository.LocalRepository;
import org.szylica.inzynierka.backend.service.LocalService;

@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
public class ProviderController {

    private final LocalService localService;

    @GetMapping("/my-locals")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> myLocals(@AuthenticationPrincipal String username){
        return ResponseEntity.ok().body(localService.findAllLocalsForLoggedUserShort());
    }

    @PostMapping("/add-local")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> addLocal(@RequestBody LocalDto localDto){
        System.out.println(localDto);
        localService.addLocal(localDto);
        return ResponseEntity.ok().build();
    }

}
