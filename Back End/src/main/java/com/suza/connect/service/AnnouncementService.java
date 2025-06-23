package com.suza.connect.service;

import com.suza.connect.dto.AnnouncementDTO;
import com.suza.connect.model.Announcement;
import com.suza.connect.model.User;
import com.suza.connect.repository.AnnouncementRepository;
import com.suza.connect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.validator.routines.EmailValidator;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Configuration
@EnableAsync
class AsyncConfig {}

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final EmailService emailService; // Inject EmailService
    private final UserRepository userRepository; // Inject UserRepository

    public Announcement createAnnouncement(AnnouncementDTO announcementDTO) {
        Announcement announcement = new Announcement();
        announcement.setTitle(announcementDTO.getTitle());
        announcement.setContent(announcementDTO.getContent());
        announcement.setStatus(announcementDTO.getStatus());
        announcement.setCreatedDate(LocalDateTime.now());
        Announcement saved = announcementRepository.save(announcement);

        // Send emails asynchronously
        sendAnnouncementEmailsAsync(announcementDTO);

        return saved;
    }

    @Async
    public void sendAnnouncementEmailsAsync(AnnouncementDTO announcementDTO) {
        // Notify all students
        userRepository.findAll().stream()
            .filter(user -> user.getRole().equalsIgnoreCase("student"))
            .forEach(user -> {
                String subject = "New Announcement: " + announcementDTO.getTitle();
                String text = announcementDTO.getContent();
                emailService.sendEmail(user.getEmail(), subject, text);
            });

        // Example: send email to all users
        List<User> users = userRepository.findAll();
        EmailValidator validator = EmailValidator.getInstance();

        for (User user : users) {
            String email = user.getEmail();
            if (validator.isValid(email)) {
                try {
                    emailService.sendEmail(email, "New Announcement", announcementDTO.getTitle());
                } catch (Exception e) {
                    System.err.println("Failed to send email to " + email + ": " + e.getMessage());
                }
            } else {
                System.err.println("Invalid email skipped: " + email);
            }
        }
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