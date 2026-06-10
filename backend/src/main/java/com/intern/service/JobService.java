package com.intern.service;

import com.intern.entity.Application;
import com.intern.entity.RiskAlert;
import com.intern.repository.ApplicationRepository;
import com.intern.repository.RiskAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final com.intern.repository.JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final RiskAlertRepository riskAlertRepository;

    public List<com.intern.entity.Job> findAll() {
        return jobRepository.findAll();
    }

    public java.util.Optional<com.intern.entity.Job> findById(Long id) {
        return jobRepository.findById(id);
    }

    public List<com.intern.entity.Job> findByStatus(String status) {
        return jobRepository.findByStatus(status);
    }

    @Transactional
    public com.intern.entity.Job save(com.intern.entity.Job job) {
        return jobRepository.save(job);
    }

    @Transactional
    public com.intern.entity.Job update(Long id, com.intern.entity.Job job) {
        job.setId(id);
        return jobRepository.save(job);
    }

    @Transactional
    public com.intern.entity.Job withdraw(Long id) {
        com.intern.entity.Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
        job.setStatus("WITHDRAWN");
        jobRepository.save(job);

        List<Application> applications = applicationRepository.findByJobId(id);
        for (Application app : applications) {
            if ("APPLIED".equals(app.getStatus()) || "INTERVIEWING".equals(app.getStatus())) {
                app.setStatus("TERMINATED");
                applicationRepository.save(app);
            }
        }

        RiskAlert alert = RiskAlert.builder()
                .type("JOB_WITHDRAWN")
                .level("MEDIUM")
                .status("ACTIVE")
                .description("岗位「" + job.getTitle() + "」已被撤回，相关申请需处理")
                .relatedJobId(id)
                .detectedAt(LocalDateTime.now())
                .build();
        riskAlertRepository.save(alert);

        return job;
    }
}
