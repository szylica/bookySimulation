package org.szylica.inzynierka.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.mapper.AvailabilityMapper;
import org.szylica.inzynierka.backend.model.dto.AvailabilityDto;
import org.szylica.inzynierka.backend.model.dto.LocalDto;
import org.szylica.inzynierka.backend.model.entity.AvailabilityEntity;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;
import org.szylica.inzynierka.backend.repository.AvailabilityRepository;
import org.szylica.inzynierka.backend.repository.LocalRepository;

import java.sql.SQLOutput;
import java.time.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final AvailabilityMapper availabilityMapper;
    private final LocalRepository localRepository;

    @Transactional
    public void generateSlotsForDay(LocalEntity localEntity, LocalDate date){

        var openingTime = localEntity.getOpeningTime();
        var closingTime = localEntity.getClosingTime();
        int durationInMinutes = localEntity.getVisitDurationInMinutes();

        var zoneId = localEntity.getZoneId();

        var openingZonedDateTime = ZonedDateTime.of(date, openingTime, zoneId);
        var closingZonedDateTime = ZonedDateTime.of(date, closingTime, zoneId);


        List<AvailabilityEntity> availabilities = new ArrayList<>();
        while(openingZonedDateTime.plusMinutes(durationInMinutes).isBefore(closingZonedDateTime) ||
                openingZonedDateTime.plusMinutes(durationInMinutes).isEqual(closingZonedDateTime)){

            var slot = AvailabilityEntity.builder()
                    .local(localEntity)
                    .startTime(openingZonedDateTime)
                    .endTime(openingZonedDateTime.plusMinutes(durationInMinutes))
                    .isTaken(false)
                    .build();

            availabilities.add(slot);
            openingZonedDateTime = openingZonedDateTime.plusMinutes(durationInMinutes);
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

    public void changeAvailabilityStatus(Long availabilityId, boolean isTaken){
        var availabilityEntity = availabilityRepository.findById(availabilityId).orElseThrow();
        availabilityEntity.setTaken(isTaken);
        availabilityRepository.save(availabilityEntity);
    }

    public List<AvailabilityDto> findAllAvailabilitiesForLocal(LocalEntity localEntity){
        var entities = availabilityRepository.findByLocal(localEntity);
        return availabilityMapper.toDtoList(entities);
    }

    public AvailabilityDto findClosestFreeTerm(LocalEntity localEntity){

        var localZone = localEntity.getZoneId();

        return availabilityRepository
                .findFirstByLocalAndIsTakenFalseAndStartTimeIsAfter(localEntity, ZonedDateTime.now(ZoneId.of("UTC")))
                .stream()
                .peek(System.out::println)
                .findFirst()
                .map(av -> new AvailabilityDto(
                        av.getId(),
                        av.getStartTime().withZoneSameLocal(localZone),
                        av.getEndTime().withZoneSameLocal(localZone),
                        av.isTaken()
                )).orElse(null);
    }

    public AvailabilityDto findClosestFreeTermById(Long localId){
        return findClosestFreeTerm(localRepository.findById(localId).orElseThrow());
    }

    public List<AvailabilityEntity> findAllAvailabilitiesForDay(LocalDate date, LocalDto localDto){

        LocalEntity localEntity = localRepository.findById(localDto.getId()).orElseThrow();

         var availabilitiesForDay = availabilityRepository.findAllByStartTimeBetweenAndLocal(
                ZonedDateTime.of(date, LocalTime.MIN, localEntity.getZoneId()),
                ZonedDateTime.of(date, LocalTime.MAX, localEntity.getZoneId()),
                localRepository.findById(localEntity.getId()).orElseThrow()
        );

        return availabilitiesForDay
                .stream()
                .filter(av -> av.getStartTime().isAfter(ZonedDateTime.now(ZoneId.of("UTC"))))
                .toList();
    }

}
