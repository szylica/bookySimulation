package org.szylica.inzynierka.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.szylica.inzynierka.backend.model.entity.VisitEntity;

@Repository
public interface VisitRepository extends JpaRepository<VisitEntity, Long> {
}
