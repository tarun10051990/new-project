package com.jiomart.bulk.controller;

import com.jiomart.bulk.model.OrderTracking;
import com.jiomart.bulk.service.TrackingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tracking")
public class TrackingController {
    private final TrackingService trackingService;

    public TrackingController(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @GetMapping("/{userId}")
    public List<OrderTracking> getTrackingByUser(@PathVariable Long userId) {
        return trackingService.getByUserId(userId);
    }

    @GetMapping("/{userId}/active")
    public List<OrderTracking> getActiveTracking(@PathVariable Long userId) {
        return trackingService.getActiveByUserId(userId);
    }

    @GetMapping("/account/{accountId}")
    public List<OrderTracking> getTrackingByAccount(@PathVariable Long accountId) {
        return trackingService.getByAccountId(accountId);
    }

    @GetMapping("/order/{orderId}")
    public List<OrderTracking> getTrackingByOrder(@PathVariable Long orderId) {
        return trackingService.getByOrderId(orderId);
    }

    @PostMapping("/{trackingId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long trackingId) {
        try {
            OrderTracking cancelled = trackingService.cancelOrder(trackingId);
            return ResponseEntity.ok(Map.of("message", "Order cancelled", "tracking", cancelled));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
