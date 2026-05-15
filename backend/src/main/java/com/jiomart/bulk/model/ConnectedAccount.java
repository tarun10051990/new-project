package com.jiomart.bulk.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "connected_accounts")
public class ConnectedAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String mobileNumber;
    private String state = "Active";
    private String liveActivity = "Idle";
    private String accessToken;
    private String refreshToken;
    private Integer totalOrders = 0;
    private LocalDateTime createdAt = LocalDateTime.now();

    public ConnectedAccount() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getLiveActivity() { return liveActivity; }
    public void setLiveActivity(String liveActivity) { this.liveActivity = liveActivity; }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public Integer getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
