package com.intern.repository;

import com.intern.entity.RiskAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RiskAlertRepository extends JpaRepository<RiskAlert, Long> {
    List<RiskAlert> findByStatus(String status);
    List<RiskAlert> findByType(String type);
    List<RiskAlert> findByLevel(String level);
    List<RiskAlert> findByTypeAndLevelAndStatus(String type, String level, String status);
}
