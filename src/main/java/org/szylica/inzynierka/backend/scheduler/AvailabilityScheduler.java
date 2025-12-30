package org.szylica.inzynierka.backend.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;
import org.szylica.inzynierka.backend.repository.LocalRepository;
import org.szylica.inzynierka.backend.service.AvailabilityService;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AvailabilityScheduler {

    private final LocalRepository localRepository;
    private final AvailabilityService availabilityService;

    // TODO fix:
    // One thread only
    @Scheduled(cron = "0 0 1 * * *", zone = "Europe/Warsaw")
    public void scheduleDailySlotGeneration() {
        List<LocalEntity> localEntities = localRepository.findAll();

        for (LocalEntity local : localEntities){
            var targetDate = LocalDate.now().plusDays(local.getSchedulingLimitInDays());
            availabilityService.generateSlotsForDay(local, targetDate);
        }
    }

}
