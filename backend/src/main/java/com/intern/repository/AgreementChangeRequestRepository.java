package com.intern.repository;

import com.intern.entity.AgreementChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AgreementChangeRequestRepository extends JpaRepository<AgreementChangeRequest, Long> {
    List<AgreementChangeRequest> findByAgreementIdOrderByInitiatedAtDesc(Long agreementId);
    List<AgreementChangeRequest> findByStatus(String status);
    Optional<AgreementChangeRequest> findTopByAgreementIdAndStatusIn(Long agreementId, List<String> statuses);
}
