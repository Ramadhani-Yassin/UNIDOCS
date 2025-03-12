package com.suza.connect.service;

import com.suza.connect.model.Admin;
import com.suza.connect.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register a new admin with hashed password
    public void registerAdmin(Admin admin) {
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        adminRepository.save(admin);
    }

    // Validate admin credentials
    public boolean validateAdmin(String email, String rawPassword) {
        Optional<Admin> optionalAdmin = adminRepository.findByEmail(email);

        if (optionalAdmin.isEmpty()) {
            return false; // No admin found
        }

        Admin admin = optionalAdmin.get(); // Extract Admin safely
        return passwordEncoder.matches(rawPassword, admin.getPassword());
    }
}
