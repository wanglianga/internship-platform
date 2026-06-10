package com.intern.repository;

import com.intern.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByStatus(String status);
    List<Review> findByCounselorId(Long counselorId);
    List<Review> findByType(String type);
}
