package com.intern.repository;

import com.intern.entity.JobWithdrawal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobWithdrawalRepository extends JpaRepository<JobWithdrawal, Long> {
    Optional<JobWithdrawal> findByJobId(Long jobId);
    List<JobWithdrawal> findByEnterpriseId(Long enterpriseId);
    List<JobWithdrawal> findByStatus(String status);
}
