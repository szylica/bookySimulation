package org.szylica.inzynierka.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.szylica.inzynierka.backend.model.entity.AvailabilityEntity;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;

import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<AvailabilityEntity, Long> {
    List<AvailabilityEntity> findByLocal(LocalEntity local);

    List<AvailabilityEntity> findAllByLocalAndIsTakenFalse(LocalEntity local, boolean isTaken);

    List<AvailabilityEntity> findAllByLocalAndIsTakenIsFalse(LocalEntity local, boolean isTaken);

    List<AvailabilityEntity> findAllByLocalIdAndIsTakenIsFalse(Long localId, boolean isTaken);

    List<AvailabilityEntity> findAllByStartTimeBetween(ZonedDateTime startTimeAfter, ZonedDateTime startTimeBefore);
}
