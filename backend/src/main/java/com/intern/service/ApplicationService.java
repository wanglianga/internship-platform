package com.intern.service;

import com.intern.dto.DuplicateSigningBlockDTO;
import com.intern.entity.*;
import com.intern.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
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
    private final EnterpriseRepository enterpriseRepository;
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

    public DuplicateSigningBlockDTO checkDuplicateSigning(Long studentId, Long newJobId) {
        List<String> activeAgreementStatuses = Arrays.asList("STAMPED", "ACTIVE", "CHANGING");
        List<Agreement> activeAgreements = agreementRepository.findAll().stream()
                .filter(a -> activeAgreementStatuses.contains(a.getStatus()))
                .toList();

        for (Agreement agreement : activeAgreements) {
            Application relatedApp = applicationRepository.findById(agreement.getApplicationId()).orElse(null);
            if (relatedApp != null && relatedApp.getStudentId().equals(studentId)) {
                Job existingJob = jobRepository.findById(relatedApp.getJobId()).orElse(null);
                Enterprise existingEnterprise = existingJob != null ? enterpriseRepository.findById(existingJob.getEnterpriseId()).orElse(null) : null;
                Student student = studentRepository.findById(studentId).orElse(null);

                RiskAlert alert = RiskAlert.builder()
                        .type("DUPLICATE_SIGNING")
                        .level("HIGH")
                        .status("ACTIVE")
                        .description("学生" + (student != null ? student.getName() : studentId)
                                + "已与" + (existingEnterprise != null ? existingEnterprise.getName() : "某企业")
                                + "签订三方协议，拟再次接受其他企业录用")
                        .relatedStudentId(studentId)
                        .relatedAgreementId(agreement.getId())
                        .relatedJobId(newJobId)
                        .detectedAt(LocalDateTime.now())
                        .build();
                riskAlertRepository.save(alert);

                return DuplicateSigningBlockDTO.builder()
                        .blocked(true)
                        .message("该学生已与其他企业签订三方协议，无法直接接受新的录用。")
                        .riskWarning("⚠️ 违约风险提示：重复签约将被视为违约行为，会被记录在学生诚信档案中，影响后续就业推荐和学校信用评价。")
                        .employmentOfficeRequirement("🏛️ 就业办处理要求：如需更换签约企业，必须先提交放弃原签约的书面原因，经就业办审核通过并解除原有协议后，方可接受新的录用。请在下方填写详细的放弃原因。")
                        .existingAgreement(agreement)
                        .existingEnterpriseName(existingEnterprise != null ? existingEnterprise.getName() : null)
                        .existingJobTitle(existingJob != null ? existingJob.getTitle() : null)
                        .existingStudentName(student != null ? student.getName() : null)
                        .build();
            }
        }
        return DuplicateSigningBlockDTO.builder().blocked(false).build();
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
                .status("PENDING_SCREENING")
                .majorMatched(job.getMajorRequirements() != null && job.getMajorRequirements().contains(student.getMajor()))
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

        DuplicateSigningBlockDTO blockResult = checkDuplicateSigning(app.getStudentId(), app.getJobId());
        if (blockResult.getBlocked()) {
            throw new RuntimeException("DUPLICATE_SIGNING_BLOCKED: 学生已存在有效三方协议，如需接受此录用，请先处理原有协议并提交放弃原因。");
        }

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
    public Application hireWithRenounce(Long applicationId, Long renounceApplicationId, String renounceReason) {
        if (renounceReason == null || renounceReason.trim().length() < 10) {
            throw new RuntimeException("放弃原因内容过短，请详细说明放弃录用的具体原因（至少10个字符）。");
        }

        if (renounceApplicationId != null) {
            Application renounceApp = applicationRepository.findById(renounceApplicationId)
                    .orElseThrow(() -> new RuntimeException("要放弃的申请记录不存在: " + renounceApplicationId));

            renounceApp.setRenounceReason(renounceReason);
            renounceApp.setRenouncedAt(LocalDateTime.now());
            renounceApp.setStatus("RENOUNCED");

            List<Agreement> relatedAgreements = agreementRepository.findByApplicationId(renounceApplicationId);
            for (Agreement agr : relatedAgreements) {
                if (!"BREACHED".equals(agr.getStatus()) && !"COMPLETED".equals(agr.getStatus())) {
                    agr.setStatus("BREACHED");
                    agr.setBreachReason("学生主动放弃: " + renounceReason);
                    agr.setBreachParty("STUDENT");
                    agreementRepository.save(agr);

                    Student student = studentRepository.findById(renounceApp.getStudentId()).orElse(null);
                    if (student != null) {
                        student.setHasBreachRecord(true);
                        studentRepository.save(student);
                    }

                    RiskAlert alert = RiskAlert.builder()
                            .type("STUDENT_BREACH")
                            .level("HIGH")
                            .status("ACTIVE")
                            .description("学生" + (student != null ? student.getName() : "") + "主动放弃原有协议，原因：" + renounceReason)
                            .relatedStudentId(renounceApp.getStudentId())
                            .relatedAgreementId(agr.getId())
                            .detectedAt(LocalDateTime.now())
                            .build();
                    riskAlertRepository.save(alert);
                }
            }
            applicationRepository.save(renounceApp);
        }

        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));
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
        trainingProgramService.checkMatch(applicationId);
        return savedApp;
    }

    @Transactional
    public Application renounce(Long id, String renounceReason) {
        if (renounceReason == null || renounceReason.trim().length() < 10) {
            throw new RuntimeException("放弃原因内容过短，请详细说明放弃录用的具体原因（至少10个字符）。");
        }

        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));

        app.setRenounceReason(renounceReason);
        app.setRenouncedAt(LocalDateTime.now());
        app.setStatus("RENOUNCED");

        List<Agreement> relatedAgreements = agreementRepository.findByApplicationId(id);
        for (Agreement agr : relatedAgreements) {
            if (!"BREACHED".equals(agr.getStatus()) && !"COMPLETED".equals(agr.getStatus())) {
                agr.setStatus("BREACHED");
                agr.setBreachReason("学生主动放弃: " + renounceReason);
                agr.setBreachParty("STUDENT");
                agreementRepository.save(agr);
            }
        }

        Student student = studentRepository.findById(app.getStudentId()).orElse(null);
        if (student != null) {
            student.setHasBreachRecord(true);
            studentRepository.save(student);

            RiskAlert alert = RiskAlert.builder()
                    .type("STUDENT_BREACH")
                    .level("HIGH")
                    .status("ACTIVE")
                    .description("学生" + student.getName() + "主动放弃录用，原因：" + renounceReason
                            + "。企业导师需知悉此状态变化，岗位可重新开放招录。")
                    .relatedStudentId(app.getStudentId())
                    .relatedJobId(app.getJobId())
                    .detectedAt(LocalDateTime.now())
                    .build();
            riskAlertRepository.save(alert);
        }

        return applicationRepository.save(app);
    }

    @Transactional
    public Application reject(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));
        app.setStatus("REJECTED");
        return applicationRepository.save(app);
    }

    @Transactional
    public Application pendingHire(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));
        if (!"INTERVIEWING".equals(app.getStatus())) {
            throw new RuntimeException("只有面试中的申请才能标记为待录用");
        }
        app.setStatus("PENDING_HIRE");
        return applicationRepository.save(app);
    }
}
