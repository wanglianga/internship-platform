package com.intern.controller;

import com.intern.entity.Enterprise;
import com.intern.service.EnterpriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/enterprises")
@RequiredArgsConstructor
public class EnterpriseController {

    private final EnterpriseService enterpriseService;

    @GetMapping
    public ResponseEntity<List<Enterprise>> listEnterprises() {
        return ResponseEntity.ok(enterpriseService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enterprise> getEnterprise(@PathVariable Long id) {
        return enterpriseService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
