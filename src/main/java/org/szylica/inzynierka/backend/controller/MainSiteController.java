package org.szylica.inzynierka.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.szylica.inzynierka.backend.mapper.AvailabilityMapper;
import org.szylica.inzynierka.backend.mapper.LocalMapper;

import org.szylica.inzynierka.backend.model.dto.AvailabilityDto;
import org.szylica.inzynierka.backend.model.dto.AvailabilityRequest;
import org.szylica.inzynierka.backend.model.dto.LocalDto;
import org.szylica.inzynierka.backend.model.dto.MainSiteLocalCard;
import org.szylica.inzynierka.backend.service.AvailabilityService;
import org.szylica.inzynierka.backend.service.LocalService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/main")
@RequiredArgsConstructor
public class MainSiteController {

    private final LocalService localService;
    private final LocalMapper localMapper;
    private final AvailabilityService availabilityService;
    private final AvailabilityMapper availabilityMapper;

    @GetMapping("/get-locals")
    public ResponseEntity<List<MainSiteLocalCard>> getLocals(){
        var locals = localService.findRandomLocals();
        var cards = localMapper.toShortDtoList(locals).stream()
                .map(local -> new MainSiteLocalCard(local, availabilityService.findClosestFreeTermById(local.getId())))
                .toList();
        return ResponseEntity.ok().body(cards);
    }

    @PostMapping("/get-availabilities")
    public ResponseEntity<List<AvailabilityDto>> getAvailabilitiesForDayForLocal(@RequestBody AvailabilityRequest availabilityRequest){

        var aaa = availabilityService.findAllAvailabilitiesForDay(
                availabilityRequest.date(),
                availabilityRequest.localDto()
        );

        return ResponseEntity.ok().body(
                availabilityMapper.toDtoList(aaa));
    }

    @PostMapping("/get-local-data")
    public ResponseEntity<LocalDto> getLocalData(@RequestBody Long id){
        return ResponseEntity.ok().body(
                localMapper.toDto(localService.findById(id))
        );
    }
}
