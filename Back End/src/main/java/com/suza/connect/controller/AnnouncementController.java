package com.suza.connect.controller;

import com.suza.connect.dto.AnnouncementDTO;
import com.suza.connect.model.Announcement;
import com.suza.connect.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createAnnouncement(
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart("status") String status,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments
    ) {
        Announcement createdAnnouncement = announcementService.createAnnouncement(title, content, status, attachments);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAnnouncement);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Announcement> getAnnouncementById(@PathVariable Long id) {
        return announcementService.getAnnouncementById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Announcement>> getRecentAnnouncements(@RequestParam(defaultValue = "5") int limit) {
        List<Announcement> announcements = announcementService.getRecentAnnouncements(limit);
        return ResponseEntity.ok(announcements);
    }

    @GetMapping
    public ResponseEntity<List<Announcement>> getAllAnnouncements() {
        List<Announcement> announcements = announcementService.getAllAnnouncements();
        return ResponseEntity.ok(announcements);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getAnnouncementCount() {
        Long count = announcementService.countAnnouncements();
        return ResponseEntity.ok(count);
    }
}