package com.suza.connect.controller;

import com.suza.connect.dto.AnnouncementDTO;
import com.suza.connect.model.Announcement;
import com.suza.connect.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    public ResponseEntity<?> createAnnouncement(@RequestBody AnnouncementDTO announcementDTO) {
        Announcement createdAnnouncement = announcementService.createAnnouncement(announcementDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAnnouncement);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Announcement> getAnnouncementById(@PathVariable String id) {
        Announcement announcement = announcementService.getAnnouncementById(id);
        return ResponseEntity.ok(announcement);
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
        Long count = announcementService.getAnnouncementCount();
        return ResponseEntity.ok(count);
    }
}