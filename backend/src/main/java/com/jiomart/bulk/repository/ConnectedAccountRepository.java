package com.jiomart.bulk.repository;

import com.jiomart.bulk.model.ConnectedAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConnectedAccountRepository extends JpaRepository<ConnectedAccount, Long> {
    List<ConnectedAccount> findByUserId(Long userId);
    List<ConnectedAccount> findByUserIdAndMobileNumberContaining(Long userId, String mobileNumber);
}
