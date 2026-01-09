package org.szylica.inzynierka.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.szylica.inzynierka.backend.model.entity.VisitEntity;

import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<VisitEntity, Long> {
    List<VisitEntity> findAllByCustomerId(Long customerId);
}
