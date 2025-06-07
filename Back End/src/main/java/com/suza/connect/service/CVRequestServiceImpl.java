package com.suza.connect.service;

import com.suza.connect.dto.CVRequestDTO;
import com.suza.connect.model.CVRequest;
import com.suza.connect.repository.CVRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CVRequestServiceImpl implements CVRequestService {

    private final CVRequestRepository cvRequestRepository;

    @Autowired
    public CVRequestServiceImpl(CVRequestRepository cvRequestRepository) {
        this.cvRequestRepository = cvRequestRepository;
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
        request.setSubmissionDate(java.time.LocalDateTime.now()); // <-- ADD THIS LINE
        return cvRequestRepository.save(request);
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
