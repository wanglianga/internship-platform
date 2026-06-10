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
@Table(name = "job_withdrawals")
public class JobWithdrawal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long jobId;
    private Long enterpriseId;
    private String reason;
    private String status;
    private LocalDateTime withdrawnAt;
    private String remark;

    @Transient
    private String jobTitle;
    @Transient
    private String enterpriseName;
}
