package com.suza.connect.controller;

import com.suza.connect.service.PawaAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/pawa-ai")
@CrossOrigin(origins = "*")
public class PawaAIController {

    @Autowired
    private PawaAIService pawaAIService;

    @PostMapping("/chat")
    public ResponseEntity<?> chatWithAI(@RequestBody Map<String, Object> request) {
        try {
            String message = (String) request.get("message");
            String context = (String) request.getOrDefault("context", "general");
            
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
            }

            String response = pawaAIService.chatWithAI(message, context);
            return ResponseEntity.ok(Map.of("response", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to process chat request: " + e.getMessage()));
        }
    }

    @PostMapping("/enhance-cv")
    public ResponseEntity<?> enhanceCV(@RequestBody Map<String, Object> request) {
        try {
            String currentCV = (String) request.get("currentCV");
            String targetIndustry = (String) request.getOrDefault("targetIndustry", "General");
            String experienceLevel = (String) request.getOrDefault("experienceLevel", "Student");
            String jobDescription = (String) request.getOrDefault("jobDescription", "");
            
            if (currentCV == null || currentCV.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "CV content is required"));
            }

            String enhancedCV = pawaAIService.enhanceCV(currentCV, targetIndustry, experienceLevel, jobDescription);
            return ResponseEntity.ok(Map.of("enhancedCV", enhancedCV));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to enhance CV: " + e.getMessage()));
        }
    }

    @PostMapping("/generate-announcement")
    public ResponseEntity<?> generateAnnouncement(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            java.util.List<String> keyPoints = (java.util.List<String>) request.get("keyPoints");
            String targetAudience = (String) request.get("targetAudience");
            String urgency = (String) request.getOrDefault("urgency", "medium");
            String language = (String) request.getOrDefault("language", "en");
            
            if (keyPoints == null || keyPoints.isEmpty() || targetAudience == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Key points and target audience are required"));
            }

            String announcement = pawaAIService.generateAnnouncement(keyPoints, targetAudience, urgency, language);
            return ResponseEntity.ok(Map.of("announcement", announcement));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to generate announcement: " + e.getMessage()));
        }
    }

    @PostMapping("/analyze-data")
    public ResponseEntity<?> analyzeStudentData(@RequestBody Map<String, Object> request) {
        try {
            String query = (String) request.get("query");
            
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Query is required"));
            }

            String analysis = pawaAIService.analyzeStudentData(query);
            return ResponseEntity.ok(Map.of("analysis", analysis));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to analyze data: " + e.getMessage()));
        }
    }

    @PostMapping("/process-document")
    public ResponseEntity<?> processDocument(@RequestBody Map<String, Object> request) {
        try {
            String documentContent = (String) request.get("documentContent");
            String documentType = (String) request.get("documentType");
            
            if (documentContent == null || documentContent.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Document content is required"));
            }

            String processedDocument = pawaAIService.processDocument(documentContent, documentType);
            return ResponseEntity.ok(Map.of("processedDocument", processedDocument));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to process document: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> checkHealth() {
        try {
            boolean isHealthy = pawaAIService.checkServiceHealth();
            Map<String, Object> response = new HashMap<>();
            response.put("status", isHealthy ? "healthy" : "unhealthy");
            response.put("service", "Pawa AI");
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service health check failed: " + e.getMessage()));
        }
    }

    @GetMapping("/models")
    public ResponseEntity<?> getAvailableModels() {
        try {
            java.util.List<String> models = pawaAIService.getAvailableModels();
            return ResponseEntity.ok(Map.of("models", models));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get models: " + e.getMessage()));
        }
    }

    @PostMapping("/test-connection")
    public ResponseEntity<?> testConnection() {
        try {
            boolean isConnected = pawaAIService.testConnection();
            Map<String, Object> response = new HashMap<>();
            response.put("connected", isConnected);
            response.put("message", isConnected ? "Successfully connected to Pawa AI" : "Failed to connect to Pawa AI");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Connection test failed: " + e.getMessage()));
        }
    }
} 