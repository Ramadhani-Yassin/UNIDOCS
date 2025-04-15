package com.suza.connect.model;

import jakarta.persistence.*;

@Entity
@Table(
    name = "admin",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")  // Ensures email is unique in the database
    }
)
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)  // Makes email non-null and unique
    private String email;
    
    @Column(nullable = false)  // Makes password non-null (optional)
    private String password;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}