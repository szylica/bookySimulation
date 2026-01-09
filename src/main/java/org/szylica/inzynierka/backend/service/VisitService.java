package org.szylica.inzynierka.backend.service;

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

    public void saveVisit(VisitEntity visitEntity){



        visitRepository.save(visitEntity);
    }

    public void deleteVisit(Long visitId){
        visitRepository.deleteById(visitId);
    }

    public List<VisitEntity> getUserVisits(UserEntity userEntity){
        return visitRepository.findAllByCustomerId(userEntity.getId());
    }


}
