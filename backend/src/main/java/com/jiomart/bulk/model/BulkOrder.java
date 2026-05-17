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
    private String paymentMethod = "COD"; // COD, RAZORPAY, UPI
    private Double discountAmount = 0.0;
    private Double loyaltyPointsUsed = 0.0;
    private String giftVoucherCode;
    private Double giftVoucherAmount = 0.0;
    private Double finalAmount = 0.0;
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
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }
    public Double getLoyaltyPointsUsed() { return loyaltyPointsUsed; }
    public void setLoyaltyPointsUsed(Double loyaltyPointsUsed) { this.loyaltyPointsUsed = loyaltyPointsUsed; }
    public String getGiftVoucherCode() { return giftVoucherCode; }
    public void setGiftVoucherCode(String giftVoucherCode) { this.giftVoucherCode = giftVoucherCode; }
    public Double getGiftVoucherAmount() { return giftVoucherAmount; }
    public void setGiftVoucherAmount(Double giftVoucherAmount) { this.giftVoucherAmount = giftVoucherAmount; }
    public Double getFinalAmount() { return finalAmount; }
    public void setFinalAmount(Double finalAmount) { this.finalAmount = finalAmount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
