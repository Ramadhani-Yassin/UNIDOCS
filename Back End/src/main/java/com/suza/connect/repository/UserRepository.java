package com.suza.connect.repository;

import com.suza.connect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndRole(String email, String role);
    boolean existsByEmail(String email);
    List<User> findByRole(String role); // For filtering by 'admin' or 'student'
    
    // Password reset methods
    Optional<User> findByResetToken(String resetToken);
    Optional<User> findByResetTokenAndResetTokenExpiryAfter(String resetToken, java.time.LocalDateTime now);
}
