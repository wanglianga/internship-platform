package com.intern.service;

import com.intern.entity.Application;
import com.intern.entity.Review;
import com.intern.repository.AgreementRepository;
import com.intern.repository.ApplicationRepository;
import com.intern.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ApplicationRepository applicationRepository;
    private final AgreementRepository agreementRepository;

    public List<Review> findAll() {
        return reviewRepository.findAll();
    }

    public Optional<Review> findById(Long id) {
        return reviewRepository.findById(id);
    }

    public List<Review> findByStatus(String status) {
        return reviewRepository.findByStatus(status);
    }

    public List<Review> findByCounselorId(Long counselorId) {
        return reviewRepository.findByCounselorId(counselorId);
    }

    @Transactional
    public Review approve(Long id, String comment) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found: " + id));
        review.setStatus("APPROVED");
        review.setComment(comment);
        review.setReviewedAt(LocalDateTime.now());
        reviewRepository.save(review);
        if ("DEPARTMENT".equals(review.getType()) || "AGREEMENT".equals(review.getType())) {
            applicationRepository.findById(review.getApplicationId()).ifPresent(app -> {
                app.setStatus("AGREEMENT_PENDING");
                applicationRepository.save(app);
            });
        }
        return review;
    }

    @Transactional
    public Review reject(Long id, String comment) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found: " + id));
        review.setStatus("REJECTED");
        review.setComment(comment);
        review.setReviewedAt(LocalDateTime.now());
        reviewRepository.save(review);
        if ("DEPARTMENT".equals(review.getType())) {
            applicationRepository.findById(review.getApplicationId()).ifPresent(app -> {
                app.setStatus("REJECTED");
                applicationRepository.save(app);
            });
        }
        return review;
    }
}
