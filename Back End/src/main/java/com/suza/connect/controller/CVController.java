package com.suza.connect.controller;

import com.suza.connect.dto.CVRequestDTO;
import com.suza.connect.model.CVRequest;
import com.suza.connect.service.CVGenerationService;
import com.suza.connect.service.CVRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cv-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CVController {

    private final CVRequestService cvRequestService;
    private final CVGenerationService cvGenerationService;

    @PostMapping
    public ResponseEntity<?> createCVRequest(@RequestBody CVRequestDTO requestDTO) {
        try {
            CVRequest createdRequest = cvRequestService.createCVRequest(requestDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "CV request submitted successfully",
                            "requestId", createdRequest.getId()
                    ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable String id) {
        Optional<CVRequest> request = cvRequestService.findById(id);
        if (request.isPresent()) {
            return ResponseEntity.ok(request.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Request not found"));
        }
    }

    @GetMapping("/recent/{email}")
    public ResponseEntity<List<CVRequest>> getRecentRequestsByEmail(
            @PathVariable String email,
            @RequestParam(defaultValue = "5") int limit) {
        List<CVRequest> recentRequests = cvRequestService.findRecentByEmail(email, limit);
        return ResponseEntity.ok(recentRequests);
    }

    @GetMapping("/{id}/generate")
    public ResponseEntity<?> generateCV(@PathVariable String id, @RequestParam(defaultValue = "docx") String format) {
        try {
            Optional<CVRequest> requestOpt = cvRequestService.findById(id);
            if (requestOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Request not found"));
            }
            CVRequest request = requestOpt.get();

            // Map CV template to filename
            String templateFileName;
            switch (request.getCvTemplate()) {
                case "classic":
                    templateFileName = "CVTemplateClassic.docx";
                    break;
                case "modern":
                    templateFileName = "CVTemplateModern.docx";
                    break;
                case "creative":
                    templateFileName = "CVTemplateCreative.docx";
                    break;
                default:
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Unknown CV template: " + request.getCvTemplate()));
            }
            String templatePath = "/home/ramah/Documents/FYP/templates/CV" + templateFileName;

            // Prepare placeholders map from request fields
            Map<String, String> placeholders = new HashMap<>();
            placeholders.put("fullName", safe(request.getFullName()));
            placeholders.put("email", safe(request.getEmail()));
            placeholders.put("phoneNumber", safe(request.getPhoneNumber()));
            placeholders.put("address", safe(request.getAddress()));
            placeholders.put("education", safe(request.getEducation()));
            placeholders.put("experience", safe(request.getExperience()));
            placeholders.put("skills", safe(request.getSkills()));
            placeholders.put("about", safe(request.getAbout()));
            // Add more as needed
            placeholders.put("date", java.time.LocalDate.now().toString());

            File filledDocx = cvGenerationService.fillTemplate(templatePath, placeholders);

            if ("pdf".equalsIgnoreCase(format)) {
                File pdfFile = cvGenerationService.convertDocxToPdf(filledDocx);
                InputStreamResource resource = new InputStreamResource(new FileInputStream(pdfFile));
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + pdfFile.getName())
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(resource);
            } else {
                InputStreamResource resource = new InputStreamResource(new FileInputStream(filledDocx));
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filledDocx.getName())
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(resource);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private String safe(Object value) {
        return value != null ? value.toString() : "";
    }
}