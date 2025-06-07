package com.suza.connect.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cv_requests")
@Data
public class CVRequest {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "education", columnDefinition = "TEXT", nullable = false)
    private String education;

    @Column(name = "experience", columnDefinition = "TEXT", nullable = false)
    private String experience;

    @Column(name = "skills", columnDefinition = "TEXT", nullable = false)
    private String skills;

    @Column(name = "cv_template", nullable = false)
    private String cvTemplate;

    // Optional fields
    @Column(name = "about", columnDefinition = "TEXT", nullable = true)
    private String about;

    @Column(name = "program_of_study", nullable = true)
    private String programOfStudy;

    @Column(name = "submission_date", nullable = false)
    private LocalDateTime submissionDate = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}