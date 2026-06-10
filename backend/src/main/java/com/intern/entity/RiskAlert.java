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
@Table(name = "risk_alerts")
public class RiskAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String type;
    private String level;
    private String status;
    private String description;
    private Long relatedStudentId;
    private Long relatedJobId;
    private Long relatedAgreementId;
    private String resolution;
    private LocalDateTime detectedAt;
    private LocalDateTime resolvedAt;
}
