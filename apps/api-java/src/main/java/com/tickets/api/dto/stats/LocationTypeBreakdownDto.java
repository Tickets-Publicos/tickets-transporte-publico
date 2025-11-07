package com.tickets.api.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LocationTypeBreakdownDto {
  private String type;
  private String typeName;
  private long count;
  private long totalLocations;
}
