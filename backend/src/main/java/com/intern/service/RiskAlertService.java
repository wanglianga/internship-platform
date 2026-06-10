package com.intern.service;

import com.intern.entity.RiskAlert;
import com.intern.repository.RiskAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RiskAlertService {

    private final RiskAlertRepository riskAlertRepository;

    public List<RiskAlert> findAll() {
        return riskAlertRepository.findAll();
    }

    public Optional<RiskAlert> findById(Long id) {
        return riskAlertRepository.findById(id);
    }

    public List<RiskAlert> findByType(String type) {
        return riskAlertRepository.findByType(type);
    }

    public List<RiskAlert> findByLevel(String level) {
        return riskAlertRepository.findByLevel(level);
    }

    public List<RiskAlert> findByStatus(String status) {
        return riskAlertRepository.findByStatus(status);
    }

    public List<RiskAlert> findByTypeAndLevelAndStatus(String type, String level, String status) {
        return riskAlertRepository.findByTypeAndLevelAndStatus(type, level, status);
    }

    @Transactional
    public RiskAlert resolve(Long id, String resolution) {
        RiskAlert alert = riskAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RiskAlert not found: " + id));
        alert.setStatus("RESOLVED");
        alert.setResolution(resolution);
        alert.setResolvedAt(LocalDateTime.now());
        return riskAlertRepository.save(alert);
    }
}
