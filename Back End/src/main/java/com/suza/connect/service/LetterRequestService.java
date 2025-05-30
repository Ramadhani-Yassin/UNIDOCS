package com.suza.connect.service;

import com.suza.connect.dto.LetterRequestDTO;
import com.suza.connect.model.LetterRequest;
import com.suza.connect.model.User;
import com.suza.connect.repository.LetterRequestRepository;
import com.suza.connect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LetterRequestService {

    private final LetterRequestRepository letterRequestRepository;
    private final UserRepository userRepository;

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

    public List<LetterRequest> findRecentByEmail(String email, int limit) {
        return letterRequestRepository.findByEmailOrderByRequestDateDesc(email, 
                PageRequest.of(0, limit));
    }

    public Long countByStudentEmail(String email) {
        return letterRequestRepository.countByEmail(email);
    }
}