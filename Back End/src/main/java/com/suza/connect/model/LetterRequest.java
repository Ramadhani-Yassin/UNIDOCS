package com.suza.connect.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "letter_requests")
@Data
public class LetterRequest {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(name = "registration_number", nullable = false)
    private String registrationNumber;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "program_of_study", nullable = false)
    private String programOfStudy;

    @Column(name = "year_of_study", nullable = false)
    private Integer yearOfStudy;

    @Column(name = "letter_type", nullable = false)
    private String letterType;

    @Column(name = "reason_for_request", columnDefinition = "TEXT")
    private String reasonForRequest;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "organization_name")
    private String organizationName;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "research_title")
    private String researchTitle;

    @Column(name = "recommendation_purpose")
    private String recommendationPurpose;

    @Column(name = "receiving_institution")
    private String receivingInstitution;

    @Column(name = "submission_deadline")
    private LocalDate submissionDeadline;

    @Column(name = "transcript_purpose")
    private String transcriptPurpose;

    @Column(name = "delivery_method")
    private String deliveryMethod;

    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}