package com.jiomart.bulk.controller;

import com.jiomart.bulk.model.ConnectedAccount;
import com.jiomart.bulk.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/{userId}")
    public List<ConnectedAccount> getAccounts(@PathVariable Long userId) {
        return accountService.getByUserId(userId);
    }

    @GetMapping("/{userId}/search")
    public List<ConnectedAccount> searchAccounts(@PathVariable Long userId, @RequestParam String q) {
        return accountService.search(userId, q);
    }

    @PostMapping
    public ResponseEntity<ConnectedAccount> addAccount(@RequestBody ConnectedAccount account) {
        return ResponseEntity.ok(accountService.save(account));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id) {
        accountService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Account deleted"));
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<?> deleteMultiple(@RequestBody Map<String, List<Long>> body) {
        accountService.deleteMultiple(body.get("ids"));
        return ResponseEntity.ok(Map.of("message", "Accounts deleted"));
    }
}
