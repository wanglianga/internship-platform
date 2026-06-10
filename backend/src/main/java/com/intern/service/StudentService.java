package com.intern.service;

import com.intern.entity.Student;
import com.intern.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    public Optional<Student> findById(Long id) {
        return studentRepository.findById(id);
    }

    @Transactional
    public Student save(Student student) {
        return studentRepository.save(student);
    }

    @Transactional
    public Student update(Long id, Student student) {
        student.setId(id);
        return studentRepository.save(student);
    }

    public Optional<Student> findByStudentNo(String studentNo) {
        return studentRepository.findByStudentNo(studentNo);
    }
}
