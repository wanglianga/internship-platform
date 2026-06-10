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
@Table(name = "training_programs")
public class TrainingProgram {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String major;
    private String requiredJobResponsibilities;
    private Integer requiredCredits;
    private Integer requiredInternshipMonths;
    private String department;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
