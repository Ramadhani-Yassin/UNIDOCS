package com.suza.connect.service;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.io.File;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendEmailWithAvatar(String to, String subject, String htmlBody, String avatarPath) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // HTML email
            helper.setFrom("unidocs.ramadhani@gmail.com", "UNIDOCS");

            if (avatarPath != null && !avatarPath.isEmpty()) {
                FileSystemResource res = new FileSystemResource(new File(avatarPath));
                // Only add as inline image, do NOT add as attachment
                helper.addInline("statusAvatar", res, "image/png");
            }

            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Existing plain email method
    public void sendEmail(String to, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, false); // false = plain text, true = HTML
            helper.setFrom("unidocs.ramadhani@gmail.com", "UNIDOCS"); // Set sender name here
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void sendEmailWithAttachment(String to, String subject, String htmlBody, File attachment, String attachmentName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // HTML email
            helper.setFrom("unidocs.ramadhani@gmail.com", "UNIDOCS");
            if (attachment != null && attachment.exists()) {
                helper.addAttachment(attachmentName, attachment);
            }
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}