package com.tickets.api.service;

import com.tickets.api.dto.stats.*;
import com.tickets.api.model.enums.ReportStatus;
import com.tickets.api.repository.LocationRepository;
import com.tickets.api.repository.ReportRepository;
import com.tickets.api.repository.UserRepository;
import com.tickets.api.repository.projection.CategoryCountProjection;
import com.tickets.api.repository.projection.LocationTypeCountProjection;
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

  @Transactional(readOnly = true)
  public DashboardStatsDto getDashboardStats(String userId) {
    // Total de reportes (todos ou filtrados por usuário)
    long totalReports = userId != null
        ? reportRepository.findByAuthorId(userId, org.springframework.data.domain.Pageable.unpaged()).getTotalElements()
        : reportRepository.count();

    // Reportes por status
    long pending = userId != null
        ? reportRepository
            .findByFilters(ReportStatus.PENDING, null, null, userId, org.springframework.data.domain.Pageable.unpaged())
            .getTotalElements()
        : reportRepository.countByStatus(ReportStatus.PENDING);

    long inAnalysis = userId != null
        ? reportRepository.findByFilters(ReportStatus.IN_ANALYSIS, null, null, userId,
            org.springframework.data.domain.Pageable.unpaged()).getTotalElements()
        : reportRepository.countByStatus(ReportStatus.IN_ANALYSIS);

    long resolvedProvisional = userId != null
        ? reportRepository.findByFilters(ReportStatus.RESOLVED_PROVISIONAL, null, null, userId,
            org.springframework.data.domain.Pageable.unpaged()).getTotalElements()
        : reportRepository.countByStatus(ReportStatus.RESOLVED_PROVISIONAL);

    long resolvedConfirmed = userId != null
        ? reportRepository.findByFilters(ReportStatus.RESOLVED_CONFIRMED, null, null, userId,
            org.springframework.data.domain.Pageable.unpaged()).getTotalElements()
        : reportRepository.countByStatus(ReportStatus.RESOLVED_CONFIRMED);

    long archived = userId != null
        ? reportRepository.findByFilters(ReportStatus.ARCHIVED, null, null, userId,
            org.springframework.data.domain.Pageable.unpaged()).getTotalElements()
        : reportRepository.countByStatus(ReportStatus.ARCHIVED);

    // Total de reportes resolvidos (provisório + confirmado)
    long resolvedReports = resolvedProvisional + resolvedConfirmed;

    // Taxa de resolução
    double resolutionRate = totalReports > 0 ? (resolvedReports * 100.0) / totalReports : 0.0;

    // Problemas por categoria
    List<CategoryCountProjection> categoryCounts = reportRepository.countReportsByCategory();
    List<CategoryStatsDto> categoryBreakdown = categoryCounts.stream()
        .map(c -> {
          int percentage = totalReports > 0 ? (int) Math.round((c.getCount() * 100.0) / totalReports) : 0;
          return new CategoryStatsDto(c.getCategoryId(), c.getCategoryName(), c.getCount(), percentage);
        })
        .collect(Collectors.toList());

    // Reportes por tipo de local
    List<LocationTypeCountProjection> locationTypeCounts = reportRepository.countReportsByLocationType();
    List<LocationTypeBreakdownDto> locationTypeBreakdown = locationTypeCounts.stream()
        .map(l -> {
          // Mapear o tipo para um nome mais amigável
          String typeName = getLocationTypeName(l.getType());
          return new LocationTypeBreakdownDto(l.getType(), typeName, l.getCount(), l.getTotalLocations());
        })
        .collect(Collectors.toList());

    // Status breakdown
    StatusBreakdownDto statusBreakdown = new StatusBreakdownDto(
        pending, inAnalysis, resolvedProvisional, resolvedConfirmed, archived);

    return new DashboardStatsDto(
        totalReports,
        pending,
        resolvedReports,
        resolutionRate,
        categoryBreakdown,
        locationTypeBreakdown,
        statusBreakdown);
  }

  private String getLocationTypeName(String type) {
    // Mapear os tipos para nomes mais amigáveis
    switch (type != null ? type.toLowerCase() : "") {
      case "station":
        return "Estações";
      case "terminal":
        return "Terminais";
      case "bus_stop":
        return "Pontos de Ônibus";
      case "subway":
        return "Metrô";
      case "train":
        return "Trem";
      default:
        return type != null ? type : "Outros";
    }
  }
}
