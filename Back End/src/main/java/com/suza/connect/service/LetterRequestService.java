package com.suza.connect.service;

import com.suza.connect.dto.LetterRequestDTO;
import com.suza.connect.model.LetterRequest;
import com.suza.connect.model.User;
import com.suza.connect.repository.LetterRequestRepository;
import com.suza.connect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LetterRequestService {

    private final LetterRequestRepository letterRequestRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final LetterGenerationService letterGenerationService; // <-- Add this

    public LetterRequest createLetterRequest(LetterRequestDTO requestDTO) {
        User user = userRepository.findByEmail(requestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        LetterRequest request = new LetterRequest();
        request.setFullName(requestDTO.getFullName());
        request.setEmail(requestDTO.getEmail());
        request.setRegistrationNumber(requestDTO.getRegistrationNumber());
        request.setPhoneNumber(requestDTO.getPhoneNumber());
        request.setProgramOfStudy(requestDTO.getProgramOfStudy());
        request.setYearOfStudy(requestDTO.getYearOfStudy());
        request.setLetterType(requestDTO.getLetterType());
        request.setReasonForRequest(requestDTO.getReasonForRequest());
        request.setUser(user);
        request.setStatus("PENDING");

        if (requestDTO.getEffectiveDate() != null) {
            request.setEffectiveDate(requestDTO.getEffectiveDate()
                    .toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
        }
        if (requestDTO.getOrganizationName() != null) {
            request.setOrganizationName(requestDTO.getOrganizationName());
        }
        if (requestDTO.getStartDate() != null) {
            request.setStartDate(requestDTO.getStartDate()
                    .toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
        }
        if (requestDTO.getEndDate() != null) {
            request.setEndDate(requestDTO.getEndDate()
                    .toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
        }
        if (requestDTO.getResearchTitle() != null) {
            request.setResearchTitle(requestDTO.getResearchTitle());
        }
        if (requestDTO.getRecommendationPurpose() != null) {
            request.setRecommendationPurpose(requestDTO.getRecommendationPurpose());
        }
        if (requestDTO.getReceivingInstitution() != null) {
            request.setReceivingInstitution(requestDTO.getReceivingInstitution());
        }
        if (requestDTO.getSubmissionDeadline() != null) {
            request.setSubmissionDeadline(requestDTO.getSubmissionDeadline()
                    .toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
        }
        if (requestDTO.getTranscriptPurpose() != null) {
            request.setTranscriptPurpose(requestDTO.getTranscriptPurpose());
        }
        if (requestDTO.getDeliveryMethod() != null) {
            request.setDeliveryMethod(requestDTO.getDeliveryMethod());
        }

        LetterRequest savedRequest = letterRequestRepository.save(request);

        try {
            // --- NEW: Generate the letter file from template and request data ---
            String templateFileName;
            switch (savedRequest.getLetterType()) {
                case "introduction":
                    templateFileName = "IntroductionLetter.docx";
                    break;
                case "feasibility_study":
                    templateFileName = "FeasibilityStudyApproval.docx";
                    break;
                case "discontinuation":
                    templateFileName = "DiscontinuationLetter.docx";
                    break;
                case "postponement":
                    templateFileName = "postponeTemplate.docx";
                    break;
                case "scholarship":
                    templateFileName = "RecommendationLetter.docx";
                    break;
                case "transcript":
                    templateFileName = "TranscriptRequestLetter.docx";
                    break;
                default:
                    throw new RuntimeException("Unknown letter type: " + savedRequest.getLetterType());
            }
            String templatePath = "/home/ramah/Documents/FYP/templates/" + templateFileName;

            // Prepare placeholders map from request fields
            Map<String, String> placeholders = new HashMap<>();
            placeholders.put("fullName", safe(savedRequest.getFullName()));
            placeholders.put("organizationName", safe(savedRequest.getOrganizationName()));
            placeholders.put("yearOfStudy", safe(savedRequest.getYearOfStudy()));
            placeholders.put("programOfStudy", safe(savedRequest.getProgramOfStudy()));
            placeholders.put("registrationNumber", safe(savedRequest.getRegistrationNumber()));
            placeholders.put("startDate", safe(savedRequest.getStartDate()));
            placeholders.put("endDate", safe(savedRequest.getEndDate()));
            placeholders.put("phoneNumber", safe(savedRequest.getPhoneNumber()));
            placeholders.put("email", safe(savedRequest.getEmail()));
            placeholders.put("date", java.time.LocalDate.now().toString());
            placeholders.put("researchTitle", safe(savedRequest.getResearchTitle()));
            placeholders.put("reasonForRequest", safe(savedRequest.getReasonForRequest()));
            placeholders.put("effectiveDate", safe(savedRequest.getEffectiveDate()));
            placeholders.put("recommendationPurpose", safe(savedRequest.getRecommendationPurpose()));
            placeholders.put("receivingInstitution", safe(savedRequest.getReceivingInstitution()));
            placeholders.put("submissionDeadline", safe(savedRequest.getSubmissionDeadline()));
            placeholders.put("transcriptPurpose", safe(savedRequest.getTranscriptPurpose()));
            placeholders.put("deliveryMethod", safe(savedRequest.getDeliveryMethod()));

            // Generate the filled DOCX
            File filledDocx = letterGenerationService.fillTemplate(templatePath, placeholders);

            // Convert to PDF (if you want to send PDF)
            File pdfFile = letterGenerationService.convertDocxToPdf(filledDocx);

            // --- NEW: Send the email with PDF attachment ---
            String subject = "Your Requested University Letter";
            String htmlBody = "<p>Dear " + user.getFirstName() + ",</p>"
                + "<p>Your requested letter is attached to this email.</p>"
                + "<p>Best regards,<br>UNIDOCS Team</p>";
            // Build a user-friendly filename
            String firstName = user.getFirstName() != null ? user.getFirstName().replaceAll("\\s+", "") : "User";
            String lastName = user.getLastName() != null ? user.getLastName().replaceAll("\\s+", "") : "";
            String letterType = savedRequest.getLetterType() != null ? savedRequest.getLetterType().replaceAll("\\s+", "_") : "Letter";
            String fileName = firstName + "_" + lastName + "_" + letterType + ".pdf";

            // --- Send the email with the custom filename ---
            emailService.sendEmailWithAttachment(
                user.getEmail(),
                subject,
                htmlBody,
                pdfFile,
                fileName
            );
        } catch (Exception e) {
            // Log and optionally notify admin
            e.printStackTrace();
            throw new RuntimeException("Failed to generate or send letter: " + e.getMessage());
        }

        return savedRequest;
    }

    public Optional<LetterRequest> findById(String id) {
        try {
            UUID uuid = UUID.fromString(id);
            return letterRequestRepository.findById(uuid);
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public List<LetterRequestDTO> findRecentByEmail(String email, int limit) {
        List<LetterRequest> requests = letterRequestRepository.findByEmailOrderByRequestDateDesc(email, PageRequest.of(0, limit));
        return requests.stream().map(this::toDTO).collect(Collectors.toList());
    }

    private LetterRequestDTO toDTO(LetterRequest req) {
        LetterRequestDTO dto = new LetterRequestDTO();
        dto.setId(req.getId().toString());
        dto.setFullName(req.getFullName());
        dto.setEmail(req.getEmail());
        dto.setRegistrationNumber(req.getRegistrationNumber());
        dto.setPhoneNumber(req.getPhoneNumber());
        dto.setProgramOfStudy(req.getProgramOfStudy());
        dto.setYearOfStudy(req.getYearOfStudy());
        dto.setLetterType(req.getLetterType());
        dto.setReasonForRequest(req.getReasonForRequest());
        dto.setEffectiveDate(req.getEffectiveDate() != null ? java.sql.Date.valueOf(req.getEffectiveDate()) : null);
        dto.setOrganizationName(req.getOrganizationName());
        dto.setStartDate(req.getStartDate() != null ? java.sql.Date.valueOf(req.getStartDate()) : null);
        dto.setEndDate(req.getEndDate() != null ? java.sql.Date.valueOf(req.getEndDate()) : null);
        dto.setResearchTitle(req.getResearchTitle());
        dto.setRecommendationPurpose(req.getRecommendationPurpose());
        dto.setReceivingInstitution(req.getReceivingInstitution());
        dto.setSubmissionDeadline(req.getSubmissionDeadline() != null ? java.sql.Date.valueOf(req.getSubmissionDeadline()) : null);
        dto.setTranscriptPurpose(req.getTranscriptPurpose());
        dto.setDeliveryMethod(req.getDeliveryMethod());
        dto.setStatus(req.getStatus());
        dto.setRequestDate(req.getRequestDate());
        dto.setAdminComment(req.getAdminComment());
        return dto;
    }

    public Long countByStudentEmail(String email) {
        return letterRequestRepository.countByEmail(email);
    }

    public void updateStatus(UUID id, String status, String comment) {
        LetterRequest req = letterRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        req.setStatus(status);
        req.setAdminComment(comment);
        letterRequestRepository.save(req);

        // Choose avatar based on status
        String avatarPath;
        switch (status.toLowerCase()) {
            case "approved":
                avatarPath = "/home/ramah/Documents/FYP/Front End/src/assets/images/approved.png";
                break;
            case "declined":
            case "rejected":
                avatarPath = "/home/ramah/Documents/FYP/Front End/src/assets/images/cancel.png";
                break;
            case "pending":
            default:
                avatarPath = "/home/ramah/Documents/FYP/Front End/src/assets/images/pending.png";
                break;
        }

        String subject = "Update on Your Letter Request";
        String htmlBody = String.format(
            "<div style='font-family: Arial, sans-serif;'>"
            + "<h2 style='color:#2d3748;'>Dear %s,</h2>"
            + "<p>Your letter request for <b>%s</b> has been <b style='color:%s;'>%s</b>.</p>"
            + "<p><b>Admin Comment:</b> %s</p>"
            + "<p>If you have any questions or require further assistance, please do not hesitate to contact us.</p>"
            + "<br><p>Best regards,<br><b>UNIDOCS Team</b><br>State University of Zanzibar</p>"
            + "<div style='text-align:center; margin-top:24px;'>"
            + "<img src='cid:statusAvatar' alt='%s' style='width:64px;height:64px;display:inline-block;'/>"
            + "</div>"
            + "</div>",
            req.getFullName(),
            displayLetterType(req.getLetterType()),
            statusColor(status),
            status.toUpperCase(),
            (comment == null || comment.trim().isEmpty()) ? "No additional comments." : comment.trim(),
            status
        );

        emailService.sendEmailWithAvatar(req.getEmail(), subject, htmlBody, avatarPath);
    }

    // After generating the letter file:
    public void sendLetterFile(User user, File letterFile) {
        String subject = "Your Requested University Letter";
        String htmlBody = String.format(
            "<div style='font-family: Arial, sans-serif;'>"
            + "<h2 style='color:#2d3748;'>Dear %s,</h2>"
            + "<p>Your letter request for <b style='color:#007bff;'>%s</b> is attached to this email as a PDF document for your reference.</p>"
            + "<div style='margin:24px 0; text-align:center;'>"
            + "<span style='display:inline-block; background:#e9f7ef; color:#28a745; font-weight:600; padding:8px 24px; border-radius:24px;'>"
            + "UNIDOCS - State University of Zanzibar"
            + "</span>"
            + "</div>"
            + "<p>If you have any questions or require further assistance, please do not hesitate to contact us.</p>"
            + "<br><p>Best regards,<br><b>UNIDOCS Team</b><br>State University of Zanzibar</p>"
            + "</div>",
            user.getFirstName(),
            displayLetterType(displayLetterType(null))
        );
        emailService.sendEmailWithAttachment(
            user.getEmail(),
            subject,
            htmlBody,
            letterFile,
            letterFile.getName()
        );
    }

    public void sendLetterFile(User user, File letterFile, String letterType) {
        String subject = "Your Requested University Letter";
        String htmlBody = String.format(
            "<div style='font-family: Arial, sans-serif;'>"
            + "<h2 style='color:#2d3748;'>Dear %s,</h2>"
            + "<p>Your letter request for <b style='color:#007bff;'>%s</b> is attached to this email as a PDF document for your reference.</p>"
            + "<div style='margin:24px 0; text-align:center;'>"
            + "<span style='display:inline-block; background:#e9f7ef; color:#28a745; font-weight:600; padding:8px 24px; border-radius:24px;'>"
            + "UNIDOCS - State University of Zanzibar"
            + "</span>"
            + "</div>"
            + "<p>If you have any questions or require further assistance, please do not hesitate to contact us.</p>"
            + "<br><p>Best regards,<br><b>UNIDOCS Team</b><br>State University of Zanzibar</p>"
            + "</div>",
            user.getFirstName(),
            displayLetterType(letterType)
        );
        emailService.sendEmailWithAttachment(
            user.getEmail(),
            subject,
            htmlBody,
            letterFile,
            letterFile.getName()
        );
    }

    // Helper for display name
    private String displayLetterType(String type) {
        switch (type) {
            case "feasibility_study": return "Feasibility Study";
            case "introduction": return "Introduction Letter";
            case "recommendation": return "Recommendation Letter";
            case "postponement": return "Postponement";
            default: return type.replace("_", " ");
        }
    }

    // Helper for status color
    private String statusColor(String status) {
        switch (status.toLowerCase()) {
            case "approved": return "#28a745";
            case "declined":
            case "rejected": return "#dc3545";
            case "pending": default: return "#ffc107";
        }
    }

    public List<LetterRequestDTO> findAll() {
        return letterRequestRepository.findAllByOrderByRequestDateDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<LetterRequest> getAllLetterRequests() {
        return letterRequestRepository.findAll();
    }

    public List<LetterRequestDTO> findAllByEmail(String email) {
        List<LetterRequest> requests = letterRequestRepository.findAllByEmailOrderByRequestDateDesc(email);
        return requests.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Long getTotalLetterRequests() {
        return letterRequestRepository.count();
    }

    public Map<String, Object> getUserAnalytics(String email, int range) {
        Map<String, Object> analytics = new HashMap<>();

        LocalDateTime since = LocalDateTime.now().minusDays(range);
        List<LetterRequest> requests = letterRequestRepository.findByEmailAndRequestDateAfterOrderByRequestDateDesc(email, since);

        // Letter type distribution
        Map<String, Long> letterTypeDistribution = requests.stream()
                .collect(Collectors.groupingBy(LetterRequest::getLetterType, Collectors.counting()));

        // Status distribution (group 'declined' and 'rejected' together)
        Map<String, Long> statusDistribution = requests.stream()
                .collect(Collectors.groupingBy(r -> {
                    String status = r.getStatus().toLowerCase();
                    if (status.equals("declined")) return "rejected";
                    return status;
                }, Collectors.counting()));

        // Totals for summary cards
        long totalRequests = requests.size();
        long approvedRequests = statusDistribution.getOrDefault("approved", 0L);
        long pendingRequests = statusDistribution.getOrDefault("pending", 0L);
        long rejectedRequests = statusDistribution.getOrDefault("rejected", 0L);

        // Recent requests (last 5)
        List<LetterRequestDTO> recentRequests = requests.stream()
                .limit(5)
                .map(this::toDTO)
                .collect(Collectors.toList());

        // Program distribution
        Map<String, Long> programDistribution = requests.stream()
                .collect(Collectors.groupingBy(LetterRequest::getProgramOfStudy, Collectors.counting()));

        analytics.put("letterTypeDistribution", letterTypeDistribution);
        analytics.put("statusDistribution", statusDistribution);
        analytics.put("recentRequests", recentRequests);
        analytics.put("programDistribution", programDistribution);

        // Add summary numbers for frontend cards
        analytics.put("totalRequests", totalRequests);
        analytics.put("approvedRequests", approvedRequests);
        analytics.put("pendingRequests", pendingRequests);
        analytics.put("rejectedRequests", rejectedRequests);

        // Optionally: analytics.put("percentageChanges", ...);

        return analytics;
    }

    public Map<String, Object> getGeneralAnalytics(int range) {
        Map<String, Object> analytics = new HashMap<>();

        LocalDateTime since = LocalDateTime.now().minusDays(range);
        List<LetterRequest> requests = letterRequestRepository.findAll().stream()
                .filter(r -> r.getRequestDate().isAfter(since))
                .collect(Collectors.toList());

        // Letter type distribution
        Map<String, Long> letterTypeDistribution = requests.stream()
                .collect(Collectors.groupingBy(LetterRequest::getLetterType, Collectors.counting()));

        // Status distribution (group 'declined' and 'rejected' together as 'rejected')
        Map<String, Long> statusDistribution = requests.stream()
                .collect(Collectors.groupingBy(r -> {
                    String status = r.getStatus().toLowerCase();
                    if (status.equals("declined")) return "rejected";
                    return status;
                }, Collectors.counting()));

        // Totals for summary cards
        long totalRequests = requests.size();
        long approvedRequests = statusDistribution.getOrDefault("approved", 0L);
        long pendingRequests = statusDistribution.getOrDefault("pending", 0L);
        long rejectedRequests = statusDistribution.getOrDefault("rejected", 0L);

        // Recent requests (last 5)
        List<LetterRequestDTO> recentRequests = requests.stream()
                .sorted((a, b) -> b.getRequestDate().compareTo(a.getRequestDate()))
                .limit(5)
                .map(this::toDTO)
                .collect(Collectors.toList());

        // Program distribution
        Map<String, Long> programDistribution = requests.stream()
                .collect(Collectors.groupingBy(LetterRequest::getProgramOfStudy, Collectors.counting()));

        analytics.put("letterTypeDistribution", letterTypeDistribution);
        analytics.put("statusDistribution", statusDistribution);
        analytics.put("recentRequests", recentRequests);
        analytics.put("programDistribution", programDistribution);

        analytics.put("totalRequests", totalRequests);
        analytics.put("approvedRequests", approvedRequests);
        analytics.put("pendingRequests", pendingRequests);
        analytics.put("rejectedRequests", rejectedRequests);

        return analytics;
    }

    public boolean canApprove(String letterType, String userRole) {
        switch (letterType.toLowerCase()) {
            case "introduction":
                return userRole.equalsIgnoreCase("VC") || userRole.equalsIgnoreCase("admin");
            case "feasibility_study":
                return userRole.equalsIgnoreCase("HOS") || userRole.equalsIgnoreCase("SECRETARY") || userRole.equalsIgnoreCase("admin");
            case "recommendation":
                return userRole.equalsIgnoreCase("DSC") || userRole.equalsIgnoreCase("LECTURER") || userRole.equalsIgnoreCase("admin");
            default:
                return userRole.equalsIgnoreCase("admin");
        }
    }

    // Helper for null safety
    private String safe(Object value) {
        if (value == null) return "";
        if (value instanceof java.time.LocalDate) return value.toString();
        if (value instanceof java.time.LocalDateTime) return value.toString();
        return value.toString();
    }
}