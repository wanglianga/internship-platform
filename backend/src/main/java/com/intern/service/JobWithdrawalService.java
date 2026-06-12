package com.intern.service;

import com.intern.entity.*;
import com.intern.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JobWithdrawalService {

    private final JobWithdrawalRepository jobWithdrawalRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final AgreementRepository agreementRepository;
    private final RiskAlertRepository riskAlertRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final StudentRepository studentRepository;

    public List<JobWithdrawal> findAll() {
        return jobWithdrawalRepository.findAll();
    }

    public Optional<JobWithdrawal> findById(Long id) {
        return jobWithdrawalRepository.findById(id);
    }

    public Optional<JobWithdrawal> findByJobId(Long jobId) {
        return jobWithdrawalRepository.findByJobId(jobId);
    }

    public List<JobWithdrawal> findByEnterpriseId(Long enterpriseId) {
        return jobWithdrawalRepository.findByEnterpriseId(enterpriseId);
    }

    public List<JobWithdrawal> findByStatus(String status) {
        return jobWithdrawalRepository.findByStatus(status);
    }

    @Transactional
    public JobWithdrawal withdrawJob(Long jobId, String reason, String remark) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

        job.setStatus("WITHDRAWN");
        jobRepository.save(job);

        JobWithdrawal withdrawal = JobWithdrawal.builder()
                .jobId(jobId)
                .enterpriseId(job.getEnterpriseId())
                .reason(reason)
                .remark(remark)
                .status("PENDING")
                .withdrawnAt(LocalDateTime.now())
                .build();
        JobWithdrawal savedWithdrawal = jobWithdrawalRepository.save(withdrawal);

        List<Application> applications = applicationRepository.findByJobId(jobId);
        for (Application app : applications) {
            String originalStatus = app.getStatus();
            if ("PENDING_SCREENING".equals(originalStatus) || "APPLIED".equals(originalStatus) || "INTERVIEWING".equals(originalStatus)) {
                app.setStatus("JOB_WITHDRAWN");
                applicationRepository.save(app);
            } else if ("PENDING_HIRE".equals(originalStatus) || "HIRED".equals(originalStatus) || "DEPARTMENT_REVIEW".equals(originalStatus)
                    || "AGREEMENT_PENDING".equals(originalStatus)) {
                app.setStatus("JOB_WITHDRAWN");
                applicationRepository.save(app);
            } else if ("ACTIVE".equals(originalStatus)) {
                app.setStatus("JOB_WITHDRAWN_ACTIVE");
                applicationRepository.save(app);
            }

            RiskAlert alert = RiskAlert.builder()
                    .type("JOB_WITHDRAWN")
                    .level("HIGH")
                    .status("ACTIVE")
                    .description("岗位「" + job.getTitle() + "」已被企业撤回，原因：" + reason
                            + "。原申请状态：" + originalStatus + "，需处理学生安置")
                    .relatedStudentId(app.getStudentId())
                    .relatedJobId(jobId)
                    .detectedAt(LocalDateTime.now())
                    .build();
            riskAlertRepository.save(alert);
        }

        List<Agreement> agreements = agreementRepository.findAll();
        for (Agreement agreement : agreements) {
            Application app = applicationRepository.findById(agreement.getApplicationId()).orElse(null);
            if (app != null && app.getJobId().equals(jobId)) {
                if (!"BREACHED".equals(agreement.getStatus())) {
                    agreement.setStatus("JOB_WITHDRAWN");
                    agreement.setChangeReason("企业撤岗：" + reason);
                    agreementRepository.save(agreement);
                }
            }
        }

        return savedWithdrawal;
    }

    public List<Application> getAffectedApplications(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public List<Agreement> getAffectedAgreements(Long jobId) {
        List<Agreement> result = new ArrayList<>();
        List<Agreement> allAgreements = agreementRepository.findAll();
        for (Agreement agreement : allAgreements) {
            Application app = applicationRepository.findById(agreement.getApplicationId()).orElse(null);
            if (app != null && app.getJobId().equals(jobId)) {
                result.add(agreement);
            }
        }
        return result;
    }

    @Transactional
    public JobWithdrawal processWithdrawal(Long withdrawalId, String status) {
        JobWithdrawal withdrawal = jobWithdrawalRepository.findById(withdrawalId)
                .orElseThrow(() -> new RuntimeException("Job withdrawal not found: " + withdrawalId));
        withdrawal.setStatus(status);
        return jobWithdrawalRepository.save(withdrawal);
    }

    @Transactional
    public List<Application> batchRecommendJobs(Long jobId, List<Long> recommendedJobIds) {
        List<Application> affectedApplications = applicationRepository.findByJobId(jobId);
        List<Application> newApplications = new ArrayList<>();

        for (Application originalApp : affectedApplications) {
            for (Long recommendedJobId : recommendedJobIds) {
                Job recommendedJob = jobRepository.findById(recommendedJobId).orElse(null);
                if (recommendedJob == null || !"OPEN".equals(recommendedJob.getStatus())) {
                    continue;
                }

                Optional<Application> existing = applicationRepository.findByStudentId(originalApp.getStudentId())
                        .stream()
                        .filter(a -> a.getJobId().equals(recommendedJobId))
                        .findFirst();

                if (existing.isEmpty()) {
                    Application newApp = Application.builder()
                            .studentId(originalApp.getStudentId())
                            .jobId(recommendedJobId)
                            .status("RECOMMENDED")
                            .appliedAt(LocalDateTime.now())
                            .build();
                    Application saved = applicationRepository.save(newApp);

                    RiskAlert alert = RiskAlert.builder()
                            .type("JOB_RECOMMENDATION")
                            .level("LOW")
                            .status("ACTIVE")
                            .description("因原岗位「" + jobId + "」撤回，就业办推荐岗位「" + recommendedJob.getTitle() + "」")
                            .relatedStudentId(originalApp.getStudentId())
                            .relatedJobId(recommendedJobId)
                            .detectedAt(LocalDateTime.now())
                            .build();
                    riskAlertRepository.save(alert);

                    newApplications.add(saved);
                }
            }
        }
        return newApplications;
    }

    public String getWithdrawalExplanationForStudent(Long jobId, Long studentId) {
        Job job = jobRepository.findById(jobId).orElse(null);
        JobWithdrawal withdrawal = jobWithdrawalRepository.findByJobId(jobId).orElse(null);
        if (job == null || withdrawal == null) {
            return "";
        }
        Student student = studentRepository.findById(studentId).orElse(null);
        String studentName = student != null ? student.getName() : "同学";

        return "亲爱的" + studentName + "，您申请的「" + job.getTitle() + "」岗位因「"
                + withdrawal.getReason() + "」已被企业撤回。"
                + (withdrawal.getRemark() != null ? "备注：" + withdrawal.getRemark() : "")
                + " 就业办会尽快为您推荐合适的岗位。";
    }
}
