package com.intern.repository;

import com.intern.entity.TrainingProgram;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrainingProgramRepository extends JpaRepository<TrainingProgram, Long> {
    Optional<TrainingProgram> findByMajor(String major);
    List<TrainingProgram> findByDepartment(String department);
}
