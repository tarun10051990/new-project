package com.jiomart.bulk.repository;

import com.jiomart.bulk.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByOrderId(Long orderId);
    void deleteByOrderId(Long orderId);
}
