package com.intern.repository;

import com.intern.entity.TrainingProgramMatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrainingProgramMatchRepository extends JpaRepository<TrainingProgramMatch, Long> {
    Optional<TrainingProgramMatch> findByApplicationId(Long applicationId);
    List<TrainingProgramMatch> findByOverallStatus(String overallStatus);
    List<TrainingProgramMatch> findByCounselorAction(String counselorAction);
}
