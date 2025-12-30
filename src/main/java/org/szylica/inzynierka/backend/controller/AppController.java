package org.szylica.inzynierka.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.szylica.inzynierka.backend.model.dto.LocalDto;
import org.szylica.inzynierka.backend.service.LocalService;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AppController {

    private final LocalService localService;


    @GetMapping("/hello")
    public void hello() {

    }

    @GetMapping("/allLocals")
    public List<LocalDto> getAllLocals(){
        System.out.println("---------------- W KONTROLERZE ----------------");
        System.out.println(localService.findAllLocals());
        return localService.findAllLocals();
    }
}