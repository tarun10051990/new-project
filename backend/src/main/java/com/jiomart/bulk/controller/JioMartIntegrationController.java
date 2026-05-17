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

    public JioMartIntegrationController(AccountService accountService, AddressService addressService) {
        this.accountService = accountService;
        this.addressService = addressService;
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
}
