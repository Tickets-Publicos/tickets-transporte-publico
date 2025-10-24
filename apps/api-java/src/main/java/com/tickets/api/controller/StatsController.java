package com.tickets.api.controller;

import com.tickets.api.dto.stats.DashboardStatsDto;
import com.tickets.api.dto.stats.StatsOverviewDto;
import com.tickets.api.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

  @GetMapping("/dashboard")
  public ResponseEntity<DashboardStatsDto> getDashboardStats(
      @RequestParam(value = "userId", required = false) String userId) {
    return ResponseEntity.ok(statsService.getDashboardStats(userId));
  }
}
