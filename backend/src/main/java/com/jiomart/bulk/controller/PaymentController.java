package com.jiomart.bulk.controller;

import com.jiomart.bulk.model.Payment;
import com.jiomart.bulk.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody Map<String, Object> body) {
        Long orderId = ((Number) body.get("orderId")).longValue();
        Long userId = ((Number) body.get("userId")).longValue();
        Double amount = ((Number) body.get("amount")).doubleValue();

        Payment payment = paymentService.createRazorpayOrder(orderId, userId, amount);
        return ResponseEntity.ok(Map.of(
            "paymentId", payment.getId(),
            "razorpayOrderId", payment.getRazorpayOrderId(),
            "amount", payment.getAmount(),
            "currency", payment.getCurrency(),
            "status", payment.getStatus()
        ));
    }

    @PostMapping("/verify-razorpay")
    public ResponseEntity<?> verifyRazorpay(@RequestBody Map<String, String> body) {
        String razorpayOrderId = body.get("razorpayOrderId");
        String razorpayPaymentId = body.get("razorpayPaymentId");

        try {
            Payment payment = paymentService.confirmRazorpayPayment(razorpayOrderId, razorpayPaymentId);
            return ResponseEntity.ok(Map.of(
                "message", "Payment verified successfully",
                "paymentId", payment.getId(),
                "status", payment.getStatus()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/upi")
    public ResponseEntity<?> processUpi(@RequestBody Map<String, Object> body) {
        Long orderId = ((Number) body.get("orderId")).longValue();
        Long userId = ((Number) body.get("userId")).longValue();
        Double amount = ((Number) body.get("amount")).doubleValue();
        String upiTransactionId = (String) body.get("upiTransactionId");

        Payment payment = paymentService.processUpiPayment(orderId, userId, amount, upiTransactionId);
        return ResponseEntity.ok(Map.of(
            "message", "UPI payment processed",
            "paymentId", payment.getId(),
            "status", payment.getStatus()
        ));
    }

    @GetMapping("/user/{userId}")
    public List<Payment> getUserPayments(@PathVariable Long userId) {
        return paymentService.getByUserId(userId);
    }

    @GetMapping("/order/{orderId}")
    public List<Payment> getOrderPayments(@PathVariable Long orderId) {
        return paymentService.getByOrderId(orderId);
    }

    @PostMapping("/{paymentId}/fail")
    public ResponseEntity<?> failPayment(@PathVariable Long paymentId) {
        try {
            Payment payment = paymentService.failPayment(paymentId);
            return ResponseEntity.ok(Map.of("message", "Payment marked as failed", "status", payment.getStatus()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
