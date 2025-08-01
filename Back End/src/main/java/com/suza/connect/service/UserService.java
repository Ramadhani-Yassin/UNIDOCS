package com.suza.connect.service;

import com.suza.connect.model.User;
import com.suza.connect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public boolean validateUser(String email, String password) {
        return userRepository.findByEmail(email)
                .map(user -> passwordEncoder.matches(password, user.getPassword()))
                .orElse(false);
    }

    public boolean validateUserByRole(String email, String password, String role) {
        return userRepository.findByEmailAndRole(email, role)
                .map(user -> passwordEncoder.matches(password, user.getPassword()) && !"suspended".equalsIgnoreCase(user.getStatus()))
                .orElse(false);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
    return userRepository.findById(id);
    }


    public Optional<User> getUserByEmailAndRole(String email, String role) {
        return userRepository.findByEmailAndRole(email, role);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

    public Long countByRole(String role) {
        return (long) userRepository.findByRole(role).size();
    }

    public void deleteUser(String email) {
        userRepository.findByEmail(email).ifPresent(userRepository::delete);
    }

    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }

    public void migratePlainTextPasswords() {
        List<User> users = userRepository.findAll();
        users.forEach(user -> {
            if (!user.getPassword().startsWith("$2a$")) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
                userRepository.save(user);
            }
        });
    }

    public User updateUser(Long id, Map<String, Object> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("firstName")) {
            user.setFirstName((String) updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            user.setLastName((String) updates.get("lastName"));
        }
        if (updates.containsKey("email")) {
            user.setEmail((String) updates.get("email"));
        }
        // Optionally check currentPassword here if needed

        return userRepository.save(user);
    }

    public User updateUserStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        return userRepository.save(user);
    }
}
