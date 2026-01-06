package org.szylica.inzynierka.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/geo")
public class GeoController {

    @PostMapping("/get-coordinates")
    public void getCoordinates(){

    }

}
