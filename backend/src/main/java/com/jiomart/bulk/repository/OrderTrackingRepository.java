package com.jiomart.bulk.repository;

import com.jiomart.bulk.model.OrderTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderTrackingRepository extends JpaRepository<OrderTracking, Long> {
    List<OrderTracking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<OrderTracking> findByAccountIdOrderByCreatedAtDesc(Long accountId);
    List<OrderTracking> findByOrderId(Long orderId);
    List<OrderTracking> findByUserIdAndDeliveryStatusNotOrderByCreatedAtDesc(Long userId, String excludeStatus);
}
