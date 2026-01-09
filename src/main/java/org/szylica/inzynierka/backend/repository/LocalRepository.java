package org.szylica.inzynierka.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;
import org.szylica.inzynierka.backend.model.entity.UserEntity;

import java.util.List;

@Repository
public interface LocalRepository extends JpaRepository<LocalEntity, Long> {
    List<UserEntity> findAllByWorkers_Id(LocalEntity localEntity);

    //@Query("SELECT l FROM LocalEntity l WHERE l.serviceProvider.id = ?1")
    List<LocalEntity> findAllByServiceProviderId(Long id);

    @Query(nativeQuery = true, value = "SELECT * FROM locals ORDER BY RANDOM() LIMIT 9")
    List<LocalEntity> findRandomLocals();
}
