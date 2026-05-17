package com.jiomart.bulk.repository;

import com.jiomart.bulk.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByAccessKey(String accessKey);
    List<User> findByRole(String role);
    List<User> findByRoleOrderByCreatedAtDesc(String role);
    List<User> findByRoleAndDisplayNameContainingIgnoreCaseOrderByCreatedAtDesc(String role, String name);
    List<User> findByRoleInOrderByCreatedAtDesc(List<String> roles);
    List<User> findByRoleInAndDisplayNameContainingIgnoreCaseOrderByCreatedAtDesc(List<String> roles, String name);
}
