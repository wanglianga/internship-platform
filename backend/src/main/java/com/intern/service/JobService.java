package com.intern.service;

import com.intern.entity.Application;
import com.intern.entity.RiskAlert;
import com.intern.entity.Student;
import com.intern.repository.ApplicationRepository;
import com.intern.repository.RiskAlertRepository;
import com.intern.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final com.intern.repository.JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final RiskAlertRepository riskAlertRepository;
    private final StudentRepository studentRepository;

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
        if (job.getCreatedAt() == null) {
            job.setCreatedAt(LocalDateTime.now());
        }
        if (job.getStatus() == null || job.getStatus().isEmpty()) {
            job.setStatus("OPEN");
        }
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
            if ("PENDING_SCREENING".equals(app.getStatus()) || "APPLIED".equals(app.getStatus()) || "INTERVIEWING".equals(app.getStatus())) {
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

    public List<com.intern.entity.Job> findRecommended(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        List<com.intern.entity.Job> openJobs = jobRepository.findByStatus("OPEN");

        List<String> preferredCities = student.getPreferredCities() != null
                ? Arrays.stream(student.getPreferredCities().split("[,，]"))
                        .map(String::trim).filter(s -> !s.isEmpty()).toList()
                : List.of();

        for (com.intern.entity.Job job : openJobs) {
            int score = 0;
            boolean majorMatch = job.getMajorRequirements() != null
                    && job.getMajorRequirements().contains(student.getMajor());
            boolean cityMatch = !preferredCities.isEmpty()
                    && preferredCities.stream().anyMatch(c -> job.getLocation() != null && job.getLocation().contains(c));

            if (majorMatch) score += 2;
            if (cityMatch) score += 1;

            job.setMajorMatched(majorMatch);
            job.setCityMatched(cityMatch);
            job.setMatchScore(score);
        }

        openJobs.sort((a, b) -> {
            int scoreCompare = Integer.compare(
                    b.getMatchScore() != null ? b.getMatchScore() : 0,
                    a.getMatchScore() != null ? a.getMatchScore() : 0);
            if (scoreCompare != 0) return scoreCompare;
            return b.getCreatedAt() != null && a.getCreatedAt() != null
                    ? b.getCreatedAt().compareTo(a.getCreatedAt()) : 0;
        });

        return openJobs;
    }
}
