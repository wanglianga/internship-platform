package com.intern.service;

import com.intern.dto.DashboardDTO;
import com.intern.entity.Application;
import com.intern.entity.Review;
import com.intern.entity.RiskAlert;
import com.intern.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ReviewRepository reviewRepository;
    private final AgreementRepository agreementRepository;
    private final RiskAlertRepository riskAlertRepository;
    private final StudentRepository studentRepository;

    public DashboardDTO.DashboardData getDashboardData() {
        DashboardDTO.Stats stats = DashboardDTO.Stats.builder()
                .jobCount(jobRepository.count())
                .applicationCount(applicationRepository.count())
                .pendingReviewCount(reviewRepository.findByStatus("PENDING").size())
                .activeAgreementCount(agreementRepository.findByStatus("ACTIVE").size())
                .build();

        List<Application> recentApps = applicationRepository.findAll().stream()
                .sorted(Comparator.comparing(Application::getAppliedAt).reversed())
                .limit(5)
                .collect(Collectors.toList());

        List<DashboardDTO.TodoItem> recentApplications = recentApps.stream()
                .map(app -> DashboardDTO.TodoItem.builder()
                        .id(app.getId())
                        .title(studentRepository.findById(app.getStudentId()).map(s -> s.getName()).orElse("学生ID:" + app.getStudentId()) + " 申请了 " + jobRepository.findById(app.getJobId()).map(j -> j.getTitle()).orElse("岗位ID:" + app.getJobId()))
                        .type("APPLICATION")
                        .urgency("PENDING_SCREENING".equals(app.getStatus()) || "APPLIED".equals(app.getStatus()) ? "HIGH" : "MEDIUM")
                        .build())
                .collect(Collectors.toList());

        List<Review> pendingReviews = reviewRepository.findByStatus("PENDING");
        List<DashboardDTO.TodoItem> pendingReviewItems = pendingReviews.stream()
                .map(review -> DashboardDTO.TodoItem.builder()
                        .id(review.getId())
                        .title("审核申请ID:" + review.getApplicationId())
                        .type(review.getType())
                        .urgency("HIGH")
                        .build())
                .collect(Collectors.toList());

        List<RiskAlert> activeRisks = riskAlertRepository.findAll().stream()
                .filter(r -> !"RESOLVED".equals(r.getStatus()))
                .sorted(Comparator.comparing(RiskAlert::getDetectedAt).reversed())
                .limit(5)
                .collect(Collectors.toList());
        List<DashboardDTO.RiskSummary> riskSummaries = activeRisks.stream()
                .map(alert -> DashboardDTO.RiskSummary.builder()
                        .id(alert.getId())
                        .type(alert.getType())
                        .level(alert.getLevel())
                        .description(alert.getDescription())
                        .build())
                .collect(Collectors.toList());

        List<DashboardDTO.Activity> recentActivities = applicationRepository.findAll().stream()
                .sorted(Comparator.comparing(Application::getAppliedAt).reversed())
                .limit(10)
                .map(app -> DashboardDTO.Activity.builder()
                        .id(app.getId())
                        .content(studentRepository.findById(app.getStudentId()).map(s -> s.getName()).orElse("学生ID:" + app.getStudentId()) + " " + getStatusDescription(app.getStatus()) + " " + jobRepository.findById(app.getJobId()).map(j -> j.getTitle()).orElse("岗位ID:" + app.getJobId()))
                        .timestamp(app.getAppliedAt())
                        .type("APPLICATION")
                        .build())
                .collect(Collectors.toList());

        return DashboardDTO.DashboardData.builder()
                .stats(stats)
                .recentApplications(recentApplications)
                .pendingReviews(pendingReviewItems)
                .activeRisks(riskSummaries)
                .recentActivities(recentActivities)
                .build();
    }

    private String getStatusDescription(String status) {
        switch (status) {
            case "PENDING_SCREENING": return "提交了实习申请（待筛选）";
            case "APPLIED": return "提交了实习申请";
            case "INTERVIEWING": return "进入面试阶段";
            case "PENDING_HIRE": return "待录用";
            case "HIRED": return "已录用";
            case "REJECTED": return "申请被拒绝";
            case "DEPARTMENT_REVIEW": return "等待院系审核";
            case "AGREEMENT_PENDING": return "等待签署协议";
            case "ACTIVE": return "实习中";
            case "COMPLETED": return "实习已完成";
            default: return status;
        }
    }
}
