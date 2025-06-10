package com.suza.connect.controller;

import com.suza.connect.dto.LetterRequestDTO;
import com.suza.connect.model.LetterRequest;
import com.suza.connect.service.LetterGenerationService;
import com.suza.connect.service.LetterRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.FileInputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/letter-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class LetterRequestController {

    private final LetterRequestService letterRequestService;
    private final LetterGenerationService letterGenerationService;

    @PostMapping
    public ResponseEntity<?> createLetterRequest(@RequestBody LetterRequestDTO requestDTO) {
        try {
            LetterRequest createdRequest = letterRequestService.createLetterRequest(requestDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Letter request submitted successfully",
                            "requestId", createdRequest.getId()
                    ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable String id) {
        Optional<LetterRequest> request = letterRequestService.findById(id);
        if (request.isPresent()) {
            return ResponseEntity.ok(request.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Request not found"));
        }
    }

    @GetMapping("/recent/{email}")
    public ResponseEntity<List<LetterRequestDTO>> getRecentRequestsByEmail(
            @PathVariable String email,
            @RequestParam(defaultValue = "5") int limit) {
        List<LetterRequestDTO> recentRequests = letterRequestService.findRecentByEmail(email, limit);
        return ResponseEntity.ok(recentRequests);
    }

    @GetMapping("/count/{email}")
    public ResponseEntity<Long> getRequestCountByEmail(@PathVariable String email) {
        Long count = letterRequestService.countByStudentEmail(email);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{id}/generate")
    public ResponseEntity<?> generateLetter(@PathVariable String id, @RequestParam(defaultValue = "docx") String format) {
        try {
            Optional<LetterRequest> requestOpt = letterRequestService.findById(id);
            if (requestOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Request not found"));
            }
            LetterRequest request = requestOpt.get();

            // Map letterType to template filename
            String templateFileName;
            switch (request.getLetterType()) {
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
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Unknown letter type: " + request.getLetterType()));
            }
            String templatePath = "/home/ramah/Documents/FYP/templates/" + templateFileName;
            File templateFile = new File(templatePath);
            if (!templateFile.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Template not found: " + templateFileName));
            }

            // Prepare placeholders map from request fields
            Map<String, String> placeholders = new HashMap<>();
            placeholders.put("fullName", safe(request.getFullName()));
            placeholders.put("organizationName", safe(request.getOrganizationName()));
            placeholders.put("yearOfStudy", safe(request.getYearOfStudy()));
            placeholders.put("programOfStudy", safe(request.getProgramOfStudy()));
            placeholders.put("registrationNumber", safe(request.getRegistrationNumber()));
            placeholders.put("startDate", safe(request.getStartDate()));
            placeholders.put("endDate", safe(request.getEndDate()));
            placeholders.put("phoneNumber", safe(request.getPhoneNumber()));
            placeholders.put("email", safe(request.getEmail()));
            placeholders.put("date", java.time.LocalDate.now().toString());
            placeholders.put("researchTitle", safe(request.getResearchTitle()));
            placeholders.put("reasonForRequest", safe(request.getReasonForRequest()));
            placeholders.put("effectiveDate", safe(request.getEffectiveDate()));
            placeholders.put("recommendationPurpose", safe(request.getRecommendationPurpose()));
            placeholders.put("receivingInstitution", safe(request.getReceivingInstitution()));
            placeholders.put("submissionDeadline", safe(request.getSubmissionDeadline()));
            placeholders.put("transcriptPurpose", safe(request.getTranscriptPurpose()));
            placeholders.put("deliveryMethod", safe(request.getDeliveryMethod()));

            File filledDocx = letterGenerationService.fillTemplate(templatePath, placeholders);

            // Extract first and last name from request (assuming fullName is "First Last")
            String fullName = safe(request.getFullName());
            String[] nameParts = fullName.trim().split("\\s+");
            String firstName = nameParts.length > 0 ? nameParts[0] : "User";
            String lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
            String baseFileName = (firstName + " " + lastName + " letter").trim().replaceAll("[^a-zA-Z0-9 ]", "");
            String fileExtension = "pdf".equalsIgnoreCase(format) ? "pdf" : "docx";
            String fileName = baseFileName + "." + fileExtension;

            if ("pdf".equalsIgnoreCase(format)) {
                File pdfFile = letterGenerationService.convertDocxToPdf(filledDocx);
                InputStreamResource resource = new InputStreamResource(new FileInputStream(pdfFile));
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
            } else {
                InputStreamResource resource = new InputStreamResource(new FileInputStream(filledDocx));
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                    .body(resource);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // Add this helper method in your controller class:
    private String safe(Object value) {
        if (value == null) return "";
        if (value instanceof java.time.LocalDate) return value.toString();
        if (value instanceof java.time.LocalDateTime) return value.toString();
        return value.toString();
    }

    @GetMapping
    public ResponseEntity<?> getAllLetterRequests() {
        // Replace with your actual service call
        return ResponseEntity.ok(letterRequestService.getAllLetterRequests());
    }
}