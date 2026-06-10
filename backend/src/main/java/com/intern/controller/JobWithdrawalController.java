package com.intern.controller;

import com.intern.entity.*;
import com.intern.repository.*;
import com.intern.service.JobWithdrawalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/job-withdrawals")
@RequiredArgsConstructor
public class JobWithdrawalController {

    private final JobWithdrawalService jobWithdrawalService;
    private final JobRepository jobRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final AgreementRepository agreementRepository;

    @GetMapping
    public ResponseEntity<List<JobWithdrawal>> listWithdrawals(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long enterpriseId) {
        List<JobWithdrawal> withdrawals = jobWithdrawalService.findAll();
        if (status != null && !status.isEmpty()) {
            withdrawals = withdrawals.stream()
                    .filter(w -> status.equals(w.getStatus()))
                    .collect(Collectors.toList());
        }
        if (enterpriseId != null) {
            withdrawals = withdrawals.stream()
                    .filter(w -> enterpriseId.equals(w.getEnterpriseId()))
                    .collect(Collectors.toList());
        }
        withdrawals.forEach(this::enrichWithdrawal);
        return ResponseEntity.ok(withdrawals);
    }

    @PostMapping
    public ResponseEntity<JobWithdrawal> withdrawJob(@RequestBody Map<String, Object> body) {
        Long jobId = Long.valueOf(body.get("jobId").toString());
        String reason = (String) body.get("reason");
        String remark = (String) body.get("remark");
        JobWithdrawal withdrawal = jobWithdrawalService.withdrawJob(jobId, reason, remark);
        enrichWithdrawal(withdrawal);
        return ResponseEntity.status(HttpStatus.CREATED).body(withdrawal);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobWithdrawal> getWithdrawal(@PathVariable Long id) {
        return jobWithdrawalService.findById(id)
                .map(w -> { enrichWithdrawal(w); return ResponseEntity.ok(w); })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<JobWithdrawal> getWithdrawalByJobId(@PathVariable Long jobId) {
        return jobWithdrawalService.findByJobId(jobId)
                .map(w -> { enrichWithdrawal(w); return ResponseEntity.ok(w); })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{jobId}/affected-applications")
    public ResponseEntity<List<Application>> getAffectedApplications(@PathVariable Long jobId) {
        List<Application> applications = jobWithdrawalService.getAffectedApplications(jobId);
        applications.forEach(this::enrichApplication);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/{jobId}/affected-agreements")
    public ResponseEntity<List<Agreement>> getAffectedAgreements(@PathVariable Long jobId) {
        List<Agreement> agreements = jobWithdrawalService.getAffectedAgreements(jobId);
        agreements.forEach(this::enrichAgreement);
        return ResponseEntity.ok(agreements);
    }

    @PutMapping("/{withdrawalId}/process")
    public ResponseEntity<JobWithdrawal> processWithdrawal(
            @PathVariable Long withdrawalId,
            @RequestBody Map<String, String> body) {
        JobWithdrawal withdrawal = jobWithdrawalService.processWithdrawal(
                withdrawalId, body.get("status"));
        enrichWithdrawal(withdrawal);
        return ResponseEntity.ok(withdrawal);
    }

    @PostMapping("/{jobId}/batch-recommend")
    public ResponseEntity<List<Application>> batchRecommendJobs(
            @PathVariable Long jobId,
            @RequestBody Map<String, List<Long>> body) {
        List<Long> recommendedJobIds = body.get("recommendedJobIds");
        List<Application> applications = jobWithdrawalService.batchRecommendJobs(jobId, recommendedJobIds);
        applications.forEach(this::enrichApplication);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/{jobId}/explanation/{studentId}")
    public ResponseEntity<Map<String, String>> getWithdrawalExplanation(
            @PathVariable Long jobId,
            @PathVariable Long studentId) {
        String explanation = jobWithdrawalService.getWithdrawalExplanationForStudent(jobId, studentId);
        return ResponseEntity.ok(Map.of("explanation", explanation));
    }

    private void enrichWithdrawal(JobWithdrawal withdrawal) {
        jobRepository.findById(withdrawal.getJobId())
                .ifPresent(j -> withdrawal.setJobTitle(j.getTitle()));
        enterpriseRepository.findById(withdrawal.getEnterpriseId())
                .ifPresent(e -> withdrawal.setEnterpriseName(e.getName()));
    }

    private void enrichApplication(Application app) {
        studentRepository.findById(app.getStudentId()).ifPresent(s -> {
            app.setStudentName(s.getName());
            app.setStudentMajor(s.getMajor());
        });
        jobRepository.findById(app.getJobId()).ifPresent(j -> {
            app.setJobTitle(j.getTitle());
            app.setJobMajorRequirements(j.getMajorRequirements());
        });
    }

    private void enrichAgreement(Agreement agreement) {
        applicationRepository.findById(agreement.getApplicationId()).ifPresent(app -> {
            studentRepository.findById(app.getStudentId()).ifPresent(s -> agreement.setStudentName(s.getName()));
            jobRepository.findById(app.getJobId()).ifPresent(j -> agreement.setJobTitle(j.getTitle()));
            enterpriseRepository.findById(j -> j.getEnterpriseId() != null ? j.getEnterpriseId() : null)
                    .ifPresent(e -> agreement.setEnterpriseName(e.getName()));
        });
    }
}
