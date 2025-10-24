package com.tickets.api.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatusBreakdownDto {
  private long pending;
  private long inAnalysis;
  private long resolvedProvisional;
  private long resolvedConfirmed;
  private long archived;
}
