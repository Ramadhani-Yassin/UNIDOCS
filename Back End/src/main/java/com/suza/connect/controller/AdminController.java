package com.suza.connect.controller;

import com.suza.connect.model.Admin;
import com.suza.connect.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException; 
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/register")
public ResponseEntity<Map<String, Object>> register(@RequestBody Admin admin) {
    Map<String, Object> response = new HashMap<>();
    
    try {
        adminService.registerAdmin(admin);
        response.put("message", "Admin registered successfully");
        return ResponseEntity.ok(response);
    } catch (DataIntegrityViolationException e) {
        response.put("error", "Email already registered");
        return ResponseEntity.status(400).body(response);
    } catch (Exception e) {
        response.put("error", "Registration failed");
        return ResponseEntity.status(500).body(response);
    }
}

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Admin admin) {
        boolean isValid = adminService.validateAdmin(admin.getEmail(), admin.getPassword());
        
        Map<String, Object> response = new HashMap<>();
        if (isValid) {
            response.put("message", "Admin login successful");
            return ResponseEntity.ok(response);
        } else {
            response.put("error", "Invalid admin credentials");
            return ResponseEntity.status(401).body(response);
        }
    }
}
