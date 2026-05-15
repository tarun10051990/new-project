package com.jiomart.bulk.service;

import com.jiomart.bulk.model.ConnectedAccount;
import com.jiomart.bulk.repository.ConnectedAccountRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AccountService {
    private final ConnectedAccountRepository accountRepository;

    public AccountService(ConnectedAccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public List<ConnectedAccount> getByUserId(Long userId) {
        return accountRepository.findByUserId(userId);
    }

    public List<ConnectedAccount> search(Long userId, String query) {
        return accountRepository.findByUserIdAndMobileNumberContaining(userId, query);
    }

    public ConnectedAccount save(ConnectedAccount account) {
        return accountRepository.save(account);
    }

    public Optional<ConnectedAccount> findById(Long id) {
        return accountRepository.findById(id);
    }

    public void delete(Long id) {
        accountRepository.deleteById(id);
    }

    public void deleteMultiple(List<Long> ids) {
        accountRepository.deleteAllById(ids);
    }

    public long countByUserId(Long userId) {
        return accountRepository.findByUserId(userId).size();
    }
}
