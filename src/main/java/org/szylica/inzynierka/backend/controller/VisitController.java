package org.szylica.inzynierka.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.szylica.inzynierka.backend.mapper.VisitMapper;
import org.szylica.inzynierka.backend.model.dto.AvailabilityDto;
import org.szylica.inzynierka.backend.model.dto.LocalDto;
import org.szylica.inzynierka.backend.model.dto.VisitDto;
import org.szylica.inzynierka.backend.repository.LocalRepository;
import org.szylica.inzynierka.backend.scheduler.AvailabilityScheduler;
import org.szylica.inzynierka.backend.security.SecurityUtils;
import org.szylica.inzynierka.backend.service.AvailabilityService;
import org.szylica.inzynierka.backend.service.LocalService;
import org.szylica.inzynierka.backend.service.VisitService;


import java.util.List;

@RestController
@RequestMapping("/api/visit")
@RequiredArgsConstructor
public class VisitController {

    private final LocalService localService;
    private final LocalRepository localRepository;
    private final AvailabilityService availabilityService;
    private final AvailabilityScheduler availabilityScheduler;
    private final VisitService visitService;
    private final VisitMapper visitMapper;

    @PostMapping("/set-up-visit")
    public ResponseEntity<Void> setUpVisit(@RequestBody VisitDto visitDto){

        visitDto.setCustomerId(SecurityUtils.getCurrentUserId());

        var visitEntity = visitMapper.toEntity(visitDto);

        visitService.saveVisit(visitEntity, visitDto.getAvailabilityId(), true);

        return ResponseEntity.ok().build();
    }



//    @GetMapping("/allLocals2")
//    public ResponseEntity<List<LocalDto>> getAllLocals(){
//        List<LocalDto> localDtos = localService.findAllLocals();
//
//        if(localDtos.isEmpty()){
//            return ResponseEntity.noContent().build();
//        }
//
//        return ResponseEntity
//                .status(HttpStatus.OK)
//                .header("X-Total-Count", String.valueOf(localDtos.size()))
//                .body(localDtos);
//    }
//
//    @GetMapping("/generateVisits")
//    public boolean generateAvailabilities(){
//        availabilityScheduler.scheduleDailySlotGeneration();
//        return true;
//    }
//
//    @GetMapping("/getVisits")
//    public List<AvailabilityDto> getAva(){
//        var local = localRepository.findById(1L).orElseThrow();
//        return availabilityService.findAllAvailabilitiesForLocal(local);
//    }
//
//    @GetMapping("/findFirstavailableVisit")
//    public AvailabilityDto findFirstAvailableVisit(){
//        var local = localRepository.findById(1L).orElseThrow();
//        return availabilityService.findClosestFreeTerm(local);
//    }
}
