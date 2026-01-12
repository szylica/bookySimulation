package org.szylica.inzynierka.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.szylica.inzynierka.backend.model.entity.AvailabilityEntity;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;

import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<AvailabilityEntity, Long> {
    List<AvailabilityEntity> findByLocal(LocalEntity local);





    List<AvailabilityEntity> findAllByStartTimeBetweenAndLocal(ZonedDateTime of, ZonedDateTime of1, LocalEntity localEntity);

    Collection<AvailabilityEntity> findFirstByLocalAndIsTakenFalseAndStartTimeIsAfter(LocalEntity local, ZonedDateTime startTime);
}
