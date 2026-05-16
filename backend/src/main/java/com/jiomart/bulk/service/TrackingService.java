package com.jiomart.bulk.service;

import com.jiomart.bulk.model.OrderTracking;
import com.jiomart.bulk.repository.OrderTrackingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TrackingService {
    private final OrderTrackingRepository trackingRepository;

    public TrackingService(OrderTrackingRepository trackingRepository) {
        this.trackingRepository = trackingRepository;
    }

    public OrderTracking save(OrderTracking tracking) {
        tracking.setUpdatedAt(LocalDateTime.now());
        return trackingRepository.save(tracking);
    }

    public List<OrderTracking> getByUserId(Long userId) {
        return trackingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<OrderTracking> getActiveByUserId(Long userId) {
        return trackingRepository.findByUserIdAndDeliveryStatusNotOrderByCreatedAtDesc(userId, "Cancelled");
    }

    public List<OrderTracking> getByAccountId(Long accountId) {
        return trackingRepository.findByAccountIdOrderByCreatedAtDesc(accountId);
    }

    public List<OrderTracking> getByOrderId(Long orderId) {
        return trackingRepository.findByOrderId(orderId);
    }

    public Optional<OrderTracking> findById(Long id) {
        return trackingRepository.findById(id);
    }

    public OrderTracking cancelOrder(Long trackingId) {
        OrderTracking tracking = trackingRepository.findById(trackingId)
                .orElseThrow(() -> new RuntimeException("Tracking record not found"));
        tracking.setDeliveryStatus("Cancelled");
        tracking.setUpdatedAt(LocalDateTime.now());
        return trackingRepository.save(tracking);
    }
}
