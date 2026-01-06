package org.szylica.inzynierka.backend.model.utils;

import net.iakovlev.timeshape.TimeZoneEngine;

import java.time.ZoneId;
import java.util.Optional;

public class GeoUtils {

    public static ZoneId getZoneId(double latitude, double longitude){
        TimeZoneEngine engine = TimeZoneEngine.initialize();
        Optional<ZoneId> zoneId = engine.query(latitude, longitude);
        return zoneId.orElse(ZoneId.of("UTC"));
    }

}
