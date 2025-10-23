package com.tickets.api.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryStatsDto {
    private String categoryId;
    private String categoryName;
    private long count;
    private int percentage;
}
