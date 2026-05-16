package com.jiomart.bulk.service;

import com.jiomart.bulk.model.BulkOrder;
import com.jiomart.bulk.model.CartItem;
import com.jiomart.bulk.model.CreditTransaction;
import com.jiomart.bulk.model.OrderTracking;
import com.jiomart.bulk.model.User;
import com.jiomart.bulk.repository.BulkOrderRepository;
import com.jiomart.bulk.repository.CartItemRepository;
import com.jiomart.bulk.repository.OrderTrackingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class OrderService {
    private final BulkOrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderTrackingRepository trackingRepository;
    private final UserService userService;
    private final CreditService creditService;

    public OrderService(BulkOrderRepository orderRepository, CartItemRepository cartItemRepository,
                        OrderTrackingRepository trackingRepository, UserService userService,
                        CreditService creditService) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.trackingRepository = trackingRepository;
        this.userService = userService;
        this.creditService = creditService;
    }

    @Transactional
    public BulkOrder createOrder(BulkOrder order, List<CartItem> items) {
        User user = userService.findById(order.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getCredits() < 1.0) {
            throw new RuntimeException("Insufficient credits. Contact admin to add more credits.");
        }

        BulkOrder saved = orderRepository.save(order);
        for (CartItem item : items) {
            item.setOrderId(saved.getId());
            cartItemRepository.save(item);
        }

        user.setCredits(user.getCredits() - 1.0);
        userService.save(user);

        CreditTransaction tx = new CreditTransaction();
        tx.setUserId(user.getId());
        tx.setType("deduct");
        tx.setAmount(1.0);
        tx.setDescription("Order #" + saved.getId() + " placed");
        tx.setBalanceAfter(user.getCredits());
        creditService.addTransaction(tx);

        OrderTracking tracking = new OrderTracking();
        tracking.setOrderId(saved.getId());
        tracking.setUserId(saved.getUserId());
        tracking.setAccountId(saved.getAccountId());
        tracking.setDeliveryStatus("Processing");
        tracking.setLastSyncedAt(LocalDateTime.now());
        String productSummary = items.stream()
                .filter(i -> i.getProductUrl() != null)
                .map(i -> i.getProductUrl().substring(Math.max(0, i.getProductUrl().lastIndexOf('/') + 1)))
                .reduce((a, b) -> a + ", " + b)
                .orElse("Unknown product");
        tracking.setProductName(productSummary);
        tracking.setOrderAmount(saved.getTotalAmount());
        tracking.setJioOrderId("JIO-" + saved.getId() + "-" + System.currentTimeMillis() % 100000);
        trackingRepository.save(tracking);

        return saved;
    }

    public List<BulkOrder> getByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<BulkOrder> getByUserIdOrdered(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<BulkOrder> getByAccountId(Long accountId) {
        return orderRepository.findByAccountIdOrderByCreatedAtDesc(accountId);
    }

    public List<CartItem> getCartItems(Long orderId) {
        return cartItemRepository.findByOrderId(orderId);
    }

    public Optional<BulkOrder> findById(Long id) {
        return orderRepository.findById(id);
    }

    @Transactional
    public BulkOrder cancelOrder(Long orderId) {
        BulkOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus("Cancelled");
        orderRepository.save(order);

        List<OrderTracking> trackings = trackingRepository.findByOrderId(orderId);
        for (OrderTracking t : trackings) {
            t.setDeliveryStatus("Cancelled");
            t.setUpdatedAt(LocalDateTime.now());
            trackingRepository.save(t);
        }

        User user = userService.findById(order.getUserId()).orElse(null);
        if (user != null) {
            user.setCredits(user.getCredits() + 1.0);
            userService.save(user);

            CreditTransaction tx = new CreditTransaction();
            tx.setUserId(user.getId());
            tx.setType("refund");
            tx.setAmount(1.0);
            tx.setDescription("Order #" + orderId + " cancelled - credit refunded");
            tx.setBalanceAfter(user.getCredits());
            creditService.addTransaction(tx);
        }

        return order;
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
