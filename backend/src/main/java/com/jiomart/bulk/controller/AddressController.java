package com.jiomart.bulk.controller;

import com.jiomart.bulk.model.Address;
import com.jiomart.bulk.model.ConnectedAccount;
import com.jiomart.bulk.service.AccountService;
import com.jiomart.bulk.service.AddressService;
import com.jiomart.bulk.service.JioMartApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {
    private final AddressService addressService;
    private final AccountService accountService;
    private final JioMartApiService jioMartApiService;

    public AddressController(AddressService addressService, AccountService accountService,
                             JioMartApiService jioMartApiService) {
        this.addressService = addressService;
        this.accountService = accountService;
        this.jioMartApiService = jioMartApiService;
    }

    @GetMapping("/{userId}")
    public List<Address> getAddresses(@PathVariable Long userId) {
        return addressService.getByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<?> createAddress(@RequestBody Map<String, Object> body) {
        Address address = new Address();
        address.setUserId(body.get("userId") != null ? ((Number) body.get("userId")).longValue() : null);
        address.setFullName((String) body.get("fullName"));
        address.setMobileNo((String) body.get("mobileNo"));
        address.setPincode((String) body.get("pincode"));
        address.setFlatHouseNo((String) body.get("flatHouseNo"));
        address.setRoadStreetName((String) body.get("roadStreetName"));
        address.setLocalityLandmark((String) body.get("localityLandmark"));
        address.setCity((String) body.get("city"));
        address.setState((String) body.get("state"));
        if (body.get("latitude") != null && !String.valueOf(body.get("latitude")).isEmpty()) {
            address.setLatitude(Double.parseDouble(String.valueOf(body.get("latitude"))));
        }
        if (body.get("longitude") != null && !String.valueOf(body.get("longitude")).isEmpty()) {
            address.setLongitude(Double.parseDouble(String.valueOf(body.get("longitude"))));
        }

        Address saved = addressService.save(address);

        boolean syncedToJiomart = false;
        Long accountId = body.get("accountId") != null ? ((Number) body.get("accountId")).longValue() : null;
        if (accountId != null) {
            ConnectedAccount account = accountService.findById(accountId).orElse(null);
            if (account != null && account.getAccessToken() != null && !account.getAccessToken().isEmpty()) {
                Map<String, Object> jioPayload = jioMartApiService.buildJioMartAddressPayload(
                    address.getFullName(), address.getMobileNo(), address.getPincode(),
                    address.getFlatHouseNo(), address.getRoadStreetName(), address.getLocalityLandmark(),
                    address.getCity(), address.getState(), address.getLatitude(), address.getLongitude()
                );
                jioMartApiService.addAddress(account.getAccessToken(), account.getRefreshToken(), jioPayload);
                syncedToJiomart = true;
            }
        }

        Map<String, Object> response = new java.util.LinkedHashMap<>();
        response.put("id", saved.getId());
        response.put("userId", saved.getUserId());
        response.put("fullName", saved.getFullName() != null ? saved.getFullName() : "");
        response.put("mobileNo", saved.getMobileNo() != null ? saved.getMobileNo() : "");
        response.put("pincode", saved.getPincode() != null ? saved.getPincode() : "");
        response.put("flatHouseNo", saved.getFlatHouseNo() != null ? saved.getFlatHouseNo() : "");
        response.put("roadStreetName", saved.getRoadStreetName() != null ? saved.getRoadStreetName() : "");
        response.put("localityLandmark", saved.getLocalityLandmark() != null ? saved.getLocalityLandmark() : "");
        response.put("city", saved.getCity() != null ? saved.getCity() : "");
        response.put("state", saved.getState() != null ? saved.getState() : "");
        response.put("syncedToJiomart", syncedToJiomart);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id) {
        addressService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Address deleted"));
    }
}
