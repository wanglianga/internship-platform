package com.intern.controller;

import com.intern.entity.Application;
import com.intern.entity.Review;
import com.intern.repository.ApplicationRepository;
import com.intern.repository.CounselorRepository;
import com.intern.repository.JobRepository;
import com.intern.repository.StudentRepository;
import com.intern.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final CounselorRepository counselorRepository;
    private final StudentRepository studentRepository;
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    @GetMapping
    public ResponseEntity<List<Review>> listReviews(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long counselorId,
            @RequestParam(required = false) String type) {
        List<Review> reviews = reviewService.findAll();
        if (status != null) {
            reviews = reviews.stream().filter(r -> status.equals(r.getStatus())).collect(Collectors.toList());
        }
        if (counselorId != null) {
            reviews = reviews.stream().filter(r -> counselorId.equals(r.getCounselorId())).collect(Collectors.toList());
        }
        if (type != null) {
            reviews = reviews.stream().filter(r -> type.equals(r.getType())).collect(Collectors.toList());
        }
        reviews.forEach(this::enrichReview);
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Review> approve(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Review review = reviewService.approve(id, body.get("comment"));
        enrichReview(review);
        return ResponseEntity.ok(review);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Review> reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Review review = reviewService.reject(id, body.get("comment"));
        enrichReview(review);
        return ResponseEntity.ok(review);
    }

    private void enrichReview(Review review) {
        counselorRepository.findById(review.getCounselorId()).ifPresent(c -> review.setCounselorName(c.getName()));
        applicationRepository.findById(review.getApplicationId()).ifPresent(app -> {
            studentRepository.findById(app.getStudentId()).ifPresent(s -> review.setStudentName(s.getName()));
            jobRepository.findById(app.getJobId()).ifPresent(j -> review.setJobTitle(j.getTitle()));
        });
    }
}
