package com.jiomart.bulk.controller;

import com.jiomart.bulk.model.Address;
import com.jiomart.bulk.service.AddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {
    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping("/{userId}")
    public List<Address> getAddresses(@PathVariable Long userId) {
        return addressService.getByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<Address> createAddress(@RequestBody Address address) {
        return ResponseEntity.ok(addressService.save(address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id) {
        addressService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Address deleted"));
    }
}
