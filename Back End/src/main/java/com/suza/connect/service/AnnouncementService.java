package com.suza.connect.service;

import com.suza.connect.dto.AnnouncementDTO;
import com.suza.connect.model.Announcement;
import com.suza.connect.model.AnnouncementAttachment;
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

    public Announcement createAnnouncement(String title, String content, String status, List<MultipartFile> attachments) {
        Announcement announcement = new Announcement();
        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setStatus(status);
        announcement.setCreatedDate(LocalDateTime.now());

        // Handle attachments
        if (attachments != null && !attachments.isEmpty()) {
            for (MultipartFile file : attachments) {
                try {
                    // Save file to disk (you can change the path as needed)
                    String uploadDir = "uploads/announcements/";
                    Files.createDirectories(Paths.get(uploadDir));
                    String filePath = uploadDir + System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    Path path = Paths.get(filePath);
                    Files.write(path, file.getBytes());

                    AnnouncementAttachment attachment = new AnnouncementAttachment();
                    attachment.setFileName(file.getOriginalFilename());
                    attachment.setFileUrl(filePath);
                    attachment.setAnnouncement(announcement);

                    announcement.getAttachments().add(attachment);
                } catch (Exception e) {
                    // Handle exception (log or rethrow)
                    e.printStackTrace();
                }
            }
        }

        return announcementRepository.save(announcement);
    }
}