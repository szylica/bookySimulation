package org.szylica.inzynierka.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.szylica.inzynierka.backend.mapper.LocalMapper;

import org.szylica.inzynierka.backend.model.dto.MainSiteLocalCard;
import org.szylica.inzynierka.backend.service.AvailabilityService;
import org.szylica.inzynierka.backend.service.LocalService;

import java.util.List;

@RestController
@RequestMapping("/api/main")
@RequiredArgsConstructor
public class MainSiteController {

    private final LocalService localService;
    private final LocalMapper localMapper;
    private final AvailabilityService availabilityService;

    @GetMapping("/get-locals")
    public ResponseEntity<List<MainSiteLocalCard>> getLocals(){
        var locals = localService.findRandomLocals();
        var cards = localMapper.toShortDtoList(locals).stream()
                .map(local -> new MainSiteLocalCard(local, availabilityService.findClosestFreeTermById(local.getId())))
                .toList();
        return ResponseEntity.ok().body(cards);
    }



}
