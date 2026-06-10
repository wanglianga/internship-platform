package com.intern.controller;

import com.intern.entity.Counselor;
import com.intern.service.CounselorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/counselors")
@RequiredArgsConstructor
public class CounselorController {

    private final CounselorService counselorService;

    @GetMapping
    public ResponseEntity<List<Counselor>> listCounselors() {
        return ResponseEntity.ok(counselorService.findAll());
    }
}
