package com.jiomart.bulk.controller;

import com.jiomart.bulk.model.User;
import com.jiomart.bulk.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String accessKey = body.get("accessKey");
        if (accessKey == null || !accessKey.startsWith("jm_")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid access key format. Must start with jm_"));
        }
        User user = userService.authenticate(accessKey);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid access key. Contact admin for a premium key."));
        }
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "accessKey", user.getAccessKey(),
            "displayName", user.getDisplayName(),
            "credits", user.getCredits(),
            "role", user.getRole()
        ));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> body) {
        String accessKey = body.get("accessKey");
        if (accessKey == null || !accessKey.startsWith("jm_")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid access key format"));
        }
        User admin = userService.authenticateAdmin(accessKey);
        if (admin == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Admin access denied"));
        }
        return ResponseEntity.ok(Map.of(
            "id", admin.getId(),
            "accessKey", admin.getAccessKey(),
            "displayName", admin.getDisplayName(),
            "role", admin.getRole()
        ));
    }

    @GetMapping("/me/{userId}")
    public ResponseEntity<?> getUser(@PathVariable Long userId) {
        return userService.findById(userId)
            .map(user -> ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "accessKey", user.getAccessKey(),
                "displayName", user.getDisplayName(),
                "credits", user.getCredits(),
                "role", user.getRole()
            )))
            .orElse(ResponseEntity.notFound().build());
    }
}
