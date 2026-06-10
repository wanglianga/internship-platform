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
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long studentId;
    private Long jobId;
    private String status;
    private String interviewTime;
    private String interviewLocation;
    private String interviewMethod;
    private LocalDateTime appliedAt;
    private LocalDateTime interviewedAt;
    private LocalDateTime hiredAt;
    private Integer internshipMonths;
    private Integer earnedCredits;
    private String jobResponsibilitiesSnapshot;
    private Long originalJobId;
    private String withdrawalReason;
    private String renounceReason;
    private LocalDateTime renouncedAt;
    private String reportTime;

    @Transient
    private String studentName;
    @Transient
    private String jobTitle;
    @Transient
    private String studentMajor;
    @Transient
    private String jobMajorRequirements;
}
