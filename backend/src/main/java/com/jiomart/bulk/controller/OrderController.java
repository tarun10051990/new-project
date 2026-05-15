package com.jiomart.bulk.controller;

import com.jiomart.bulk.model.BulkOrder;
import com.jiomart.bulk.model.CartItem;
import com.jiomart.bulk.service.OrderService;
import com.jiomart.bulk.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final AccountService accountService;

    public OrderController(OrderService orderService, AccountService accountService) {
        this.orderService = orderService;
        this.accountService = accountService;
    }

    @GetMapping("/{userId}")
    public List<BulkOrder> getOrders(@PathVariable Long userId) {
        return orderService.getByUserId(userId);
    }

    @GetMapping("/{userId}/stats")
    public Map<String, Object> getStats(@PathVariable Long userId) {
        Map<String, Object> stats = orderService.getStats(userId);
        stats.put("totalAccounts", accountService.countByUserId(userId));
        return stats;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        BulkOrder order = new BulkOrder();
        order.setUserId(((Number) body.get("userId")).longValue());
        order.setAddressId(body.get("addressId") != null ? ((Number) body.get("addressId")).longValue() : null);
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
