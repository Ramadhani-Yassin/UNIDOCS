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
        // Map DTO to Entity (add more fields as needed)
        CVRequest request = new CVRequest();
        request.setFullName(requestDTO.getFullName());
        request.setEmail(requestDTO.getEmail());
        request.setPhoneNumber(requestDTO.getPhoneNumber());
        // Set other fields as needed...
        request.setCvTemplate(requestDTO.getTemplateType());
        // Save to DB
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
