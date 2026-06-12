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
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long enterpriseId;
    private String title;
    private String description;
    private String location;
    private String salaryRange;
    private String majorRequirements;
    private Integer headcount;
    private String status;
    private String mentorName;
    private LocalDateTime createdAt;
    private String responsibilities;
    private Integer requiredCredits;
    private Integer internshipMonths;
    private String withdrawalReason;

    @Transient
    private String enterpriseName;

    @Transient
    private Boolean majorMatched;

    @Transient
    private Boolean cityMatched;

    @Transient
    private Integer matchScore;
}
