package org.szylica.inzynierka.backend.model.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.Duration;

@Converter(autoApply = false) // Ustawiamy na false, by stosować go tylko tam, gdzie chcemy
public class DurationMinutesConverter implements AttributeConverter<Duration, Long> {

    @Override
    public Long convertToDatabaseColumn(Duration duration) {
        if (duration == null) {
            return null;
        }
        return duration.toMinutes();
    }

    @Override
    public Duration convertToEntityAttribute(Long dbData) {
        if (dbData == null) {
            return null;
        }
        return Duration.ofMinutes(dbData);
    }
}