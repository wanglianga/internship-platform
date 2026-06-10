package com.intern.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "agreement_change_requests")
public class AgreementChangeRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long agreementId;
    private String status;

    private String originalLocation;
    private String newLocation;
    private String originalSalaryRange;
    private String newSalaryRange;
    private String originalMentorName;
    private String newMentorName;
    private String originalReportTime;
    private String newReportTime;

    private String changeReason;
    private Long initiatedBy;
    private LocalDateTime initiatedAt;

    private Boolean enterpriseConfirmed;
    private LocalDateTime enterpriseConfirmedAt;
    private String enterpriseComment;

    private Boolean studentConfirmed;
    private LocalDateTime studentConfirmedAt;
    private String studentComment;

    private Boolean counselorConfirmed;
    private Long counselorId;
    private LocalDateTime counselorConfirmedAt;
    private String counselorComment;

    private Boolean employmentOfficeConfirmed;
    private LocalDateTime employmentOfficeConfirmedAt;
    private String employmentOfficeComment;

    private LocalDateTime completedAt;
    private String rejectionReason;

    @Transient
    private String studentName;
    @Transient
    private String jobTitle;
    @Transient
    private String enterpriseName;
    @Transient
    private String initiatedByName;
}
