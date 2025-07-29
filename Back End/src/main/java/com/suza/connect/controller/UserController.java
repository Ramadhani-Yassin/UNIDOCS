package com.suza.connect.controller;

import com.suza.connect.model.User;
import com.suza.connect.service.UserService;
import com.suza.connect.service.JwtService;
import com.suza.connect.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private PasswordResetService passwordResetService;

    public UserController(UserService userService) {
        this.userService = userService;
        System.out.println("UserController loaded!");
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "User registered successfully",
                            "userId", registeredUser.getId()
                    ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()
                    ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            // Find user by email only
            Optional<User> userOpt = userService.findByEmail(loginRequest.getEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Allow these roles to login (admins and students)
                List<String> allowedRoles = List.of("admin", "hos", "vc", "dsc", "dst");
                if (!allowedRoles.contains(user.getRole().toLowerCase())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "You are not allowed to login here."));
                }
                if ("suspended".equalsIgnoreCase(user.getStatus())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Account suspended, please contact Admin"));
                }
                boolean valid = userService.validateUser(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                );
                if (valid) {
                    String token = jwtService.generateToken(user.getEmail(), user.getRole(), user.getId());
                    String refreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getRole(), user.getId());
                    
                    return ResponseEntity.ok(Map.of(
                            "message", "Login successful",
                            "user", user,
                            "token", token,
                            "refreshToken", refreshToken
                    ));
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String refreshToken = request.get("refreshToken");
            if (refreshToken == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Refresh token is required"));
            }

            // Validate refresh token
            if (jwtService.isTokenExpired(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Refresh token has expired"));
            }

            String email = jwtService.extractEmail(refreshToken);
            String role = jwtService.extractRole(refreshToken);
            Long userId = jwtService.extractUserId(refreshToken);

            // Generate new access token
            String newToken = jwtService.generateToken(email, role, userId);
            String newRefreshToken = jwtService.generateRefreshToken(email, role, userId);

            return ResponseEntity.ok(Map.of(
                    "token", newToken,
                    "refreshToken", newRefreshToken
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid refresh token"));
        }
    }

    @PostMapping("/student-login")
    public ResponseEntity<?> studentLogin(@RequestBody User loginRequest) {
        try {
            Optional<User> userOpt = userService.findByEmail(loginRequest.getEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                System.out.println("ROLE: " + user.getRole() + ", STATUS: " + user.getStatus());
                System.out.println("DB PASSWORD: " + user.getPassword());
                System.out.println("REQ PASSWORD: " + loginRequest.getPassword());
                if (!"student".equalsIgnoreCase(user.getRole())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Only students can login here."));
                }
                if ("suspended".equalsIgnoreCase(user.getStatus())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Account suspended, please contact Admin"));
                }
                boolean valid = userService.validateUser(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                );
                System.out.println("PASSWORD VALID: " + valid);
                if (valid) {
                    String token = jwtService.generateToken(user.getEmail(), user.getRole(), user.getId());
                    String refreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getRole(), user.getId());
                    
                    return ResponseEntity.ok(Map.of(
                            "message", "Login successful",
                            "user", user,
                            "token", token,
                            "refreshToken", refreshToken
                    ));
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(Map.of(
                        "firstName", user.getFirstName(),
                        "lastName", user.getLastName(),
                        "email", user.getEmail()
                )))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found")));
    }

    @PostMapping("/migrate-passwords")
    public ResponseEntity<?> migratePasswords() {
        userService.migratePlainTextPasswords();
        return ResponseEntity.ok(Map.of("message", "Password migration completed"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            // Require email and currentPassword in the request
            String email = (String) updates.get("email");
            String currentPassword = (String) updates.get("currentPassword");
            if (email == null || currentPassword == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Email and current password are required."));
            }

            boolean valid = userService.validateUser(email, currentPassword);
            if (!valid) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid email or password."));
            }

            User updatedUser = userService.updateUser(id, updates);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.ok(userService.getUsersByRole("student"));
    }

    @GetMapping("/count-students")
    public ResponseEntity<Long> getStudentCount() {
        return ResponseEntity.ok(userService.countByRole("student"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserById(@PathVariable Long id) {
        userService.deleteUserById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateStudent(@PathVariable Long id) {
        User updated = userService.updateUserStatus(id, "active");
        return ResponseEntity.ok(Map.of("message", "Student activated", "user", updated));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateStudent(@PathVariable Long id) {
        User updated = userService.updateUserStatus(id, "suspended");
        return ResponseEntity.ok(Map.of("message", "Student suspended", "user", updated));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudentById(@PathVariable Long id) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isPresent() && "student".equalsIgnoreCase(userOpt.get().getRole())) {
            userService.deleteUserById(id);
            return ResponseEntity.ok(Map.of("message", "Student deleted"));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "User is not a student or does not exist"));
    }

    // Password Reset Endpoints

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Email is required"));
            }

            passwordResetService.initiatePasswordReset(email.trim());
            
            // Always return success to prevent email enumeration
            return ResponseEntity.ok(Map.of(
                    "message", "If an account with this email exists, a password reset link has been sent.",
                    "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process password reset request"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String resetToken = request.get("resetToken");
            String newPassword = request.get("newPassword");
            String confirmPassword = request.get("confirmPassword");

            if (resetToken == null || newPassword == null || confirmPassword == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Reset token, new password, and confirm password are required"));
            }

            if (!newPassword.equals(confirmPassword)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Passwords do not match"));
            }

            boolean success = passwordResetService.resetPassword(resetToken, newPassword);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                        "message", "Password reset successfully. You can now login with your new password.",
                        "success", true
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid or expired reset token, or password does not meet requirements"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reset password"));
        }
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        try {
            boolean isValid = passwordResetService.isValidResetToken(token);
            
            if (isValid) {
                return ResponseEntity.ok(Map.of(
                        "valid", true,
                        "message", "Reset token is valid"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                                "valid", false,
                                "error", "Invalid or expired reset token"
                        ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to validate reset token"));
        }
    }

    @GetMapping("/password-requirements")
    public ResponseEntity<?> getPasswordRequirements() {
        return ResponseEntity.ok(Map.of(
                "requirements", passwordResetService.getPasswordRequirements()
        ));
    }
}
