package com.intern.service;

import com.intern.entity.*;
import com.intern.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TrainingProgramService {

    private final TrainingProgramRepository trainingProgramRepository;
    private final TrainingProgramMatchRepository trainingProgramMatchRepository;
    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final ReviewRepository reviewRepository;
    private final CounselorRepository counselorRepository;

    public List<TrainingProgram> findAllPrograms() {
        return trainingProgramRepository.findAll();
    }

    public Optional<TrainingProgram> findProgramById(Long id) {
        return trainingProgramRepository.findById(id);
    }

    public Optional<TrainingProgram> findProgramByMajor(String major) {
        return trainingProgramRepository.findByMajor(major);
    }

    @Transactional
    public TrainingProgram saveProgram(TrainingProgram program) {
        if (program.getCreatedAt() == null) {
            program.setCreatedAt(LocalDateTime.now());
        }
        program.setUpdatedAt(LocalDateTime.now());
        return trainingProgramRepository.save(program);
    }

    @Transactional
    public TrainingProgram updateProgram(Long id, TrainingProgram program) {
        TrainingProgram existing = trainingProgramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training program not found: " + id));
        program.setId(id);
        program.setCreatedAt(existing.getCreatedAt());
        program.setUpdatedAt(LocalDateTime.now());
        return trainingProgramRepository.save(program);
    }

    public List<TrainingProgramMatch> findAllMatches() {
        return trainingProgramMatchRepository.findAll();
    }

    public Optional<TrainingProgramMatch> findMatchById(Long id) {
        return trainingProgramMatchRepository.findById(id);
    }

    public Optional<TrainingProgramMatch> findMatchByApplicationId(Long applicationId) {
        return trainingProgramMatchRepository.findByApplicationId(applicationId);
    }

    @Transactional
    public TrainingProgramMatch checkMatch(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));

        if (!"HIRED".equals(application.getStatus()) && !"DEPARTMENT_REVIEW".equals(application.getStatus())) {
            throw new RuntimeException("Application must be HIRED or DEPARTMENT_REVIEW status to check training program match");
        }

        Student student = studentRepository.findById(application.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + application.getStudentId()));
        Job job = jobRepository.findById(application.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found: " + application.getJobId()));

        Optional<TrainingProgramMatch> existingMatch = trainingProgramMatchRepository.findByApplicationId(applicationId);
        TrainingProgramMatch match;
        if (existingMatch.isPresent()) {
            match = existingMatch.get();
        } else {
            match = new TrainingProgramMatch();
            match.setApplicationId(applicationId);
        }

        TrainingProgram program = trainingProgramRepository.findByMajor(student.getMajor()).orElse(null);
        if (program != null) {
            match.setTrainingProgramId(program.getId());
        }

        boolean majorMatched = checkMajorMatch(student.getMajor(), job.getMajorRequirements());
        boolean responsibilitiesMatched = checkResponsibilitiesMatch(job.getDescription(),
                program != null ? program.getRequiredJobResponsibilities() : null);
        boolean creditsMatched = checkCreditsMatch(student.getCourses(),
                program != null ? program.getRequiredCredits() : null);
        boolean durationMatched = true;

        match.setMajorMatched(majorMatched);
        match.setResponsibilitiesMatched(responsibilitiesMatched);
        match.setCreditsMatched(creditsMatched);
        match.setDurationMatched(durationMatched);

        boolean overallMatched = majorMatched && responsibilitiesMatched && creditsMatched && durationMatched;
        match.setOverallStatus(overallMatched ? "MATCHED" : "UNMATCHED");
        match.setMatchedAt(LocalDateTime.now());

        if (match.getCounselorAction() == null) {
            match.setCounselorAction(overallMatched ? "NONE" : "PENDING");
        }

        TrainingProgramMatch savedMatch = trainingProgramMatchRepository.save(match);

        if (overallMatched) {
            application.setStatus("DEPARTMENT_REVIEW");
            applicationRepository.save(application);

            List<Counselor> counselors = counselorRepository.findAll();
            if (!counselors.isEmpty()) {
                Review review = Review.builder()
                        .applicationId(applicationId)
                        .counselorId(counselors.get(0).getId())
                        .type("TRAINING_PROGRAM")
                        .status("PENDING")
                        .comment("培养方案匹配通过，等待院系审核")
                        .build();
                reviewRepository.save(review);
            }
        }

        return savedMatch;
    }

    private boolean checkMajorMatch(String studentMajor, String jobMajorRequirements) {
        if (jobMajorRequirements == null || jobMajorRequirements.isEmpty()) {
            return true;
        }
        return jobMajorRequirements.contains(studentMajor);
    }

    private boolean checkResponsibilitiesMatch(String jobDescription, String requiredResponsibilities) {
        if (requiredResponsibilities == null || requiredResponsibilities.isEmpty()) {
            return true;
        }
        if (jobDescription == null || jobDescription.isEmpty()) {
            return false;
        }
        String[] keywords = requiredResponsibilities.split(",");
        for (String keyword : keywords) {
            if (!jobDescription.contains(keyword.trim())) {
                return false;
            }
        }
        return true;
    }

    private boolean checkCreditsMatch(String studentCourses, Integer requiredCredits) {
        if (requiredCredits == null || requiredCredits == 0) {
            return true;
        }
        if (studentCourses == null || studentCourses.isEmpty()) {
            return false;
        }
        int courseCount = studentCourses.split(",").length;
        return courseCount * 2 >= requiredCredits;
    }

    @Transactional
    public TrainingProgramMatch counselorAction(Long matchId, String action, String comment, String supplementaryNote) {
        TrainingProgramMatch match = trainingProgramMatchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Training program match not found: " + matchId));

        match.setCounselorAction(action);
        match.setCounselorComment(comment);
        if (supplementaryNote != null && !supplementaryNote.isEmpty()) {
            match.setSupplementaryNote(supplementaryNote);
        }
        match.setReviewedAt(LocalDateTime.now());

        Application application = applicationRepository.findById(match.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found: " + match.getApplicationId()));

        if ("REQUEST_TRANSFER".equals(action)) {
            application.setStatus("TRANSFER_PENDING");
        } else if ("APPROVE_WITH_NOTE".equals(action) || "MATCHED".equals(match.getOverallStatus())) {
            application.setStatus("DEPARTMENT_REVIEW");

            List<Counselor> counselors = counselorRepository.findAll();
            if (!counselors.isEmpty()) {
                Review review = Review.builder()
                        .applicationId(match.getApplicationId())
                        .counselorId(counselors.get(0).getId())
                        .type("TRAINING_PROGRAM")
                        .status("PENDING")
                        .comment(comment != null ? comment : "培养方案审核中")
                        .build();
                reviewRepository.save(review);
            }
        }

        applicationRepository.save(application);
        return trainingProgramMatchRepository.save(match);
    }

    public List<Job> findSimilarJobs(Long jobId) {
        Job originalJob = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
        List<Job> allJobs = jobRepository.findByStatus("OPEN");
        List<Job> similarJobs = new ArrayList<>();

        for (Job job : allJobs) {
            if (job.getId().equals(jobId)) continue;
            int score = 0;
            if (job.getLocation() != null && job.getLocation().equals(originalJob.getLocation())) {
                score += 2;
            }
            if (job.getMajorRequirements() != null && originalJob.getMajorRequirements() != null) {
                String[] originalMajors = originalJob.getMajorRequirements().split(",");
                for (String major : originalMajors) {
                    if (job.getMajorRequirements().contains(major.trim())) {
                        score += 3;
                        break;
                    }
                }
            }
            if (score >= 3) {
                similarJobs.add(job);
            }
        }
        return similarJobs;
    }
}
