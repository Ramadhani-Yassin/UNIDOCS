package com.suza.connect.repository;

import com.suza.connect.model.LetterRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface LetterRequestRepository extends JpaRepository<LetterRequest, UUID> {
    Long countByEmail(String email);
    List<LetterRequest> findByEmailOrderByRequestDateDesc(String email, Pageable pageable);
    List<LetterRequest> findAllByOrderByRequestDateDesc();
    List<LetterRequest> findAllByEmailOrderByRequestDateDesc(String email);
    List<LetterRequest> findByEmailAndRequestDateAfterOrderByRequestDateDesc(String email, LocalDateTime since);
}