package org.szylica.inzynierka.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.szylica.inzynierka.backend.mapper.LocalMapper;
import org.szylica.inzynierka.backend.mapper.ServiceMapper;
import org.szylica.inzynierka.backend.mapper.VisitMapper;
import org.szylica.inzynierka.backend.model.dto.*;
import org.szylica.inzynierka.backend.model.entity.ServiceEntity;
import org.szylica.inzynierka.backend.security.SecurityUtils;
import org.szylica.inzynierka.backend.service.LocalService;
import org.szylica.inzynierka.backend.service.ServiceService;
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
    private final LocalMapper localMapper;
    private final ServiceService serviceService;
    private final ServiceMapper serviceMapper;

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
        var visits = visitService.getUserVisits(SecurityUtils.getCurrentUserId());
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
    public ResponseEntity<LocalDto> addLocal(@RequestBody LocalDto localDto){
        var localEntity = localService.addLocal(localDto);

        return ResponseEntity.ok().body(localMapper.toDto(localEntity));
    }

    @PostMapping("/info-local")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<LocalDto> localInfo(@RequestBody LocalDto localDto){
        var localEntity = localService.findById(localDto.getId());


        System.out.println("ENTITY: " + localEntity);

        return ResponseEntity.ok().body(localEntity);
    }

    @PostMapping("/add-worker")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> addWorker(@RequestBody WorkerLocal workerLocal){

        System.out.println(workerLocal);

        localService.addWorkerToLocal(
                workerLocal.workerId(),
                workerLocal.localId()
        );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/get-services")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<ServiceDto>> getServices(){

        var services = serviceService.findAllUsersServices(SecurityUtils.getCurrentUserId());

        return ResponseEntity.ok().body(serviceMapper.toDtoList(services));
    }

    @PostMapping("/add-service")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ServiceDto> addService(@RequestBody ServiceDto serviceDto){
        System.out.println("DTO: "+serviceDto);
        var entity = serviceMapper.toEntity(serviceDto);
        System.out.println("Entity: "+entity);
        serviceService.saveService(entity);
        return ResponseEntity.ok().body(serviceMapper.toDto(entity));
    }

    @DeleteMapping("/delete-service")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> deleteService(@RequestBody ServiceDto serviceDto){
        serviceService.deleteService(serviceDto.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/set-local-services")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> setServicesForLocal(@RequestBody LocalAndServicesResponse localAndServicesResponse){
        localService.setUpServicesForLocal(localAndServicesResponse.localId(), localAndServicesResponse.servicesIds());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/change-local-settings")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> changeLocalSettings(@RequestBody LocalDto localDto){
        localService.updateLocal(localDto);
        return ResponseEntity.ok().build();

    }



    /*

            WORKER

     */

    @GetMapping("/get-worker-id")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<Long> getWorkerId(){
        return ResponseEntity.ok().body(SecurityUtils.getCurrentUserId());
    }

}
