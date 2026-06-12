package com.intern.controller;

import com.intern.dto.DuplicateSigningBlockDTO;
import com.intern.entity.Application;
import com.intern.service.ApplicationService;
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
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final EnterpriseRepository enterpriseRepository;

    private void enrichApplication(Application app) {
        studentRepository.findById(app.getStudentId()).ifPresent(s -> {
            app.setStudentName(s.getName());
            app.setStudentMajor(s.getMajor());
        });
        jobRepository.findById(app.getJobId()).ifPresent(j -> {
            app.setJobTitle(j.getTitle());
            app.setJobMajorRequirements(j.getMajorRequirements());
            if (app.getMajorMatched() == null && app.getStudentMajor() != null && j.getMajorRequirements() != null) {
                app.setMajorMatched(j.getMajorRequirements().contains(app.getStudentMajor()));
            }
        });
    }

    @GetMapping
    public ResponseEntity<List<Application>> listApplications(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long jobId) {
        List<Application> applications = applicationService.findAll();
        if (status != null) {
            applications = applications.stream().filter(a -> status.equals(a.getStatus())).collect(Collectors.toList());
        }
        if (studentId != null) {
            applications = applications.stream().filter(a -> studentId.equals(a.getStudentId())).collect(Collectors.toList());
        }
        if (jobId != null) {
            applications = applications.stream().filter(a -> jobId.equals(a.getJobId())).collect(Collectors.toList());
        }
        applications.forEach(this::enrichApplication);
        return ResponseEntity.ok(applications);
    }

    @PostMapping
    public ResponseEntity<Application> apply(@RequestBody Map<String, Long> body) {
        Long studentId = body.get("studentId");
        Long jobId = body.get("jobId");
        Application app = applicationService.apply(studentId, jobId);
        enrichApplication(app);
        return ResponseEntity.status(HttpStatus.CREATED).body(app);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplication(@PathVariable Long id) {
        return applicationService.findById(id)
                .map(a -> { enrichApplication(a); return ResponseEntity.ok(a); })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/check-duplicate")
    public ResponseEntity<DuplicateSigningBlockDTO> checkDuplicateSigning(
            @RequestParam Long studentId,
            @RequestParam Long jobId) {
        DuplicateSigningBlockDTO result = applicationService.checkDuplicateSigning(studentId, jobId);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/interview")
    public ResponseEntity<Application> interview(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Application app = applicationService.interview(id,
                body.get("interviewTime"), body.get("interviewLocation"), body.get("interviewMethod"));
        enrichApplication(app);
        return ResponseEntity.ok(app);
    }

    @PutMapping("/{id}/hire")
    public ResponseEntity<?> hire(@PathVariable Long id) {
        try {
            Application app = applicationService.hire(id);
            enrichApplication(app);
            return ResponseEntity.ok(app);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().startsWith("DUPLICATE_SIGNING_BLOCKED")) {
                Application app = applicationService.findById(id).orElse(null);
                if (app != null) {
                    DuplicateSigningBlockDTO block = applicationService.checkDuplicateSigning(app.getStudentId(), app.getJobId());
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(block);
                }
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/hire-with-renounce")
    public ResponseEntity<?> hireWithRenounce(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Long renounceApplicationId = body.get("renounceApplicationId") != null
                    ? Long.valueOf(body.get("renounceApplicationId").toString())
                    : null;
            String renounceReason = (String) body.get("renounceReason");
            Application app = applicationService.hireWithRenounce(id, renounceApplicationId, renounceReason);
            enrichApplication(app);
            return ResponseEntity.ok(app);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/renounce")
    public ResponseEntity<?> renounce(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String renounceReason = body.get("renounceReason");
            Application app = applicationService.renounce(id, renounceReason);
            enrichApplication(app);
            return ResponseEntity.ok(app);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Application> reject(@PathVariable Long id) {
        Application app = applicationService.reject(id);
        enrichApplication(app);
        return ResponseEntity.ok(app);
    }

    @PutMapping("/{id}/pending-hire")
    public ResponseEntity<?> pendingHire(@PathVariable Long id) {
        try {
            Application app = applicationService.pendingHire(id);
            enrichApplication(app);
            return ResponseEntity.ok(app);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
