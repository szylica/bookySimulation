package org.szylica.inzynierka.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.szylica.inzynierka.backend.model.entity.UserEntity;
import org.szylica.inzynierka.backend.model.entity.VisitEntity;
import org.szylica.inzynierka.backend.repository.VisitRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository visitRepository;
    private final AvailabilityService availabilityService;

    @Transactional
    public void saveVisit(VisitEntity visitEntity, Long availabilityId, boolean availabilityStatus){
        visitRepository.save(visitEntity);
        availabilityService.changeAvailabilityStatus(availabilityId, availabilityStatus);
    }

    public void deleteVisit(Long visitId){
        visitRepository.deleteById(visitId);
    }

    public List<VisitEntity> getCustomerVisits(Long userId){
        return visitRepository.findAllByCustomerIdOrderByDate(userId);
    }

    public List<VisitEntity> getWorkerVisits(Long userId){
        return visitRepository.findAllByWorkerIdOrderByDate(userId);
    }

}
