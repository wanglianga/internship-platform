package com.intern.repository;

import com.intern.entity.AgreementVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AgreementVersionRepository extends JpaRepository<AgreementVersion, Long> {
    List<AgreementVersion> findByAgreementIdOrderByVersionNumberDesc(Long agreementId);
    Optional<AgreementVersion> findTopByAgreementIdOrderByVersionNumberDesc(Long agreementId);
}
