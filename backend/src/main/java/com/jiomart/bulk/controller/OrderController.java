package com.jiomart.bulk.controller;

import com.jiomart.bulk.model.BulkOrder;
import com.jiomart.bulk.model.CartItem;
import com.jiomart.bulk.model.User;
import com.jiomart.bulk.service.OrderService;
import com.jiomart.bulk.service.AccountService;
import com.jiomart.bulk.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final AccountService accountService;
    private final UserService userService;

    public OrderController(OrderService orderService, AccountService accountService, UserService userService) {
        this.orderService = orderService;
        this.accountService = accountService;
        this.userService = userService;
    }

    @GetMapping("/{userId}")
    public List<BulkOrder> getOrders(@PathVariable Long userId) {
        return orderService.getByUserIdOrdered(userId);
    }

    @GetMapping("/{userId}/stats")
    public Map<String, Object> getStats(@PathVariable Long userId) {
        Map<String, Object> stats = orderService.getStats(userId);
        stats.put("totalAccounts", accountService.countByUserId(userId));
        return stats;
    }

    @GetMapping("/account/{accountId}")
    public List<BulkOrder> getOrdersByAccount(@PathVariable Long accountId) {
        return orderService.getByAccountId(accountId);
    }

    @GetMapping("/detail/{orderId}")
    public ResponseEntity<?> getOrderDetail(@PathVariable Long orderId) {
        return orderService.findById(orderId)
                .map(order -> {
                    List<CartItem> items = orderService.getCartItems(orderId);
                    return ResponseEntity.ok(Map.of("order", order, "items", items));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            BulkOrder cancelled = orderService.cancelOrder(orderId);
            return ResponseEntity.ok(Map.of("message", "Order cancelled", "order", cancelled));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        Long userId = ((Number) body.get("userId")).longValue();
        User user = userService.findById(userId).orElse(null);
        if (user != null && "DEMO".equals(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "Demo users cannot place orders. Upgrade to Premium."));
        }

        BulkOrder order = new BulkOrder();
        order.setUserId(userId);
        order.setAddressId(body.get("addressId") != null ? ((Number) body.get("addressId")).longValue() : null);
        order.setAccountId(body.get("accountId") != null ? ((Number) body.get("accountId")).longValue() : null);
        order.setRepeatCount(body.get("repeatCount") != null ? ((Number) body.get("repeatCount")).intValue() : 1);
        order.setCouponCode((String) body.get("couponCode"));
        order.setExpectedPrice(body.get("expectedPrice") != null ? ((Number) body.get("expectedPrice")).doubleValue() : null);
        order.setRandomizeMobile(body.get("randomizeMobile") != null ? (Boolean) body.get("randomizeMobile") : true);
        order.setStatus("Processing");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("cartItems");
        List<CartItem> cartItems = new java.util.ArrayList<>();
        if (items != null) {
            for (Map<String, Object> item : items) {
                CartItem ci = new CartItem();
                ci.setCartNumber(item.get("cartNumber") != null ? ((Number) item.get("cartNumber")).intValue() : 1);
                ci.setProductUrl((String) item.get("productUrl"));
                ci.setQuantity(item.get("quantity") != null ? ((Number) item.get("quantity")).intValue() : 1);
                ci.setProductName((String) item.get("productName"));
                cartItems.add(ci);
            }
        }

        BulkOrder saved = orderService.createOrder(order, cartItems);
        return ResponseEntity.ok(Map.of("message", "Bulk order started", "orderId", saved.getId()));
    }
}
