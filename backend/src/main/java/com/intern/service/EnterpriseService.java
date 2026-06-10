package com.intern.service;

import com.intern.entity.Enterprise;
import com.intern.repository.EnterpriseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EnterpriseService {

    private final EnterpriseRepository enterpriseRepository;

    public List<Enterprise> findAll() {
        return enterpriseRepository.findAll();
    }

    public Optional<Enterprise> findById(Long id) {
        return enterpriseRepository.findById(id);
    }

    @Transactional
    public Enterprise save(Enterprise enterprise) {
        return enterpriseRepository.save(enterprise);
    }
}
