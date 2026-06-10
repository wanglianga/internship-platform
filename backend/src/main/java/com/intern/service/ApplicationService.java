package com.intern.service;

import com.intern.entity.*;
import com.intern.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final AgreementRepository agreementRepository;
    private final RiskAlertRepository riskAlertRepository;
    private final com.intern.repository.TrainingProgramMatchRepository trainingProgramMatchRepository;
    private final com.intern.service.TrainingProgramService trainingProgramService;

    public List<Application> findAll() {
        return applicationRepository.findAll();
    }

    public Optional<Application> findById(Long id) {
        return applicationRepository.findById(id);
    }

    public List<Application> findByStudentId(Long studentId) {
        return applicationRepository.findByStudentId(studentId);
    }

    public List<Application> findByJobId(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public List<Application> findByStatus(String status) {
        return applicationRepository.findByStatus(status);
    }

    @Transactional
    public Application apply(Long studentId, Long jobId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

        if (job.getMajorRequirements() != null && !job.getMajorRequirements().contains(student.getMajor())) {
            RiskAlert alert = RiskAlert.builder()
                    .type("MAJOR_MISMATCH")
                    .level("MEDIUM")
                    .status("ACTIVE")
                    .relatedStudentId(studentId)
                    .relatedJobId(jobId)
                    .detectedAt(LocalDateTime.now())
                    .build();
            riskAlertRepository.save(alert);
        }

        List<Agreement> activeAgreements = agreementRepository.findByStatus("ACTIVE");
        for (Agreement agreement : activeAgreements) {
            Application relatedApp = applicationRepository.findById(agreement.getApplicationId()).orElse(null);
            if (relatedApp != null && relatedApp.getStudentId().equals(studentId)) {
                RiskAlert alert = RiskAlert.builder()
                        .type("DUPLICATE_SIGNING")
                        .level("HIGH")
                        .status("ACTIVE")
                        .description("学生" + student.getName() + "已有活跃三方协议，再次申请实习岗位")
                        .relatedStudentId(studentId)
                        .relatedAgreementId(agreement.getId())
                        .detectedAt(LocalDateTime.now())
                        .build();
                riskAlertRepository.save(alert);
                break;
            }
        }

        Application application = Application.builder()
                .studentId(studentId)
                .jobId(jobId)
                .status("APPLIED")
                .appliedAt(LocalDateTime.now())
                .build();
        return applicationRepository.save(application);
    }

    @Transactional
    public Application interview(Long id, String time, String location, String method) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));
        app.setStatus("INTERVIEWING");
        app.setInterviewTime(time);
        app.setInterviewLocation(location);
        app.setInterviewMethod(method);
        app.setInterviewedAt(LocalDateTime.now());
        return applicationRepository.save(app);
    }

    @Transactional
    public Application hire(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));
        app.setStatus("HIRED");
        app.setHiredAt(LocalDateTime.now());

        Job job = jobRepository.findById(app.getJobId()).orElse(null);
        if (job != null) {
            app.setJobResponsibilitiesSnapshot(job.getDescription());
            if (job.getInternshipMonths() != null) {
                app.setInternshipMonths(job.getInternshipMonths());
            }
        }

        Application savedApp = applicationRepository.save(app);
        trainingProgramService.checkMatch(id);
        return savedApp;
    }

    @Transactional
    public Application reject(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));
        app.setStatus("REJECTED");
        return applicationRepository.save(app);
    }
}
