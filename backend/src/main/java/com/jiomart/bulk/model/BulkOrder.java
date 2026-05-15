package com.jiomart.bulk.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bulk_orders")
public class BulkOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private Long addressId;
    private Long accountId;
    private String status = "Pending";
    private Integer repeatCount = 1;
    private Double totalAmount = 0.0;
    private String couponCode;
    private Double expectedPrice;
    private Boolean randomizeMobile = true;
    private LocalDateTime createdAt = LocalDateTime.now();

    public BulkOrder() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getAddressId() { return addressId; }
    public void setAddressId(Long addressId) { this.addressId = addressId; }
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getRepeatCount() { return repeatCount; }
    public void setRepeatCount(Integer repeatCount) { this.repeatCount = repeatCount; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
    public Double getExpectedPrice() { return expectedPrice; }
    public void setExpectedPrice(Double expectedPrice) { this.expectedPrice = expectedPrice; }
    public Boolean getRandomizeMobile() { return randomizeMobile; }
    public void setRandomizeMobile(Boolean randomizeMobile) { this.randomizeMobile = randomizeMobile; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
