package com.intern.service;

import com.intern.dto.ConfirmChangeRequestDTO;
import com.intern.dto.CreateChangeRequestDTO;
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
public class AgreementChangeService {

    private final AgreementRepository agreementRepository;
    private final AgreementVersionRepository agreementVersionRepository;
    private final AgreementChangeRequestRepository changeRequestRepository;
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final StudentRepository studentRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final CounselorRepository counselorRepository;
    private final RiskAlertRepository riskAlertRepository;

    public List<AgreementChangeRequest> findAllChangeRequests() {
        return changeRequestRepository.findAll();
    }

    public Optional<AgreementChangeRequest> findChangeRequestById(Long id) {
        return changeRequestRepository.findById(id);
    }

    public List<AgreementChangeRequest> findChangeRequestsByAgreementId(Long agreementId) {
        return changeRequestRepository.findByAgreementIdOrderByInitiatedAtDesc(agreementId);
    }

    public List<AgreementChangeRequest> findChangeRequestsByStatus(String status) {
        return changeRequestRepository.findByStatus(status);
    }

    public List<AgreementVersion> findVersionsByAgreementId(Long agreementId) {
        return agreementVersionRepository.findByAgreementIdOrderByVersionNumberDesc(agreementId);
    }

    private void snapshotInitialVersion(Agreement agreement) {
        Application app = applicationRepository.findById(agreement.getApplicationId()).orElse(null);
        Job job = app != null ? jobRepository.findById(app.getJobId()).orElse(null) : null;

        String location = agreement.getLocation() != null ? agreement.getLocation() : (job != null ? job.getLocation() : null);
        String salaryRange = agreement.getSalaryRange() != null ? agreement.getSalaryRange() : (job != null ? job.getSalaryRange() : null);
        String mentorName = agreement.getMentorName() != null ? agreement.getMentorName() : (job != null ? job.getMentorName() : null);
        String reportTime = agreement.getReportTime() != null ? agreement.getReportTime() : (app != null ? app.getReportTime() : null);

        if (agreement.getCurrentVersion() == null) {
            agreement.setLocation(location);
            agreement.setSalaryRange(salaryRange);
            agreement.setMentorName(mentorName);
            agreement.setReportTime(reportTime);
            agreement.setCurrentVersion(1);
            agreementRepository.save(agreement);

            AgreementVersion v1 = AgreementVersion.builder()
                    .agreementId(agreement.getId())
                    .versionNumber(1)
                    .location(location)
                    .salaryRange(salaryRange)
                    .mentorName(mentorName)
                    .reportTime(reportTime)
                    .changeDescription("初始协议版本")
                    .createdAt(LocalDateTime.now())
                    .build();
            agreementVersionRepository.save(v1);
        }
    }

    @Transactional
    public AgreementChangeRequest createChangeRequest(CreateChangeRequestDTO dto) {
        Agreement agreement = agreementRepository.findById(dto.getAgreementId())
                .orElseThrow(() -> new RuntimeException("Agreement not found: " + dto.getAgreementId()));

        if (!"ACTIVE".equals(agreement.getStatus()) && !"STAMPED".equals(agreement.getStatus())) {
            throw new RuntimeException("只有已盖章或已生效的协议才能发起变更。当前协议状态：" + agreement.getStatus());
        }

        snapshotInitialVersion(agreement);

        List<String> pendingStatuses = Arrays.asList("PENDING", "ENTERPRISE_CONFIRMED", "STUDENT_CONFIRMED", "COUNSELOR_CONFIRMED");
        Optional<AgreementChangeRequest> existingPending = changeRequestRepository
                .findTopByAgreementIdAndStatusIn(agreement.getId(), pendingStatuses);
        if (existingPending.isPresent()) {
            throw new RuntimeException("该协议已有正在进行中的变更请求，请先完成或取消现有变更。");
        }

        boolean hasChange = false;
        StringBuilder changeDesc = new StringBuilder();
        if (dto.getNewLocation() != null && !dto.getNewLocation().equals(agreement.getLocation())) {
            changeDesc.append("实习地点: \"").append(agreement.getLocation()).append("\" → \"").append(dto.getNewLocation()).append("\"; ");
            hasChange = true;
        }
        if (dto.getNewSalaryRange() != null && !dto.getNewSalaryRange().equals(agreement.getSalaryRange())) {
            changeDesc.append("薪资: \"").append(agreement.getSalaryRange()).append("\" → \"").append(dto.getNewSalaryRange()).append("\"; ");
            hasChange = true;
        }
        if (dto.getNewMentorName() != null && !dto.getNewMentorName().equals(agreement.getMentorName())) {
            changeDesc.append("导师: \"").append(agreement.getMentorName()).append("\" → \"").append(dto.getNewMentorName()).append("\"; ");
            hasChange = true;
        }
        if (dto.getNewReportTime() != null && !dto.getNewReportTime().equals(agreement.getReportTime())) {
            changeDesc.append("报到时间: \"").append(agreement.getReportTime()).append("\" → \"").append(dto.getNewReportTime()).append("\"; ");
            hasChange = true;
        }

        if (!hasChange) {
            throw new RuntimeException("未检测到任何字段变更，请至少修改实习地点、薪资、导师或报到时间中的一项。");
        }

        AgreementChangeRequest request = AgreementChangeRequest.builder()
                .agreementId(agreement.getId())
                .status("PENDING")
                .originalLocation(agreement.getLocation())
                .newLocation(dto.getNewLocation() != null ? dto.getNewLocation() : agreement.getLocation())
                .originalSalaryRange(agreement.getSalaryRange())
                .newSalaryRange(dto.getNewSalaryRange() != null ? dto.getNewSalaryRange() : agreement.getSalaryRange())
                .originalMentorName(agreement.getMentorName())
                .newMentorName(dto.getNewMentorName() != null ? dto.getNewMentorName() : agreement.getMentorName())
                .originalReportTime(agreement.getReportTime())
                .newReportTime(dto.getNewReportTime() != null ? dto.getNewReportTime() : agreement.getReportTime())
                .changeReason(dto.getChangeReason())
                .initiatedBy(dto.getInitiatedBy())
                .initiatedAt(LocalDateTime.now())
                .enterpriseConfirmed(false)
                .studentConfirmed(false)
                .counselorConfirmed(false)
                .employmentOfficeConfirmed(false)
                .build();

        agreement.setStatus("CHANGING");
        agreement.setChangeReason(dto.getChangeReason());
        agreementRepository.save(agreement);

        Application app = applicationRepository.findById(agreement.getApplicationId()).orElse(null);
        if (app != null) {
            Student student = studentRepository.findById(app.getStudentId()).orElse(null);
            RiskAlert alert = RiskAlert.builder()
                    .type("JOB_WITHDRAWN")
                    .level("MEDIUM")
                    .status("ACTIVE")
                    .description("协议变更申请已发起：" + changeDesc
                            + "。变更原因：" + dto.getChangeReason()
                            + "。需要企业、学生、辅导员和就业办四方确认。")
                    .relatedStudentId(app.getStudentId())
                    .relatedAgreementId(agreement.getId())
                    .detectedAt(LocalDateTime.now())
                    .build();
            riskAlertRepository.save(alert);
        }

        return changeRequestRepository.save(request);
    }

    @Transactional
    public AgreementChangeRequest confirmChangeRequest(ConfirmChangeRequestDTO dto) {
        AgreementChangeRequest request = changeRequestRepository.findById(dto.getChangeRequestId())
                .orElseThrow(() -> new RuntimeException("变更请求不存在: " + dto.getChangeRequestId()));

        if (!"PENDING".equals(request.getStatus())
                && !"ENTERPRISE_CONFIRMED".equals(request.getStatus())
                && !"STUDENT_CONFIRMED".equals(request.getStatus())
                && !"COUNSELOR_CONFIRMED".equals(request.getStatus())) {
            throw new RuntimeException("当前变更请求状态不允许确认: " + request.getStatus());
        }

        String role = dto.getRole();
        switch (role) {
            case "ENTERPRISE" -> {
                request.setEnterpriseConfirmed(true);
                request.setEnterpriseConfirmedAt(LocalDateTime.now());
                request.setEnterpriseComment(dto.getComment());
            }
            case "STUDENT" -> {
                request.setStudentConfirmed(true);
                request.setStudentConfirmedAt(LocalDateTime.now());
                request.setStudentComment(dto.getComment());
            }
            case "COUNSELOR" -> {
                if (dto.getCounselorId() == null) {
                    throw new RuntimeException("辅导员确认必须提供辅导员ID");
                }
                request.setCounselorConfirmed(true);
                request.setCounselorId(dto.getCounselorId());
                request.setCounselorConfirmedAt(LocalDateTime.now());
                request.setCounselorComment(dto.getComment());
            }
            case "EMPLOYMENT_OFFICE" -> {
                request.setEmploymentOfficeConfirmed(true);
                request.setEmploymentOfficeConfirmedAt(LocalDateTime.now());
                request.setEmploymentOfficeComment(dto.getComment());
            }
            default -> throw new RuntimeException("无效的确认角色: " + role + "。必须是 ENTERPRISE, STUDENT, COUNSELOR, EMPLOYMENT_OFFICE 之一");
        }

        if (Boolean.TRUE.equals(request.getEnterpriseConfirmed())
                && Boolean.TRUE.equals(request.getStudentConfirmed())
                && Boolean.TRUE.equals(request.getCounselorConfirmed())
                && Boolean.TRUE.equals(request.getEmploymentOfficeConfirmed())) {
            request.setStatus("COMPLETED");
            request.setCompletedAt(LocalDateTime.now());

            Agreement agreement = agreementRepository.findById(request.getAgreementId()).orElse(null);
            if (agreement != null) {
                int newVersion = (agreement.getCurrentVersion() != null ? agreement.getCurrentVersion() : 1) + 1;

                AgreementVersion newVersionRecord = AgreementVersion.builder()
                        .agreementId(agreement.getId())
                        .versionNumber(newVersion)
                        .location(request.getNewLocation())
                        .salaryRange(request.getNewSalaryRange())
                        .mentorName(request.getNewMentorName())
                        .reportTime(request.getNewReportTime())
                        .changeDescription(request.getChangeReason())
                        .createdBy(request.getInitiatedBy())
                        .createdAt(LocalDateTime.now())
                        .build();
                agreementVersionRepository.save(newVersionRecord);

                agreement.setLocation(request.getNewLocation());
                agreement.setSalaryRange(request.getNewSalaryRange());
                agreement.setMentorName(request.getNewMentorName());
                agreement.setReportTime(request.getNewReportTime());
                agreement.setCurrentVersion(newVersion);
                agreement.setStatus("ACTIVE");
                agreementRepository.save(agreement);

                Application app = applicationRepository.findById(agreement.getApplicationId()).orElse(null);
                if (app != null) {
                    app.setReportTime(request.getNewReportTime());
                    applicationRepository.save(app);
                }

                Job job = app != null ? jobRepository.findById(app.getJobId()).orElse(null) : null;
                if (job != null) {
                    job.setLocation(request.getNewLocation());
                    job.setSalaryRange(request.getNewSalaryRange());
                    job.setMentorName(request.getNewMentorName());
                    jobRepository.save(job);
                }
            }
        } else {
            int count = 0;
            if (Boolean.TRUE.equals(request.getEnterpriseConfirmed())) count++;
            if (Boolean.TRUE.equals(request.getStudentConfirmed())) count++;
            if (Boolean.TRUE.equals(request.getCounselorConfirmed())) count++;
            if (Boolean.TRUE.equals(request.getEmploymentOfficeConfirmed())) count++;

            if (count == 1) request.setStatus("ENTERPRISE_CONFIRMED");
            else if (count == 2) request.setStatus("STUDENT_CONFIRMED");
            else if (count == 3) request.setStatus("COUNSELOR_CONFIRMED");
        }

        return changeRequestRepository.save(request);
    }

    @Transactional
    public AgreementChangeRequest rejectChangeRequest(Long changeRequestId, String role, String rejectionReason) {
        AgreementChangeRequest request = changeRequestRepository.findById(changeRequestId)
                .orElseThrow(() -> new RuntimeException("变更请求不存在: " + changeRequestId));

        if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
            throw new RuntimeException("驳回请求必须提供驳回原因");
        }

        request.setStatus("REJECTED");
        request.setRejectionReason(rejectionReason);
        request.setCompletedAt(LocalDateTime.now());

        switch (role) {
            case "ENTERPRISE" -> request.setEnterpriseComment("驳回: " + rejectionReason);
            case "STUDENT" -> request.setStudentComment("驳回: " + rejectionReason);
            case "COUNSELOR" -> request.setCounselorComment("驳回: " + rejectionReason);
            case "EMPLOYMENT_OFFICE" -> request.setEmploymentOfficeComment("驳回: " + rejectionReason);
        }

        Agreement agreement = agreementRepository.findById(request.getAgreementId()).orElse(null);
        if (agreement != null) {
            if ("STAMPED".equals(agreement.getStatus()) || "CHANGING".equals(agreement.getStatus())) {
                agreement.setStatus("STAMPED");
            } else {
                agreement.setStatus("ACTIVE");
            }
            agreementRepository.save(agreement);
        }

        return changeRequestRepository.save(request);
    }

    public void enrichChangeRequest(AgreementChangeRequest req) {
        Agreement agreement = agreementRepository.findById(req.getAgreementId()).orElse(null);
        if (agreement != null) {
            Application app = applicationRepository.findById(agreement.getApplicationId()).orElse(null);
            if (app != null) {
                Student s = studentRepository.findById(app.getStudentId()).orElse(null);
                if (s != null) req.setStudentName(s.getName());
                Job j = jobRepository.findById(app.getJobId()).orElse(null);
                if (j != null) {
                    req.setJobTitle(j.getTitle());
                    Enterprise e = enterpriseRepository.findById(j.getEnterpriseId()).orElse(null);
                    if (e != null) req.setEnterpriseName(e.getName());
                }
            }
        }
        if (req.getInitiatedBy() != null) {
            Student s = studentRepository.findById(req.getInitiatedBy()).orElse(null);
            if (s != null) {
                req.setInitiatedByName(s.getName());
            } else {
                Counselor c = counselorRepository.findById(req.getInitiatedBy()).orElse(null);
                if (c != null) req.setInitiatedByName(c.getName());
            }
        }
    }
}
