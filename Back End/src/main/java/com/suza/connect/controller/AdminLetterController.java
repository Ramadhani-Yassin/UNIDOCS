package com.suza.connect.controller;

import com.suza.connect.service.LetterRequestService;
import com.suza.connect.dto.LetterRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/letters")
@RequiredArgsConstructor
public class AdminLetterController {
    private final LetterRequestService letterRequestService;

    @GetMapping
    public List<LetterRequestDTO> getAllRequests() {
        return letterRequestService.findAll();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String comment = body.get("comment");
        letterRequestService.updateStatus(id, status, comment);
        return ResponseEntity.ok().build();
    }
}
