package com.suza.connect.controller;

import com.suza.connect.model.User;
import com.suza.connect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "User registered successfully",
                            "userId", registeredUser.getId()
                    ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            boolean valid = userService.validateUserByRole(
                    loginRequest.getEmail(),
                    loginRequest.getPassword(),
                    loginRequest.getRole()
            );
            if (valid) {
                return ResponseEntity.ok(Map.of(
                        "message", "Login successful",
                        "user", userService.findByEmail(loginRequest.getEmail()).orElse(null)
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials for role ❌: " + loginRequest.getRole()));
            }
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
}
