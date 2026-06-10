package com.intern.controller;

import com.intern.entity.Job;
import com.intern.service.JobService;
import com.intern.repository.EnterpriseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final EnterpriseRepository enterpriseRepository;

    @GetMapping
    public ResponseEntity<List<Job>> listJobs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String majorKeyword,
            @RequestParam(required = false) String keyword) {
        List<Job> jobs = jobService.findAll();
        if (status != null) {
            jobs = jobs.stream().filter(j -> status.equals(j.getStatus())).collect(Collectors.toList());
        }
        if (location != null) {
            jobs = jobs.stream().filter(j -> location.equals(j.getLocation())).collect(Collectors.toList());
        }
        if (majorKeyword != null && !majorKeyword.isEmpty()) {
            jobs = jobs.stream().filter(j -> j.getMajorRequirements() != null && j.getMajorRequirements().contains(majorKeyword)).collect(Collectors.toList());
        }
        jobs.forEach(j -> enterpriseRepository.findById(j.getEnterpriseId())
                .ifPresent(e -> j.setEnterpriseName(e.getName())));
        if (keyword != null && !keyword.isEmpty()) {
            jobs = jobs.stream().filter(j ->
                    (j.getTitle() != null && j.getTitle().contains(keyword)) ||
                    (j.getEnterpriseName() != null && j.getEnterpriseName().contains(keyword))
            ).collect(Collectors.toList());
        }
        return ResponseEntity.ok(jobs);
    }

    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody Job job) {
        Job saved = jobService.save(job);
        enterpriseRepository.findById(saved.getEnterpriseId())
                .ifPresent(e -> saved.setEnterpriseName(e.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJob(@PathVariable Long id) {
        return jobService.findById(id)
                .map(j -> {
                    enterpriseRepository.findById(j.getEnterpriseId())
                            .ifPresent(e -> j.setEnterpriseName(e.getName()));
                    return ResponseEntity.ok(j);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody Job job) {
        Job updated = jobService.update(id, job);
        enterpriseRepository.findById(updated.getEnterpriseId())
                .ifPresent(e -> updated.setEnterpriseName(e.getName()));
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/withdraw")
    public ResponseEntity<Job> withdrawJob(@PathVariable Long id) {
        Job withdrawn = jobService.withdraw(id);
        enterpriseRepository.findById(withdrawn.getEnterpriseId())
                .ifPresent(e -> withdrawn.setEnterpriseName(e.getName()));
        return ResponseEntity.ok(withdrawn);
    }
}
