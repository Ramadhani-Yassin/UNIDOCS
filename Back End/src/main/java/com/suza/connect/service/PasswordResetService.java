package com.suza.connect.service;

import com.suza.connect.model.User;
import com.suza.connect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    /**
     * Initiate password reset process
     */
    public boolean initiatePasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return false; // Don't reveal if email exists or not
        }

        User user = userOpt.get();
        
        // Generate reset token
        String resetToken = generateResetToken();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiry = now.plusHours(24); // 24 hours expiry

        // Update user with reset token
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(expiry);
        user.setResetTokenCreated(now);
        userRepository.save(user);

        // Send reset email
        sendPasswordResetEmail(user, resetToken);

        return true;
    }

    /**
     * Reset password using token
     */
    public boolean resetPassword(String resetToken, String newPassword) {
        Optional<User> userOpt = userRepository.findByResetTokenAndResetTokenExpiryAfter(
            resetToken, LocalDateTime.now());

        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();

        // Validate password strength
        if (!isPasswordValid(newPassword)) {
            return false;
        }

        // Update password and clear reset token
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setResetTokenCreated(null);
        userRepository.save(user);

        return true;
    }

    /**
     * Validate reset token
     */
    public boolean isValidResetToken(String resetToken) {
        return userRepository.findByResetTokenAndResetTokenExpiryAfter(
            resetToken, LocalDateTime.now()).isPresent();
    }

    /**
     * Get user by reset token
     */
    public Optional<User> getUserByResetToken(String resetToken) {
        return userRepository.findByResetTokenAndResetTokenExpiryAfter(
            resetToken, LocalDateTime.now());
    }

    /**
     * Generate secure reset token
     */
    private String generateResetToken() {
        return UUID.randomUUID().toString();
    }

    /**
     * Validate password strength
     */
    private boolean isPasswordValid(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }

        // Check for at least one uppercase letter
        boolean hasUpperCase = password.matches(".*[A-Z].*");
        // Check for at least one lowercase letter
        boolean hasLowerCase = password.matches(".*[a-z].*");
        // Check for at least one digit
        boolean hasDigit = password.matches(".*\\d.*");
        // Check for at least one special character
        boolean hasSpecial = password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*");

        return hasUpperCase && hasLowerCase && hasDigit && hasSpecial;
    }

    /**
     * Send password reset email
     */
    private void sendPasswordResetEmail(User user, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject("UNIDOCS - Password Reset Request");
        
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        
        String emailBody = String.format(
            "Dear %s %s,\n\n" +
            "You requested a password reset for your UNIDOCS account.\n\n" +
            "Click the link below to reset your password:\n" +
            "%s\n\n" +
            "This link will expire in 24 hours.\n\n" +
            "If you didn't request this reset, please ignore this email.\n\n" +
            "Best regards,\n" +
            "UNIDOCS Team",
            user.getFirstName(), user.getLastName(), resetLink
        );
        
        message.setText(emailBody);
        mailSender.send(message);
    }

    /**
     * Get password requirements message
     */
    public String getPasswordRequirements() {
        return "Password must be at least 8 characters long and contain:\n" +
               "• At least one uppercase letter (A-Z)\n" +
               "• At least one lowercase letter (a-z)\n" +
               "• At least one digit (0-9)\n" +
               "• At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)";
    }
} 