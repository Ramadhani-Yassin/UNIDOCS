package com.suza.connect.service;

import com.suza.connect.dto.AnnouncementDTO;
import com.suza.connect.model.Announcement;
import com.suza.connect.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public Announcement createAnnouncement(AnnouncementDTO announcementDTO) {
        Announcement announcement = new Announcement();
        announcement.setTitle(announcementDTO.getTitle());
        announcement.setContent(announcementDTO.getContent());
        announcement.setStatus(announcementDTO.getStatus());
        announcement.setCreatedDate(LocalDateTime.now());
        return announcementRepository.save(announcement);
    }

    public List<Announcement> getRecentAnnouncements(int limit) {
        return announcementRepository.findTopNByOrderByCreatedDateDesc(limit);
    }

    public Optional<Announcement> getAnnouncementById(Long id) {
        return announcementRepository.findById(id);
    }

    public Long countAnnouncements() {
        return announcementRepository.count();
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }
}