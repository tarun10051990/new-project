package com.jiomart.bulk.service;

import com.jiomart.bulk.model.BulkOrder;
import com.jiomart.bulk.model.CartItem;
import com.jiomart.bulk.repository.BulkOrderRepository;
import com.jiomart.bulk.repository.CartItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class OrderService {
    private final BulkOrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;

    public OrderService(BulkOrderRepository orderRepository, CartItemRepository cartItemRepository) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Transactional
    public BulkOrder createOrder(BulkOrder order, List<CartItem> items) {
        BulkOrder saved = orderRepository.save(order);
        for (CartItem item : items) {
            item.setOrderId(saved.getId());
            cartItemRepository.save(item);
        }
        return saved;
    }

    public List<BulkOrder> getByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<CartItem> getCartItems(Long orderId) {
        return cartItemRepository.findByOrderId(orderId);
    }

    public Map<String, Object> getStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", orderRepository.countByUserId(userId));
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        stats.put("todaysOrders", orderRepository.countByUserIdAndCreatedAtAfter(userId, startOfDay));
        stats.put("totalSpent", orderRepository.sumTotalAmountByUserId(userId));
        return stats;
    }
}
