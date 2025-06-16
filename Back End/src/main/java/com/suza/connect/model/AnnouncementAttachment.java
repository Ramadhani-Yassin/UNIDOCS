package com.suza.connect.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "announcement_attachments")
@Data
public class AnnouncementAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileUrl; // Store the file path or URL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id")
    private Announcement announcement;
}