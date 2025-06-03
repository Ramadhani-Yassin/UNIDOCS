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
    public ResponseEntity<List<LetterRequest>> getRecentRequestsByEmail(
            @PathVariable String email,
            @RequestParam(defaultValue = "5") int limit) {
        List<LetterRequest> recentRequests = letterRequestService.findRecentByEmail(email, limit);
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
            placeholders.put("fullName", request.getFullName() != null ? request.getFullName() : "");
            placeholders.put("organizationName", request.getOrganizationName() != null ? request.getOrganizationName() : "");
            placeholders.put("yearOfStudy", request.getYearOfStudy() != null ? String.valueOf(request.getYearOfStudy()) : "");
            placeholders.put("programOfStudy", request.getProgramOfStudy() != null ? request.getProgramOfStudy() : "");
            placeholders.put("registrationNumber", request.getRegistrationNumber() != null ? request.getRegistrationNumber() : "");
            placeholders.put("startDate", request.getStartDate() != null ? request.getStartDate().toString() : "");
            placeholders.put("endDate", request.getEndDate() != null ? request.getEndDate().toString() : "");
            placeholders.put("phoneNumber", request.getPhoneNumber() != null ? request.getPhoneNumber() : "");
            placeholders.put("email", request.getEmail() != null ? request.getEmail() : "");
            placeholders.put("date", java.time.LocalDate.now().toString());
            placeholders.put("researchTitle", request.getResearchTitle() != null ? request.getResearchTitle() : "");
            placeholders.put("reasonForRequest", request.getReasonForRequest() != null ? request.getReasonForRequest() : "");
            placeholders.put("effectiveDate", request.getEffectiveDate() != null ? request.getEffectiveDate().toString() : "");
            placeholders.put("recommendationPurpose", request.getRecommendationPurpose() != null ? request.getRecommendationPurpose() : "");
            placeholders.put("receivingInstitution", request.getReceivingInstitution() != null ? request.getReceivingInstitution() : "");
            placeholders.put("submissionDeadline", request.getSubmissionDeadline() != null ? request.getSubmissionDeadline().toString() : "");

            File filledDocx = letterGenerationService.fillTemplate(templatePath, placeholders);

            if ("pdf".equalsIgnoreCase(format)) {
                File pdfFile = letterGenerationService.convertDocxToPdf(filledDocx);
                InputStreamResource resource = new InputStreamResource(new FileInputStream(pdfFile));
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=letter.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
            } else {
                InputStreamResource resource = new InputStreamResource(new FileInputStream(filledDocx));
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=letter.docx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                    .body(resource);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}