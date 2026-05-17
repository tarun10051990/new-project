package com.jiomart.bulk.service;

import com.jiomart.bulk.model.User;
import com.jiomart.bulk.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User authenticate(String accessKey) {
        Optional<User> existing = userRepository.findByAccessKey(accessKey);
        if (existing.isPresent()) {
            User user = existing.get();
            if ("Suspended".equals(user.getStatus())) {
                return null;
            }
            return user;
        }
        return null;
    }

    public User authenticateAdmin(String accessKey) {
        Optional<User> existing = userRepository.findByAccessKey(accessKey);
        if (existing.isPresent()) {
            User user = existing.get();
            if ("ADMIN".equals(user.getRole())) {
                return user;
            }
        }
        return null;
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllPremiumCustomers() {
        return userRepository.findByRoleOrderByCreatedAtDesc("PREMIUM");
    }

    public List<User> searchPremiumCustomers(String query) {
        return userRepository.findByRoleAndDisplayNameContainingIgnoreCaseOrderByCreatedAtDesc("PREMIUM", query);
    }

    public List<User> getAllCustomers() {
        return userRepository.findByRoleInOrderByCreatedAtDesc(java.util.List.of("PREMIUM", "DEMO"));
    }

    public List<User> searchCustomers(String query) {
        return userRepository.findByRoleInAndDisplayNameContainingIgnoreCaseOrderByCreatedAtDesc(java.util.List.of("PREMIUM", "DEMO"), query);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public void initializeAdmin() {
        Optional<User> existing = userRepository.findByAccessKey("jm_admin");
        if (existing.isEmpty()) {
            User admin = new User();
            admin.setAccessKey("jm_admin");
            admin.setDisplayName("Administrator");
            admin.setCredits(0.0);
            admin.setRole("ADMIN");
            admin.setEmail("admin@elitejiomart.com");
            userRepository.save(admin);
        }
    }
}
