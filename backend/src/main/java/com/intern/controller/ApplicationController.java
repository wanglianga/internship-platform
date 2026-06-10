package com.intern.controller;

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

    @PutMapping("/{id}/interview")
    public ResponseEntity<Application> interview(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Application app = applicationService.interview(id,
                body.get("interviewTime"), body.get("interviewLocation"), body.get("interviewMethod"));
        enrichApplication(app);
        return ResponseEntity.ok(app);
    }

    @PutMapping("/{id}/hire")
    public ResponseEntity<Application> hire(@PathVariable Long id) {
        Application app = applicationService.hire(id);
        enrichApplication(app);
        return ResponseEntity.ok(app);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Application> reject(@PathVariable Long id) {
        Application app = applicationService.reject(id);
        enrichApplication(app);
        return ResponseEntity.ok(app);
    }
}
