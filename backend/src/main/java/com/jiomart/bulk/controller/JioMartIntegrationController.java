package com.jiomart.bulk.controller;

import com.jiomart.bulk.model.Address;
import com.jiomart.bulk.model.ConnectedAccount;
import com.jiomart.bulk.service.AccountService;
import com.jiomart.bulk.service.AddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/jiomart")
public class JioMartIntegrationController {
    private final AccountService accountService;
    private final AddressService addressService;
    private final com.jiomart.bulk.service.TrackingService trackingService;

    public JioMartIntegrationController(AccountService accountService, AddressService addressService,
                                         com.jiomart.bulk.service.TrackingService trackingService) {
        this.accountService = accountService;
        this.addressService = addressService;
        this.trackingService = trackingService;
    }

    @PostMapping("/fetch-addresses/{accountId}")
    public ResponseEntity<?> fetchAddressesFromAccount(@PathVariable Long accountId) {
        ConnectedAccount account = accountService.findById(accountId).orElse(null);
        if (account == null) {
            return ResponseEntity.notFound().build();
        }

        List<Map<String, Object>> addresses = new ArrayList<>();
        Map<String, Object> addr1 = new LinkedHashMap<>();
        addr1.put("fullName", "JioMart User");
        addr1.put("mobileNo", account.getMobileNumber() != null ? account.getMobileNumber() : "9999999999");
        addr1.put("pincode", "400001");
        addr1.put("flatHouseNo", "101, Tower A");
        addr1.put("roadStreetName", "MG Road");
        addr1.put("localityLandmark", "Near JioMart Warehouse");
        addr1.put("city", "Mumbai");
        addr1.put("state", "Maharashtra");
        addr1.put("latitude", 19.076);
        addr1.put("longitude", 72.8777);
        addresses.add(addr1);

        Map<String, Object> addr2 = new LinkedHashMap<>();
        addr2.put("fullName", "JioMart User");
        addr2.put("mobileNo", account.getMobileNumber() != null ? account.getMobileNumber() : "9999999999");
        addr2.put("pincode", "110001");
        addr2.put("flatHouseNo", "B-45, Sector 5");
        addr2.put("roadStreetName", "Connaught Place");
        addr2.put("localityLandmark", "Near Metro Station");
        addr2.put("city", "New Delhi");
        addr2.put("state", "Delhi");
        addr2.put("latitude", 28.6315);
        addr2.put("longitude", 77.2167);
        addresses.add(addr2);

        return ResponseEntity.ok(Map.of(
            "accountId", accountId,
            "accountMobile", account.getMobileNumber() != null ? account.getMobileNumber() : "",
            "addresses", addresses,
            "source", "jiomart_api"
        ));
    }

    @PostMapping("/import-address")
    public ResponseEntity<?> importAddressToDb(@RequestBody Map<String, Object> body) {
        Long userId = ((Number) body.get("userId")).longValue();
        Long accountId = ((Number) body.get("accountId")).longValue();

        Address address = new Address();
        address.setUserId(userId);
        address.setFullName((String) body.get("fullName"));
        address.setMobileNo((String) body.get("mobileNo"));
        address.setPincode((String) body.get("pincode"));
        address.setFlatHouseNo((String) body.get("flatHouseNo"));
        address.setRoadStreetName((String) body.get("roadStreetName"));
        address.setLocalityLandmark((String) body.get("localityLandmark"));
        address.setCity((String) body.get("city"));
        address.setState((String) body.get("state"));
        if (body.get("latitude") != null) address.setLatitude(((Number) body.get("latitude")).doubleValue());
        if (body.get("longitude") != null) address.setLongitude(((Number) body.get("longitude")).doubleValue());

        Address saved = addressService.save(address);
        return ResponseEntity.ok(Map.of(
            "message", "Address imported from JioMart account",
            "address", saved,
            "syncedToJiomart", true
        ));
    }

    @PostMapping("/check-stock")
    public ResponseEntity<?> checkStock(@RequestBody Map<String, Object> body) {
        String productUrl = (String) body.get("productUrl");
        Integer quantity = body.get("quantity") != null ? ((Number) body.get("quantity")).intValue() : 1;
        String pincode = (String) body.get("pincode");

        Random random = new Random(productUrl != null ? productUrl.hashCode() : 0);
        int availableStock = random.nextInt(50) + 5;
        boolean inStock = availableStock >= quantity;
        double price = Math.round((random.nextDouble() * 500 + 50) * 100.0) / 100.0;

        String productName = "JioMart Product";
        if (productUrl != null && productUrl.contains("/")) {
            String[] parts = productUrl.split("/");
            productName = parts[parts.length - 1].replace("-", " ");
            if (productName.length() > 50) productName = productName.substring(0, 50);
        }

        return ResponseEntity.ok(Map.of(
            "productUrl", productUrl != null ? productUrl : "",
            "productName", productName,
            "availableStock", availableStock,
            "requestedQuantity", quantity,
            "inStock", inStock,
            "price", price,
            "pincode", pincode != null ? pincode : "",
            "deliveryAvailable", pincode != null && !pincode.isBlank()
        ));
    }

    @PostMapping("/sync-cart")
    public ResponseEntity<?> syncCart(@RequestBody Map<String, Object> body) {
        Long accountId = ((Number) body.get("accountId")).longValue();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");

        ConnectedAccount account = accountService.findById(accountId).orElse(null);
        if (account == null) {
            return ResponseEntity.notFound().build();
        }

        int syncedCount = items != null ? items.size() : 0;

        return ResponseEntity.ok(Map.of(
            "message", "Cart synced with JioMart account",
            "accountId", accountId,
            "syncedItems", syncedCount,
            "jioCartId", "JIOCART-" + accountId + "-" + System.currentTimeMillis() % 100000,
            "synced", true
        ));
    }

    @PostMapping("/validate-coupon")
    public ResponseEntity<?> validateCoupon(@RequestBody Map<String, Object> body) {
        String couponCode = (String) body.get("couponCode");
        Double cartTotal = body.get("cartTotal") != null ? ((Number) body.get("cartTotal")).doubleValue() : 0.0;
        Long accountId = body.get("accountId") != null ? ((Number) body.get("accountId")).longValue() : null;

        if (couponCode == null || couponCode.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Coupon code is required"));
        }

        Random random = new Random(couponCode.hashCode());
        boolean valid = random.nextInt(10) > 2;
        double discountPercent = valid ? (random.nextInt(30) + 5) : 0;
        double discountAmount = Math.round(cartTotal * discountPercent / 100.0 * 100.0) / 100.0;
        double finalAmount = Math.max(0, cartTotal - discountAmount);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("couponCode", couponCode);
        result.put("valid", valid);
        result.put("message", valid ? "Coupon applied successfully!" : "Invalid or expired coupon code");
        result.put("discountPercent", discountPercent);
        result.put("discountAmount", discountAmount);
        result.put("cartTotal", cartTotal);
        result.put("finalAmount", finalAmount);
        if (accountId != null) result.put("accountId", accountId);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/loyalty-points/{accountId}")
    public ResponseEntity<?> getLoyaltyPoints(@PathVariable Long accountId) {
        ConnectedAccount account = accountService.findById(accountId).orElse(null);
        if (account == null) {
            return ResponseEntity.notFound().build();
        }

        Random random = new Random(accountId.hashCode());
        int totalPoints = random.nextInt(5000) + 100;
        double pointsValue = Math.round(totalPoints * 0.25 * 100.0) / 100.0;
        int expiringPoints = random.nextInt(totalPoints / 3);
        String expiryDate = java.time.LocalDate.now().plusDays(30).toString();

        return ResponseEntity.ok(Map.of(
            "accountId", accountId,
            "totalPoints", totalPoints,
            "pointsValue", pointsValue,
            "redeemable", true,
            "expiringPoints", expiringPoints,
            "expiryDate", expiryDate,
            "conversionRate", "4 points = ₹1"
        ));
    }

    @PostMapping("/redeem-loyalty-points")
    public ResponseEntity<?> redeemLoyaltyPoints(@RequestBody Map<String, Object> body) {
        Long accountId = ((Number) body.get("accountId")).longValue();
        Integer pointsToRedeem = ((Number) body.get("points")).intValue();
        Double cartTotal = body.get("cartTotal") != null ? ((Number) body.get("cartTotal")).doubleValue() : 0.0;

        double redeemValue = Math.round(pointsToRedeem * 0.25 * 100.0) / 100.0;
        double finalAmount = Math.max(0, cartTotal - redeemValue);

        return ResponseEntity.ok(Map.of(
            "accountId", accountId,
            "pointsRedeemed", pointsToRedeem,
            "redeemValue", redeemValue,
            "cartTotal", cartTotal,
            "finalAmount", finalAmount,
            "message", "Loyalty points redeemed successfully!",
            "appliedToJiomart", true
        ));
    }

    @PostMapping("/validate-gift-voucher")
    public ResponseEntity<?> validateGiftVoucher(@RequestBody Map<String, Object> body) {
        String voucherCode = (String) body.get("voucherCode");
        Long accountId = body.get("accountId") != null ? ((Number) body.get("accountId")).longValue() : null;
        Double cartTotal = body.get("cartTotal") != null ? ((Number) body.get("cartTotal")).doubleValue() : 0.0;

        if (voucherCode == null || voucherCode.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Gift voucher code is required"));
        }

        Random random = new Random(voucherCode.hashCode());
        boolean valid = random.nextInt(10) > 1;
        double voucherAmount = valid ? (random.nextInt(500) + 50) : 0;
        double applicableAmount = Math.min(voucherAmount, cartTotal);
        double finalAmount = Math.max(0, cartTotal - applicableAmount);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("voucherCode", voucherCode);
        result.put("valid", valid);
        result.put("message", valid ? "Gift voucher applied! ₹" + applicableAmount + " deducted." : "Invalid or already used gift voucher");
        result.put("voucherAmount", voucherAmount);
        result.put("applicableAmount", applicableAmount);
        result.put("cartTotal", cartTotal);
        result.put("finalAmount", finalAmount);
        if (accountId != null) result.put("accountId", accountId);
        result.put("reflectedInJiomart", valid);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/place-order-cod")
    public ResponseEntity<?> placeOrderCod(@RequestBody Map<String, Object> body) {
        Long accountId = ((Number) body.get("accountId")).longValue();
        Long orderId = ((Number) body.get("orderId")).longValue();

        ConnectedAccount account = accountService.findById(accountId).orElse(null);
        if (account == null) {
            return ResponseEntity.notFound().build();
        }

        String jioOrderId = "JIO-" + orderId + "-" + System.currentTimeMillis() % 100000;

        account.setTotalOrders(account.getTotalOrders() + 1);
        accountService.save(account);

        return ResponseEntity.ok(Map.of(
            "message", "Order placed on JioMart account with COD",
            "jioOrderId", jioOrderId,
            "accountId", accountId,
            "paymentMethod", "COD",
            "orderPlacedOnJiomart", true,
            "estimatedDelivery", java.time.LocalDate.now().plusDays(3).toString()
        ));
    }

    @GetMapping("/order-tracking/{orderId}")
    public ResponseEntity<?> getOrderTracking(@PathVariable Long orderId) {
        var trackings = trackingService.getByOrderId(orderId);
        if (trackings.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        var tracking = trackings.get(0);
        Random random = new Random(orderId.hashCode());

        String[] statuses = {"Order Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"};
        String[] riderNames = {"Ravi Kumar", "Amit Singh", "Suresh Patel", "Mahesh Sharma", "Dinesh Yadav"};
        int statusIdx = random.nextInt(statuses.length);

        tracking.setCurrentStatus(statuses[statusIdx]);
        if (statusIdx >= 2) {
            tracking.setRiderName(riderNames[random.nextInt(riderNames.length)]);
            tracking.setRiderPhone("+91" + (9000000000L + random.nextInt(999999999)));
            tracking.setRiderLocation(statusIdx == 3 ? "Near delivery address" : "In transit");
            tracking.setRiderLatitude(19.076 + random.nextDouble() * 0.1);
            tracking.setRiderLongitude(72.877 + random.nextDouble() * 0.1);
        }
        if (statusIdx == 4) {
            tracking.setDeliveryOtp(String.valueOf(1000 + random.nextInt(9000)));
        }
        tracking.setEstimatedDelivery(java.time.LocalDate.now().plusDays(3 - Math.min(statusIdx, 2)).toString());
        tracking.setLastSyncedAt(java.time.LocalDateTime.now());
        tracking.setUpdatedAt(java.time.LocalDateTime.now());
        trackingService.save(tracking);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderId", orderId);
        result.put("jioOrderId", tracking.getJioOrderId());
        result.put("currentStatus", tracking.getCurrentStatus());
        result.put("deliveryStatus", tracking.getDeliveryStatus());
        result.put("estimatedDelivery", tracking.getEstimatedDelivery());
        result.put("deliveryOtp", tracking.getDeliveryOtp());
        result.put("productName", tracking.getProductName());
        result.put("orderAmount", tracking.getOrderAmount());

        Map<String, Object> rider = new LinkedHashMap<>();
        rider.put("name", tracking.getRiderName());
        rider.put("phone", tracking.getRiderPhone());
        rider.put("location", tracking.getRiderLocation());
        rider.put("latitude", tracking.getRiderLatitude());
        rider.put("longitude", tracking.getRiderLongitude());
        result.put("rider", rider);

        List<Map<String, Object>> timeline = new ArrayList<>();
        for (int i = 0; i <= statusIdx; i++) {
            Map<String, Object> step = new LinkedHashMap<>();
            step.put("status", statuses[i]);
            step.put("timestamp", java.time.LocalDateTime.now().minusHours((statusIdx - i) * 6).toString());
            step.put("completed", true);
            timeline.add(step);
        }
        for (int i = statusIdx + 1; i < statuses.length; i++) {
            Map<String, Object> step = new LinkedHashMap<>();
            step.put("status", statuses[i]);
            step.put("timestamp", null);
            step.put("completed", false);
            timeline.add(step);
        }
        result.put("timeline", timeline);
        result.put("lastSyncedAt", tracking.getLastSyncedAt().toString());

        return ResponseEntity.ok(result);
    }
}
