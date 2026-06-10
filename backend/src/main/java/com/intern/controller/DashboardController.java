package com.intern.controller;

import com.intern.dto.DashboardDTO;
import com.intern.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDTO.DashboardData> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardData());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        DashboardDTO.DashboardData data = dashboardService.getDashboardData();
        DashboardDTO.Stats stats = data.getStats();
        return ResponseEntity.ok(Map.of(
                "jobCount", stats.getJobCount(),
                "applicationCount", stats.getApplicationCount(),
                "pendingReviewCount", stats.getPendingReviewCount(),
                "activeAgreementCount", stats.getActiveAgreementCount()
        ));
    }
}
