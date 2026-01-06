package org.szylica.inzynierka.backend.service;

import jdk.jfr.Registered;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.szylica.inzynierka.backend.model.dto.LonAndLat;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class GeoService {
    private final RestClient restClient;

    public String getCityData(String cityName) {
        return restClient.get()
                .uri("https://nominatim.openstreetmap.org/search?q={city}&format=jsonv2", cityName.replace(" ", "+"))
                .header("User-Agent", "InzynierkaApp/1.0 ")
                .retrieve()
                .body(String.class);
    }

    public LonAndLat getLonAndLat(String json){
        ObjectMapper mapper = new ObjectMapper();
        double lat = 0;
        double lon = 0;
        try {
            JsonNode root = mapper.readTree(json);


            if (root.isArray() && !root.isEmpty()) {

                JsonNode firstResult = root.get(0);


                lat = firstResult.get("lat").asDouble();
                lon = firstResult.get("lon").asDouble();

            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return new LonAndLat(lon, lat);
    }
}
