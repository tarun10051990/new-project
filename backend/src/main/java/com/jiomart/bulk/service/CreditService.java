package com.jiomart.bulk.service;

import com.jiomart.bulk.model.CreditTransaction;
import com.jiomart.bulk.repository.CreditTransactionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CreditService {
    private final CreditTransactionRepository transactionRepository;

    public CreditService(CreditTransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<CreditTransaction> getHistory(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public CreditTransaction addTransaction(CreditTransaction transaction) {
        return transactionRepository.save(transaction);
    }
}
