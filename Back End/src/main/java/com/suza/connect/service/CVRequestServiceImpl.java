package com.suza.connect.service;

import com.suza.connect.dto.CVRequestDTO;
import com.suza.connect.model.CVRequest;
import com.suza.connect.repository.CVRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.io.File;

@Service
public class CVRequestServiceImpl implements CVRequestService {

    private final CVRequestRepository cvRequestRepository;
    private final CVGenerationService cvGenerationService;
    private final EmailService emailService;

    @Autowired
    public CVRequestServiceImpl(CVRequestRepository cvRequestRepository, CVGenerationService cvGenerationService, EmailService emailService) {
        this.cvRequestRepository = cvRequestRepository;
        this.cvGenerationService = cvGenerationService;
        this.emailService = emailService;
    }

    @Override
    public CVRequest createCVRequest(CVRequestDTO requestDTO) {
        CVRequest request = new CVRequest();
        request.setFullName(requestDTO.getFullName());
        request.setEmail(requestDTO.getEmail());
        request.setPhoneNumber(requestDTO.getPhoneNumber());
        request.setAddress(requestDTO.getAddress());
        request.setEducation(requestDTO.getEducation());
        request.setExperience(requestDTO.getExperience());
        request.setSkills(requestDTO.getSkills());
        request.setCvTemplate(requestDTO.getCvTemplate());
        request.setAbout(requestDTO.getAbout());
        request.setProgramOfStudy(requestDTO.getProgramOfStudy());
        request.setSubmissionDate(java.time.LocalDateTime.now());
        CVRequest saved = cvRequestRepository.save(request);
        try {
            // Map template
            String templateFileName;
            switch (saved.getCvTemplate()) {
                case "classic": templateFileName = "CVTemplateClassic.docx"; break;
                case "modern": templateFileName = "CVTemplateModern.docx"; break;
                case "creative": templateFileName = "CVTemplateCreative.docx"; break;
                default: templateFileName = "CVTemplateClassic.docx";
            }
            String templatePath = "/home/ramah/Documents/FYP/templates/" + templateFileName;
            Map<String, String> placeholders = new HashMap<>();
            placeholders.put("fullName", safe(saved.getFullName()));
            placeholders.put("email", safe(saved.getEmail()));
            placeholders.put("phoneNumber", safe(saved.getPhoneNumber()));
            placeholders.put("address", safe(saved.getAddress()));
            placeholders.put("education", safe(saved.getEducation()));
            placeholders.put("experience", safe(saved.getExperience()));
            placeholders.put("skills", safe(saved.getSkills()));
            placeholders.put("about", safe(saved.getAbout()));
            placeholders.put("date", java.time.LocalDate.now().toString());
            File filledDocx = cvGenerationService.fillTemplate(templatePath, placeholders);
            File pdfFile = cvGenerationService.convertDocxToPdf(filledDocx);
            // Email body
            String subject = "Your Generated CV";
            String htmlBody = String.format(
                "<div style='font-family: Arial, sans-serif; background:#f9f9f9; padding:24px;'>"
                + "<h2 style='color:#2d3748;'>Dear %s,</h2>"
                + "<p style='font-size:16px;'>Your CV is attached to this email as a PDF document for your reference.</p>"
                + "<div style='margin:24px 0; text-align:center;'>"
                + "<span style='display:inline-block; background:#e9f7ef; color:#28a745; font-weight:600; padding:8px 24px; border-radius:24px;'>"
                + "UNIDOCS - The State University of Zanzibar"
                + "</span>"
                + "</div>"
                + "<p style='font-size:15px;'>If you have any questions or require further assistance, please do not hesitate to contact us.</p>"
                + "<br><p style='font-size:15px;'>Best regards,<br><b>UNIDOCS Team</b><br>The State University of Zanzibar</p>"
                + "</div>",
                saved.getFullName()
            );
            String[] nameParts = saved.getFullName() != null ? saved.getFullName().trim().split("\\s+") : new String[]{"User"};
            String firstName = nameParts.length > 0 ? nameParts[0] : "User";
            String lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
            String baseFileName = (firstName + " " + lastName + " CV").trim().replaceAll("[^a-zA-Z0-9 ]", "");
            String attachmentName = baseFileName + ".pdf";
            emailService.sendEmailWithAttachment(
                saved.getEmail(),
                subject,
                htmlBody,
                pdfFile,
                attachmentName
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
        return saved;
    }

    private String safe(Object value) {
        return value != null ? value.toString() : "";
    }

    @Override
    public Optional<CVRequest> findById(String id) {
        try {
            return cvRequestRepository.findById(java.util.UUID.fromString(id));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @Override
    public List<CVRequest> findRecentByEmail(String email, int limit) {
        // You may need to implement a custom query for this
        // For now, just return all for the email
        // return cvRequestRepository.findByEmailOrderBySubmissionDateDesc(email, PageRequest.of(0, limit));
        return (List<CVRequest>) cvRequestRepository.findAll(); // Placeholder
    }
}
