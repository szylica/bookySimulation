package org.szylica.inzynierka.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.szylica.inzynierka.backend.model.dto.AvailabilityDto;
import org.szylica.inzynierka.backend.model.dto.LocalDto;
import org.szylica.inzynierka.backend.repository.LocalRepository;
import org.szylica.inzynierka.backend.scheduler.AvailabilityScheduler;
import org.szylica.inzynierka.backend.service.AvailabilityService;
import org.szylica.inzynierka.backend.service.LocalService;


import java.util.List;

@RestController
@RequiredArgsConstructor
public class VisitController {

    private final LocalService localService;
    private final LocalRepository localRepository;
    private final AvailabilityService availabilityService;
    private final AvailabilityScheduler availabilityScheduler;



    @GetMapping("/allLocals2")
    public ResponseEntity<List<LocalDto>> getAllLocals(){
        List<LocalDto> localDtos = localService.findAllLocals();

        if(localDtos.isEmpty()){
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .header("X-Total-Count", String.valueOf(localDtos.size()))
                .body(localDtos);
    }

    @GetMapping("/generateVisits")
    public boolean generateAvailabilities(){
        availabilityScheduler.scheduleDailySlotGeneration();
        return true;
    }

    @GetMapping("/getVisits")
    public List<AvailabilityDto> getAva(){
        var local = localRepository.findById(1L).orElseThrow();
        return availabilityService.findAllAvailabilitiesForLocal(local);
    }

    @GetMapping("/findFirstavailableVisit")
    public AvailabilityDto findFirstAvailableVisit(){
        var local = localRepository.findById(1L).orElseThrow();
        return availabilityService.findClosestFreeTerm(local);
    }
}
