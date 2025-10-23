package com.tickets.api.service;

import com.tickets.api.dto.stats.CategoryStatsDto;
import com.tickets.api.dto.stats.StatsOverviewDto;
import com.tickets.api.model.enums.ReportStatus;
import com.tickets.api.repository.LocationRepository;
import com.tickets.api.repository.ReportRepository;
import com.tickets.api.repository.UserRepository;
import com.tickets.api.repository.projection.CategoryCountProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;

    @Transactional(readOnly = true)
    public StatsOverviewDto getOverview() {
        long locationsCount = locationRepository.count();
        long usersCount = userRepository.count();

        // Consider "ativos" = não arquivados e não resolvidos definitivamente
        List<ReportStatus> excluded = new ArrayList<>(EnumSet.of(ReportStatus.ARCHIVED, ReportStatus.RESOLVED_CONFIRMED));
        long activeReportsCount = reportRepository.countByStatusNotIn(excluded);

        List<CategoryCountProjection> counts = reportRepository.countReportsByCategory();
        long totalReports = counts.stream().mapToLong(CategoryCountProjection::getCount).sum();

        List<CategoryStatsDto> breakdown = counts.stream().map(c -> {
            int percentage = totalReports == 0 ? 0 : (int) Math.round((c.getCount() * 100.0) / totalReports);
            return new CategoryStatsDto(c.getCategoryId(), c.getCategoryName(), c.getCount(), percentage);
        }).collect(Collectors.toList());

        return new StatsOverviewDto(locationsCount, activeReportsCount, usersCount, breakdown);
    }
}
