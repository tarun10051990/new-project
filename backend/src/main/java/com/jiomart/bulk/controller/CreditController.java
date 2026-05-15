package com.jiomart.bulk.controller;

import com.jiomart.bulk.model.CreditTransaction;
import com.jiomart.bulk.service.CreditService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/credits")
public class CreditController {
    private final CreditService creditService;

    public CreditController(CreditService creditService) {
        this.creditService = creditService;
    }

    @GetMapping("/{userId}")
    public List<CreditTransaction> getHistory(@PathVariable Long userId) {
        return creditService.getHistory(userId);
    }
}
