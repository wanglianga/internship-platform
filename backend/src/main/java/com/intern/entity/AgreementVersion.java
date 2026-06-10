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
@Table(name = "agreement_versions")
public class AgreementVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long agreementId;
    private Integer versionNumber;
    private String location;
    private String salaryRange;
    private String mentorName;
    private String reportTime;
    private String changeDescription;
    private Long createdBy;
    private LocalDateTime createdAt;

    @Transient
    private String createdByName;
}
