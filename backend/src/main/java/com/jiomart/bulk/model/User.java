package com.jiomart.bulk.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String accessKey;

    @Column(nullable = false)
    private String displayName;

    @Column(nullable = false)
    private Double credits = 0.0;

    @Column(nullable = false)
    private String role = "PREMIUM";

    private String email;
    private String status = "Active";
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String accessKey, String displayName, Double credits) {
        this.accessKey = accessKey;
        this.displayName = displayName;
        this.credits = credits;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAccessKey() { return accessKey; }
    public void setAccessKey(String accessKey) { this.accessKey = accessKey; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public Double getCredits() { return credits; }
    public void setCredits(Double credits) { this.credits = credits; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
