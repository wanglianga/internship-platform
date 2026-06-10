package com.intern.service;

import com.intern.entity.Agreement;
import com.intern.entity.Application;
import com.intern.entity.RiskAlert;
import com.intern.entity.Student;
import com.intern.repository.AgreementRepository;
import com.intern.repository.ApplicationRepository;
import com.intern.repository.RiskAlertRepository;
import com.intern.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AgreementService {

    private final AgreementRepository agreementRepository;
    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final RiskAlertRepository riskAlertRepository;

    public List<Agreement> findAll() {
        return agreementRepository.findAll();
    }

    public Optional<Agreement> findById(Long id) {
        return agreementRepository.findById(id);
    }

    public List<Agreement> findByStatus(String status) {
        return agreementRepository.findByStatus(status);
    }

    @Transactional
    public Agreement generate(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));
        app.setStatus("AGREEMENT_PENDING");
        applicationRepository.save(app);

        Agreement agreement = Agreement.builder()
                .applicationId(applicationId)
                .status("PENDING")
                .generatedAt(LocalDateTime.now())
                .build();
        return agreementRepository.save(agreement);
    }

    @Transactional
    public Agreement stamp(Long id) {
        Agreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agreement not found: " + id));
        agreement.setStatus("STAMPED");
        agreement.setStampedAt(LocalDateTime.now());
        return agreementRepository.save(agreement);
    }

    @Transactional
    public Agreement change(Long id, String reason) {
        Agreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agreement not found: " + id));
        agreement.setStatus("CHANGING");
        agreement.setChangeReason(reason);
        return agreementRepository.save(agreement);
    }

    @Transactional
    public Agreement activate(Long id) {
        Agreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agreement not found: " + id));
        agreement.setStatus("ACTIVE");
        agreementRepository.save(agreement);
        applicationRepository.findById(agreement.getApplicationId()).ifPresent(app -> {
            app.setStatus("ACTIVE");
            applicationRepository.save(app);
        });
        return agreement;
    }

    @Transactional
    public Agreement complete(Long id) {
        Agreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agreement not found: " + id));
        agreement.setStatus("COMPLETED");
        agreementRepository.save(agreement);
        applicationRepository.findById(agreement.getApplicationId()).ifPresent(app -> {
            app.setStatus("COMPLETED");
            applicationRepository.save(app);
        });
        return agreement;
    }

    @Transactional
    public Agreement breach(Long id, String reason, String party) {
        Agreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agreement not found: " + id));
        agreement.setStatus("BREACHED");
        agreement.setBreachReason(reason);
        agreement.setBreachParty(party);
        agreementRepository.save(agreement);

        Application app = applicationRepository.findById(agreement.getApplicationId()).orElse(null);
        if (app != null && "STUDENT".equals(party)) {
            Student student = studentRepository.findById(app.getStudentId()).orElse(null);
            if (student != null) {
                student.setHasBreachRecord(true);
                studentRepository.save(student);

                RiskAlert alert = RiskAlert.builder()
                        .type("STUDENT_BREACH")
                        .level("HIGH")
                        .status("ACTIVE")
                        .description("学生" + student.getName() + "违反三方协议：" + reason)
                        .relatedStudentId(student.getId())
                        .relatedAgreementId(id)
                        .detectedAt(LocalDateTime.now())
                        .build();
                riskAlertRepository.save(alert);
            }
        }

        return agreement;
    }
}
