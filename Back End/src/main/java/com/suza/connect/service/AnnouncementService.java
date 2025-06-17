package com.suza.connect.service;

import com.suza.connect.dto.AnnouncementDTO;
import com.suza.connect.model.Announcement;
import com.suza.connect.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
        return announcementRepository.findAllByOrderByCreatedDateDesc(PageRequest.of(0, limit));
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

    public Announcement updateAnnouncement(Long id, AnnouncementDTO dto) {
        return announcementRepository.findById(id).map(announcement -> {
            announcement.setTitle(dto.getTitle());
            announcement.setContent(dto.getContent());
            announcement.setStatus(dto.getStatus());
            announcement.setCreatedDate(java.time.LocalDateTime.now());
            return announcementRepository.save(announcement);
        }).orElse(null);
    }

    public boolean deleteAnnouncement(Long id) {
        if (announcementRepository.existsById(id)) {
            announcementRepository.deleteById(id);
            return true;
        }
        return false;
    }
}