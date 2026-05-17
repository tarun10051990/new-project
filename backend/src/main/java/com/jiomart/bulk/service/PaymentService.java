package com.jiomart.bulk.service;

import com.jiomart.bulk.model.Payment;
import com.jiomart.bulk.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public Payment createRazorpayOrder(Long orderId, Long userId, Double amount) {
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setUserId(userId);
        payment.setAmount(amount);
        payment.setMethod("RAZORPAY");
        payment.setRazorpayOrderId("rzp_order_" + System.currentTimeMillis());
        payment.setStatus("PENDING");
        return paymentRepository.save(payment);
    }

    public Payment confirmRazorpayPayment(String razorpayOrderId, String razorpayPaymentId) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setStatus("COMPLETED");
        payment.setUpdatedAt(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    public Payment processUpiPayment(Long orderId, Long userId, Double amount, String upiTransactionId) {
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setUserId(userId);
        payment.setAmount(amount);
        payment.setMethod("UPI");
        payment.setUpiTransactionId(upiTransactionId);
        payment.setStatus("COMPLETED");
        return paymentRepository.save(payment);
    }

    public List<Payment> getByUserId(Long userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Payment> getByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    public Optional<Payment> findById(Long id) {
        return paymentRepository.findById(id);
    }

    public Payment failPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setStatus("FAILED");
        payment.setUpdatedAt(LocalDateTime.now());
        return paymentRepository.save(payment);
    }
}
