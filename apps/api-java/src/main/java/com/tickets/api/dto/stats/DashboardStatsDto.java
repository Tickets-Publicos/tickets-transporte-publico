package com.tickets.api.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DashboardStatsDto {
  private long totalReports;
  private long pendingReports;
  private long resolvedReports;
  private double resolutionRate;
  private List<CategoryStatsDto> problemsByCategory;
  private List<LocationTypeBreakdownDto> reportsByLocationType;
  private StatusBreakdownDto statusBreakdown;
}
