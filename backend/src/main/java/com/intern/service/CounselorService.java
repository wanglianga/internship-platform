package com.intern.service;

import com.intern.entity.Counselor;
import com.intern.repository.CounselorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CounselorService {

    private final CounselorRepository counselorRepository;

    public List<Counselor> findAll() {
        return counselorRepository.findAll();
    }

    public Optional<Counselor> findById(Long id) {
        return counselorRepository.findById(id);
    }
}
