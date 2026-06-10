package com.intern.controller;

import com.intern.entity.*;
import com.intern.repository.ApplicationRepository;
import com.intern.repository.EnterpriseRepository;
import com.intern.repository.JobRepository;
import com.intern.repository.StudentRepository;
import com.intern.service.TrainingProgramService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/training-programs")
@RequiredArgsConstructor
public class TrainingProgramController {

    private final TrainingProgramService trainingProgramService;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final ApplicationRepository applicationRepository;

    @GetMapping
    public ResponseEntity<List<TrainingProgram>> listPrograms(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String major) {
        List<TrainingProgram> programs = trainingProgramService.findAllPrograms();
        if (department != null && !department.isEmpty()) {
            programs = programs.stream()
                    .filter(p -> department.equals(p.getDepartment()))
                    .collect(Collectors.toList());
        }
        if (major != null && !major.isEmpty()) {
            programs = programs.stream()
                    .filter(p -> major.equals(p.getMajor()))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(programs);
    }

    @PostMapping
    public ResponseEntity<TrainingProgram> createProgram(@RequestBody TrainingProgram program) {
        TrainingProgram saved = trainingProgramService.saveProgram(program);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingProgram> getProgram(@PathVariable Long id) {
        return trainingProgramService.findProgramById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainingProgram> updateProgram(@PathVariable Long id, @RequestBody TrainingProgram program) {
        TrainingProgram updated = trainingProgramService.updateProgram(id, program);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/matches")
    public ResponseEntity<List<TrainingProgramMatch>> listMatches(
            @RequestParam(required = false) String overallStatus,
            @RequestParam(required = false) String counselorAction) {
        List<TrainingProgramMatch> matches = trainingProgramService.findAllMatches();
        if (overallStatus != null && !overallStatus.isEmpty()) {
            matches = matches.stream()
                    .filter(m -> overallStatus.equals(m.getOverallStatus()))
                    .collect(Collectors.toList());
        }
        if (counselorAction != null && !counselorAction.isEmpty()) {
            matches = matches.stream()
                    .filter(m -> counselorAction.equals(m.getCounselorAction()))
                    .collect(Collectors.toList());
        }
        matches.forEach(this::enrichMatch);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/matches/{id}")
    public ResponseEntity<TrainingProgramMatch> getMatch(@PathVariable Long id) {
        return trainingProgramService.findMatchById(id)
                .map(m -> { enrichMatch(m); return ResponseEntity.ok(m); })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/matches/check/{applicationId}")
    public ResponseEntity<TrainingProgramMatch> checkMatch(@PathVariable Long applicationId) {
        TrainingProgramMatch match = trainingProgramService.checkMatch(applicationId);
        enrichMatch(match);
        return ResponseEntity.ok(match);
    }

    @PutMapping("/matches/{matchId}/counselor-action")
    public ResponseEntity<TrainingProgramMatch> counselorAction(
            @PathVariable Long matchId,
            @RequestBody Map<String, String> body) {
        TrainingProgramMatch match = trainingProgramService.counselorAction(
                matchId,
                body.get("action"),
                body.get("comment"),
                body.get("supplementaryNote"));
        enrichMatch(match);
        return ResponseEntity.ok(match);
    }

    @GetMapping("/similar-jobs/{jobId}")
    public ResponseEntity<List<Job>> findSimilarJobs(@PathVariable Long jobId) {
        List<Job> jobs = trainingProgramService.findSimilarJobs(jobId);
        jobs.forEach(j -> enterpriseRepository.findById(j.getEnterpriseId())
                .ifPresent(e -> j.setEnterpriseName(e.getName())));
        return ResponseEntity.ok(jobs);
    }

    private void enrichMatch(TrainingProgramMatch match) {
        applicationRepository.findById(match.getApplicationId()).ifPresent(app -> {
            studentRepository.findById(app.getStudentId()).ifPresent(s -> {
                match.setStudentName(s.getName());
                match.setStudentMajor(s.getMajor());
            });
            jobRepository.findById(app.getJobId()).ifPresent(j -> match.setJobTitle(j.getTitle()));
        });
        if (match.getTrainingProgramId() != null) {
            trainingProgramService.findProgramById(match.getTrainingProgramId())
                    .ifPresent(p -> match.setTrainingProgramMajor(p.getMajor()));
        }
    }
}
