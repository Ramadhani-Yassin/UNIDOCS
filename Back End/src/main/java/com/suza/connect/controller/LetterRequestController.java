package com.suza.connect.controller;

import com.suza.connect.dto.LetterRequestDTO;
import com.suza.connect.model.LetterRequest;
import com.suza.connect.service.LetterRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/letter-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class LetterRequestController {

    private final LetterRequestService letterRequestService;

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
}