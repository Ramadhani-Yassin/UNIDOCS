package com.suza.connect.service;

import com.suza.connect.dto.CVRequestDTO;
import com.suza.connect.model.CVRequest;
import java.util.List;
import java.util.Optional;

public interface CVRequestService {
    CVRequest createCVRequest(CVRequestDTO requestDTO);
    Optional<CVRequest> findById(String id);
    List<CVRequest> findRecentByEmail(String email, int limit);
}
