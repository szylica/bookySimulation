package org.szylica.inzynierka.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.szylica.inzynierka.backend.mapper.AvailabilityMapper;
import org.szylica.inzynierka.backend.mapper.LocalMapper;

import org.szylica.inzynierka.backend.mapper.ServiceMapper;
import org.szylica.inzynierka.backend.mapper.UserMapper;
import org.szylica.inzynierka.backend.model.dto.*;
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
    private final UserMapper userMapper;
    private final ServiceMapper serviceMapper;

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
    public ResponseEntity<LocalDto> getLocalData(@RequestBody LocalShortDto localDto){
        return ResponseEntity.ok().body(localService.findById(localDto.getId()));
    }

    @PostMapping("/get-full-local-data")
    public ResponseEntity<FullVisitDataDto> getFullLocalData(@RequestBody LocalShortDto localDto){

        return ResponseEntity.ok().body(new FullVisitDataDto(
                userMapper.toDtoList(localService.findAllWorkersForLocal(localDto.getId())),
                serviceMapper.toDtoList(localService.findAllServicesForLocal(localDto.getId())),
                localService.findById(localDto.getId())
        ));

    }
}
