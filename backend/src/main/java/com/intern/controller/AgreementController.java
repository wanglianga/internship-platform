package com.intern.controller;

import com.intern.entity.Agreement;
import com.intern.service.AgreementService;
import com.intern.repository.ApplicationRepository;
import com.intern.repository.StudentRepository;
import com.intern.repository.JobRepository;
import com.intern.repository.EnterpriseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/agreements")
@RequiredArgsConstructor
public class AgreementController {

    private final AgreementService agreementService;
    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final EnterpriseRepository enterpriseRepository;

    private void enrichAgreement(Agreement agr) {
        applicationRepository.findById(agr.getApplicationId()).ifPresent(app -> {
            studentRepository.findById(app.getStudentId()).ifPresent(s -> agr.setStudentName(s.getName()));
            jobRepository.findById(app.getJobId()).ifPresent(j -> {
                agr.setJobTitle(j.getTitle());
                enterpriseRepository.findById(j.getEnterpriseId()).ifPresent(e -> agr.setEnterpriseName(e.getName()));
            });
        });
    }

    @GetMapping
    public ResponseEntity<List<Agreement>> listAgreements(@RequestParam(required = false) String status) {
        List<Agreement> agreements = agreementService.findAll();
        if (status != null) {
            agreements = agreements.stream().filter(a -> status.equals(a.getStatus())).collect(Collectors.toList());
        }
        agreements.forEach(this::enrichAgreement);
        return ResponseEntity.ok(agreements);
    }

    @PostMapping
    public ResponseEntity<Agreement> generate(@RequestBody Map<String, Long> body) {
        Long applicationId = body.get("applicationId");
        Agreement agr = agreementService.generate(applicationId);
        enrichAgreement(agr);
        return ResponseEntity.status(HttpStatus.CREATED).body(agr);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Agreement> getAgreement(@PathVariable Long id) {
        return agreementService.findById(id)
                .map(a -> { enrichAgreement(a); return ResponseEntity.ok(a); })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<Agreement> activate(@PathVariable Long id) {
        Agreement agr = agreementService.activate(id);
        enrichAgreement(agr);
        return ResponseEntity.ok(agr);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Agreement> complete(@PathVariable Long id) {
        Agreement agr = agreementService.complete(id);
        enrichAgreement(agr);
        return ResponseEntity.ok(agr);
    }

    @PutMapping("/{id}/stamp")
    public ResponseEntity<Agreement> stamp(@PathVariable Long id) {
        Agreement agr = agreementService.stamp(id);
        enrichAgreement(agr);
        return ResponseEntity.ok(agr);
    }

    @PutMapping("/{id}/change")
    public ResponseEntity<Agreement> change(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Agreement agr = agreementService.change(id, body.get("reason"));
        enrichAgreement(agr);
        return ResponseEntity.ok(agr);
    }

    @PutMapping("/{id}/breach")
    public ResponseEntity<Agreement> breach(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Agreement agr = agreementService.breach(id, body.get("reason"), body.get("party"));
        enrichAgreement(agr);
        return ResponseEntity.ok(agr);
    }
}
