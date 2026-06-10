package com.intern.repository;

import com.intern.entity.Agreement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AgreementRepository extends JpaRepository<Agreement, Long> {
    List<Agreement> findByStatus(String status);
    List<Agreement> findByApplicationId(Long applicationId);
}
