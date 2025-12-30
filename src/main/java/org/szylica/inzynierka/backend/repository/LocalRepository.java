package org.szylica.inzynierka.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.szylica.inzynierka.backend.model.entity.LocalEntity;
import org.szylica.inzynierka.backend.model.entity.UserEntity;

import java.util.List;

@Repository
public interface LocalRepository extends JpaRepository<LocalEntity, Long> {
    List<UserEntity> findAllByWorkers_Id(LocalEntity localEntity);
}
