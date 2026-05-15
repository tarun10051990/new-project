package com.jiomart.bulk.service;

import com.jiomart.bulk.model.User;
import com.jiomart.bulk.repository.UserRepository;
import org.springframework.stereotype.Service;
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
            return existing.get();
        }
        if (accessKey.startsWith("jm_")) {
            User user = new User();
            user.setAccessKey(accessKey);
            user.setDisplayName(accessKey.equals("jm_demo") ? "Demo Visitor" : "User " + accessKey.substring(3));
            user.setCredits(9999.0);
            return userRepository.save(user);
        }
        return null;
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
