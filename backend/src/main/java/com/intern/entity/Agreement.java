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
@Table(name = "agreements")
public class Agreement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long applicationId;
    private String status;
    private LocalDateTime generatedAt;
    private LocalDateTime stampedAt;
    private String changeReason;
    private String breachReason;
    private String breachParty;

    @Transient
    private String studentName;
    @Transient
    private String jobTitle;
    @Transient
    private String enterpriseName;
}
