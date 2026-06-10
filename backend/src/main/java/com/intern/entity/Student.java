package com.intern.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String studentNo;
    private String major;
    private String grade;
    private String phone;
    private String email;
    private String preferredCities;
    private String resume;
    private String courses;
    @Column(columnDefinition = "boolean default false")
    private Boolean hasBreachRecord = false;
}
