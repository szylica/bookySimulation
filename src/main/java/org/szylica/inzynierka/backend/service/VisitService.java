package org.szylica.inzynierka.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.model.entity.VisitEntity;
import org.szylica.inzynierka.backend.repository.VisitRepository;

@Service
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository visitRepository;

    public void saveVisit(VisitEntity visitEntity){
        visitRepository.save(visitEntity);
    }
}
