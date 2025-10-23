package com.tickets.api.controller;

import com.tickets.api.dto.stats.StatsOverviewDto;
import com.tickets.api.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/overview")
    public ResponseEntity<StatsOverviewDto> getOverview() {
        return ResponseEntity.ok(statsService.getOverview());
    }
}
