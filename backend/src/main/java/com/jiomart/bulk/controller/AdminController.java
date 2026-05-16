package com.jiomart.bulk.controller;

import com.jiomart.bulk.model.*;
import com.jiomart.bulk.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserService userService;
    private final AccountService accountService;
    private final AddressService addressService;
    private final OrderService orderService;
    private final CreditService creditService;

    public AdminController(UserService userService, AccountService accountService,
                           AddressService addressService, OrderService orderService,
                           CreditService creditService) {
        this.userService = userService;
        this.accountService = accountService;
        this.addressService = addressService;
        this.orderService = orderService;
        this.creditService = creditService;
    }

    @GetMapping("/customers")
    public ResponseEntity<?> getCustomers(@RequestParam(required = false) String search) {
        List<User> customers;
        if (search != null && !search.isBlank()) {
            customers = userService.searchPremiumCustomers(search);
        } else {
            customers = userService.getAllPremiumCustomers();
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (User c : customers) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", c.getId());
            map.put("accessKey", c.getAccessKey());
            map.put("displayName", c.getDisplayName());
            map.put("email", c.getEmail());
            map.put("credits", c.getCredits());
            map.put("status", c.getStatus());
            map.put("createdAt", c.getCreatedAt());
            map.put("totalAccounts", accountService.countByUserId(c.getId()));
            Map<String, Object> stats = orderService.getStats(c.getId());
            map.put("totalOrders", stats.get("totalOrders"));
            map.put("todaysOrders", stats.get("todaysOrders"));
            map.put("totalSpent", stats.get("totalSpent"));
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/customers")
    public ResponseEntity<?> createCustomer(@RequestBody Map<String, Object> body) {
        String displayName = (String) body.get("displayName");
        String email = (String) body.get("email");
        Double credits = body.get("credits") != null ? ((Number) body.get("credits")).doubleValue() : 0.0;

        String accessKey = "jm_" + UUID.randomUUID().toString().substring(0, 8);
        if (body.get("accessKey") != null) {
            accessKey = (String) body.get("accessKey");
        }

        User customer = new User();
        customer.setAccessKey(accessKey);
        customer.setDisplayName(displayName != null ? displayName : "User");
        customer.setEmail(email);
        customer.setCredits(credits);
        customer.setRole("PREMIUM");
        customer.setStatus("Active");

        User saved = userService.save(customer);
        return ResponseEntity.ok(Map.of(
            "message", "Customer created",
            "customer", Map.of(
                "id", saved.getId(),
                "accessKey", saved.getAccessKey(),
                "displayName", saved.getDisplayName(),
                "email", saved.getEmail() != null ? saved.getEmail() : "",
                "credits", saved.getCredits(),
                "status", saved.getStatus()
            )
        ));
    }

    @PutMapping("/customers/{customerId}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long customerId, @RequestBody Map<String, Object> body) {
        return userService.findById(customerId).map(customer -> {
            if (body.containsKey("displayName")) customer.setDisplayName((String) body.get("displayName"));
            if (body.containsKey("email")) customer.setEmail((String) body.get("email"));
            if (body.containsKey("status")) customer.setStatus((String) body.get("status"));
            if (body.containsKey("credits")) customer.setCredits(((Number) body.get("credits")).doubleValue());
            User updated = userService.save(customer);
            return ResponseEntity.ok(Map.of("message", "Customer updated", "customer", Map.of(
                "id", updated.getId(),
                "accessKey", updated.getAccessKey(),
                "displayName", updated.getDisplayName(),
                "email", updated.getEmail() != null ? updated.getEmail() : "",
                "credits", updated.getCredits(),
                "status", updated.getStatus()
            )));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/customers/{customerId}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long customerId) {
        userService.deleteUser(customerId);
        return ResponseEntity.ok(Map.of("message", "Customer deleted"));
    }

    @PostMapping("/customers/{customerId}/credits")
    public ResponseEntity<?> adjustCredits(@PathVariable Long customerId, @RequestBody Map<String, Object> body) {
        return userService.findById(customerId).map(customer -> {
            Double amount = ((Number) body.get("amount")).doubleValue();
            String type = (String) body.get("type");
            String description = (String) body.get("description");

            if ("deduct".equals(type)) {
                customer.setCredits(Math.max(0, customer.getCredits() - amount));
            } else {
                customer.setCredits(customer.getCredits() + amount);
            }
            userService.save(customer);

            CreditTransaction tx = new CreditTransaction();
            tx.setUserId(customerId);
            tx.setType(type);
            tx.setAmount(amount);
            tx.setDescription(description != null ? description : ("Admin " + type));
            tx.setBalanceAfter(customer.getCredits());
            creditService.addTransaction(tx);

            return ResponseEntity.ok(Map.of(
                "message", "Credits adjusted",
                "newBalance", customer.getCredits()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customers/{customerId}/credits/history")
    public List<CreditTransaction> getCreditHistory(@PathVariable Long customerId) {
        return creditService.getHistory(customerId);
    }

    @GetMapping("/customers/{customerId}/accounts")
    public List<ConnectedAccount> getCustomerAccounts(@PathVariable Long customerId) {
        return accountService.getByUserId(customerId);
    }

    @PostMapping("/customers/{customerId}/accounts")
    public ResponseEntity<?> addAccountForCustomer(@PathVariable Long customerId, @RequestBody ConnectedAccount account) {
        account.setUserId(customerId);
        return ResponseEntity.ok(accountService.save(account));
    }

    @DeleteMapping("/customers/{customerId}/accounts/{accountId}")
    public ResponseEntity<?> deleteCustomerAccount(@PathVariable Long customerId, @PathVariable Long accountId) {
        accountService.delete(accountId);
        return ResponseEntity.ok(Map.of("message", "Account deleted"));
    }

    @GetMapping("/customers/{customerId}/addresses")
    public List<Address> getCustomerAddresses(@PathVariable Long customerId) {
        return addressService.getByUserId(customerId);
    }

    @PostMapping("/customers/{customerId}/addresses")
    public ResponseEntity<?> addAddressForCustomer(@PathVariable Long customerId, @RequestBody Address address) {
        address.setUserId(customerId);
        return ResponseEntity.ok(addressService.save(address));
    }

    @DeleteMapping("/customers/{customerId}/addresses/{addressId}")
    public ResponseEntity<?> deleteCustomerAddress(@PathVariable Long customerId, @PathVariable Long addressId) {
        addressService.delete(addressId);
        return ResponseEntity.ok(Map.of("message", "Address deleted"));
    }

    @GetMapping("/customers/{customerId}/orders")
    public List<BulkOrder> getCustomerOrders(@PathVariable Long customerId) {
        return orderService.getByUserIdOrdered(customerId);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        List<User> customers = userService.getAllPremiumCustomers();
        long totalCustomers = customers.size();
        long activeCustomers = customers.stream().filter(c -> "Active".equals(c.getStatus())).count();
        double totalCreditsAllocated = customers.stream().mapToDouble(User::getCredits).sum();

        long totalOrders = 0;
        double totalRevenue = 0;
        long todaysOrders = 0;
        for (User c : customers) {
            Map<String, Object> stats = orderService.getStats(c.getId());
            totalOrders += ((Number) stats.get("totalOrders")).longValue();
            todaysOrders += ((Number) stats.get("todaysOrders")).longValue();
            totalRevenue += ((Number) stats.get("totalSpent")).doubleValue();
        }

        long totalAccounts = 0;
        for (User c : customers) {
            totalAccounts += accountService.countByUserId(c.getId());
        }

        return ResponseEntity.ok(Map.of(
            "totalCustomers", totalCustomers,
            "activeCustomers", activeCustomers,
            "totalCreditsAllocated", totalCreditsAllocated,
            "totalOrders", totalOrders,
            "todaysOrders", todaysOrders,
            "totalRevenue", totalRevenue,
            "totalAccounts", totalAccounts
        ));
    }
}
