package com.suza.connect.service;

import com.suza.connect.dto.LetterRequestDTO;
import com.suza.connect.model.LetterRequest;
import com.suza.connect.model.User;
import com.suza.connect.repository.LetterRequestRepository;
import com.suza.connect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

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
    private final EmailService emailService; // Inject EmailService

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

        return letterRequestRepository.save(request);
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

        // Send email notification to student
        String subject = "Update on Your Letter Request";
        String text = String.format(
            "Dear %s,\n\nYour letter request (%s) has been %s.\n\nComment: %s\n\nRegards,\nSUZA Admin",
            req.getFullName(),
            req.getLetterType(),
            status,
            comment == null ? "No comment" : comment
        );
        emailService.sendEmail(req.getEmail(), subject, text);
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
}