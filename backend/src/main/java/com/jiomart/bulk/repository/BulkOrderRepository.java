package com.jiomart.bulk.repository;

import com.jiomart.bulk.model.BulkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface BulkOrderRepository extends JpaRepository<BulkOrder, Long> {
    List<BulkOrder> findByUserId(Long userId);
    List<BulkOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<BulkOrder> findByAccountIdOrderByCreatedAtDesc(Long accountId);
    long countByUserId(Long userId);
    long countByUserIdAndCreatedAtAfter(Long userId, LocalDateTime after);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM BulkOrder b WHERE b.userId = :userId")
    Double sumTotalAmountByUserId(Long userId);
}
