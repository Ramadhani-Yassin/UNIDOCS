package com.suza.connect.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Data
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String status; // e.g., 'new', 'important', 'update'

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    // Additional fields can be added as needed
}