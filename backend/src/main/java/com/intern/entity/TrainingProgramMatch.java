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
@Table(name = "training_program_matches")
public class TrainingProgramMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long applicationId;
    private Long trainingProgramId;
    private Boolean majorMatched;
    private Boolean responsibilitiesMatched;
    private Boolean creditsMatched;
    private Boolean durationMatched;
    private String overallStatus;
    private String counselorAction;
    private String counselorComment;
    private String supplementaryNote;
    private LocalDateTime matchedAt;
    private LocalDateTime reviewedAt;

    @Transient
    private String studentName;
    @Transient
    private String jobTitle;
    @Transient
    private String studentMajor;
    @Transient
    private String trainingProgramMajor;
}
