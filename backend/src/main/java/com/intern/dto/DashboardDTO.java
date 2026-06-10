package com.intern.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class DashboardDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Stats {
        private long jobCount;
        private long applicationCount;
        private long pendingReviewCount;
        private long activeAgreementCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TodoItem {
        private Long id;
        private String title;
        private String type;
        private String urgency;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RiskSummary {
        private Long id;
        private String type;
        private String level;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Activity {
        private Long id;
        private String content;
        private LocalDateTime timestamp;
        private String type;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardData {
        private Stats stats;
        private List<TodoItem> recentApplications;
        private List<TodoItem> pendingReviews;
        private List<RiskSummary> activeRisks;
        private List<Activity> recentActivities;
    }
}
