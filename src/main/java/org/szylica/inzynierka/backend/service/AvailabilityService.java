package org.szylica.inzynierka.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.mapper.AvailabilityMapper;
import org.szylica.inzynierka.backend.model.dto.AvailabilityDto;
import org.szylica.inzynierka.backend.model.entity.AvailabilityEntity;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;
import org.szylica.inzynierka.backend.repository.AvailabilityRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final AvailabilityMapper availabilityMapper;

    @Transactional
    public void generateSlotsForDay(LocalEntity localEntity, LocalDate date){

        LocalTime openingTime = localEntity.getOpeningTime();
        LocalTime closingTime = localEntity.getClosingTime();
        int durationInMinutes = localEntity.getVisitDurationInMinutes();

        var zoneId = localEntity.getZoneId();

        ZonedDateTime currentZdt = ZonedDateTime.of(date, openingTime, zoneId);
        ZonedDateTime closingZdt = ZonedDateTime.of(date, closingTime, zoneId);

        List<AvailabilityEntity> availabilities = new ArrayList<>();
        while(currentZdt.plusMinutes(durationInMinutes).isBefore(closingZdt) ||
                currentZdt.plusMinutes(durationInMinutes).isEqual(closingZdt)){

            var slot = AvailabilityEntity.builder()
                    .local(localEntity)
                    .startTime(currentZdt.toInstant())
                    .endTime(currentZdt.plusMinutes(durationInMinutes).toInstant())
                    .isTaken(false)
                    .build();

            availabilities.add(slot);
            currentZdt = currentZdt.plusMinutes(durationInMinutes);
        }

        availabilityRepository.saveAll(availabilities);

    }

    @Transactional
    public void setUpSlotsFirstTime(LocalEntity localEntity, LocalDate beginDate){

        var currentDate = beginDate;
        while(currentDate.isBefore(beginDate.plusDays(localEntity.getSchedulingLimitInDays()))
                || currentDate.isEqual(beginDate.plusDays(localEntity.getSchedulingLimitInDays())))
        {
            generateSlotsForDay(localEntity, currentDate);
            currentDate = currentDate.plusDays(1);
        }
    }

    public List<AvailabilityDto> findAllAvailabilitiesForLocal(LocalEntity localEntity){
        var entities = availabilityRepository.findByLocal(localEntity);
        return availabilityMapper.toDtoList(entities);
    }

    public AvailabilityDto findClosestFreeTerm(LocalEntity localEntity){
        return availabilityRepository.findAllByLocalAndIsTakenIsFalse(localEntity, false)
                .stream().min(Comparator.comparing(AvailabilityEntity::getStartTime))
                        .map(availabilityMapper::toDto).orElse(null);

    }

}
