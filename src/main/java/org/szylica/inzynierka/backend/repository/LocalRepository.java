package org.szylica.inzynierka.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;
import org.szylica.inzynierka.backend.model.entity.ServiceEntity;
import org.szylica.inzynierka.backend.model.entity.UserEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocalRepository extends JpaRepository<LocalEntity, Long> {
    List<UserEntity> findAllByWorkers_Id(LocalEntity localEntity);

    List<ServiceEntity> findAllByServices_Id(LocalEntity localEntity);

    //@Query("SELECT l FROM LocalEntity l WHERE l.serviceProvider.id = ?1")
    List<LocalEntity> findAllByServiceProviderId(Long id);

    @Query(nativeQuery = true, value = "SELECT * FROM locals ORDER BY RANDOM() LIMIT 9")
    List<LocalEntity> findRandomLocals();

    @Query("SELECT DISTINCT l FROM LocalEntity l " +
            "LEFT JOIN FETCH l.services " +
            "LEFT JOIN FETCH l.workers " +
            "WHERE l.id = :id")
    Optional<LocalEntity> findByIdFull(@Param("id") Long id);

}
