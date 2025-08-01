package com.suza.connect.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PawaAIService {

    @Value("${pawa.ai.base-url:https://api.pawa-ai.com/v1}")
    private String pawaAIBaseUrl;

    @Value("${pawa.ai.api-key}")
    private String pawaAIApiKey;

    @Value("${pawa.ai.default-model:pawa-min-beta}")
    private String defaultModel;

    private final RestTemplate restTemplate;

    public PawaAIService() {
        this.restTemplate = new RestTemplate();
    }

    public String chatWithAI(String message, String context) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", defaultModel);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", 
                "You are a helpful university student assistant for SUZA (State University of Zanzibar). " +
                "You help students with academic queries, university procedures, and general guidance. " +
                "Be friendly, professional, and provide accurate information. " +
                "If you don't know something specific about SUZA, say so and suggest contacting the relevant department. " +
                "Context: " + context));
            messages.add(Map.of("role", "user", "content", message));
            
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 800);
            requestBody.put("temperature", 0.6);

            return callPawaAI("/chat/completions", requestBody);
        } catch (Exception e) {
            throw new RuntimeException("Failed to chat with AI: " + e.getMessage(), e);
        }
    }

    public String enhanceCV(String currentCV, String targetIndustry, String experienceLevel, String jobDescription) {
        try {
            String prompt = buildCVEnhancementPrompt(currentCV, targetIndustry, experienceLevel, jobDescription);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", defaultModel);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", 
                "You are an expert CV/resume writer and career advisor. Provide specific, actionable improvements to make the CV more effective and professional."));
            messages.add(Map.of("role", "user", "content", prompt));
            
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 1500);
            requestBody.put("temperature", 0.7);

            return callPawaAI("/chat/completions", requestBody);
        } catch (Exception e) {
            throw new RuntimeException("Failed to enhance CV: " + e.getMessage(), e);
        }
    }

    public String generateAnnouncement(List<String> keyPoints, String targetAudience, String urgency, String language) {
        try {
            String prompt = buildAnnouncementPrompt(keyPoints, targetAudience, urgency, language);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", defaultModel);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", 
                "You are a professional university communications officer. Create clear, engaging, and informative announcements that are appropriate for the target audience and urgency level."));
            messages.add(Map.of("role", "user", "content", prompt));
            
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 1000);
            requestBody.put("temperature", 0.5);

            return callPawaAI("/chat/completions", requestBody);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate announcement: " + e.getMessage(), e);
        }
    }

    public String analyzeStudentData(String query) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", defaultModel);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", 
                "You are a data analyst for SUZA. Analyze student data and provide insights in a clear, actionable format. Focus on trends, patterns, and recommendations."));
            messages.add(Map.of("role", "user", "content", query));
            
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 1200);
            requestBody.put("temperature", 0.3);

            return callPawaAI("/chat/completions", requestBody);
        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze student data: " + e.getMessage(), e);
        }
    }

    public String processDocument(String documentContent, String documentType) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", defaultModel);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", 
                "You are a document processing assistant for SUZA. Process and analyze " + documentType + " documents. Extract key information, identify issues, and provide recommendations."));
            messages.add(Map.of("role", "user", "content", documentContent));
            
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 1500);
            requestBody.put("temperature", 0.4);

            return callPawaAI("/chat/completions", requestBody);
        } catch (Exception e) {
            throw new RuntimeException("Failed to process document: " + e.getMessage(), e);
        }
    }

    public boolean checkServiceHealth() {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                pawaAIBaseUrl + "/health",
                HttpMethod.GET,
                entity,
                String.class
            );
            
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            return false;
        }
    }

    public List<String> getAvailableModels() {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                pawaAIBaseUrl + "/models",
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("data")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> models = (List<Map<String, Object>>) responseBody.get("data");
                if (models != null) {
                    return models.stream()
                        .map(model -> (String) model.get("id"))
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
                }
            }
            
            return Arrays.asList("pawa-min-alpha", "pawa-min-beta", "pawa-min-pro", "pawa-min-ultimate");
        } catch (Exception e) {
            // Return default models if API call fails
            return Arrays.asList("pawa-min-alpha", "pawa-min-beta", "pawa-min-pro", "pawa-min-ultimate");
        }
    }

    public boolean testConnection() {
        try {
            return checkServiceHealth();
        } catch (Exception e) {
            return false;
        }
    }

    private String callPawaAI(String endpoint, Map<String, Object> requestBody) {
        try {
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                pawaAIBaseUrl + endpoint,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("choices")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    if (choice != null && choice.containsKey("message")) {
                        Map<String, Object> message = (Map<String, Object>) choice.get("message");
                        if (message != null) {
                            Object content = message.get("content");
                            return content != null ? content.toString() : "No content available";
                        }
                    }
                }
            }
            
            throw new RuntimeException("Invalid response format from Pawa AI");
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new RuntimeException("Pawa AI API error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Pawa AI: " + e.getMessage(), e);
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + pawaAIApiKey);
        return headers;
    }

    private String buildCVEnhancementPrompt(String currentCV, String targetIndustry, String experienceLevel, String jobDescription) {
        return String.format("""
            Please enhance this CV for better effectiveness:
            
            Current CV:
            %s
            
            Target Industry: %s
            Experience Level: %s
            Job Description: %s
            
            Please provide:
            1. Specific improvements and suggestions
            2. Better wording and phrasing
            3. Skills and achievements to highlight
            4. Format and structure recommendations
            5. ATS optimization tips
            
            Make the response practical and actionable.
            """, currentCV, targetIndustry, experienceLevel, jobDescription.isEmpty() ? "Not provided" : jobDescription);
    }

    private String buildAnnouncementPrompt(List<String> keyPoints, String targetAudience, String urgency, String language) {
        String urgencyText = switch (urgency.toLowerCase()) {
            case "low" -> "standard";
            case "high" -> "urgent";
            default -> "important";
        };

        String keyPointsText = keyPoints.stream()
            .map(point -> "- " + point)
            .collect(Collectors.joining("\n"));

        return String.format("""
            Create a %s announcement for %s:
            
            Key Points:
            %s
            
            Requirements:
            - Language: %s
            - Tone: Professional but accessible
            - Include relevant contact information
            - Make it engaging and clear
            - Format for easy reading
            
            Generate a complete announcement ready for publication.
            """, urgencyText, targetAudience, keyPointsText, 
            language.equals("sw") ? "Swahili" : "English");
    }
} 