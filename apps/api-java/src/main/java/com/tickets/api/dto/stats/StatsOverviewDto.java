package com.tickets.api.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class StatsOverviewDto {
    private long locationsCount;
    private long activeReportsCount;
    private long usersCount;
    private List<CategoryStatsDto> categoriesBreakdown;
}
