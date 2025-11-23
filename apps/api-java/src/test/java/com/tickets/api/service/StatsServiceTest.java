package com.tickets.api.service;

import com.tickets.api.dto.stats.*;
import com.tickets.api.model.entity.Report;
import com.tickets.api.model.enums.ReportStatus;
import com.tickets.api.repository.LocationRepository;
import com.tickets.api.repository.ReportRepository;
import com.tickets.api.repository.UserRepository;
import com.tickets.api.repository.projection.CategoryCountProjection;
import com.tickets.api.repository.projection.LocationTypeCountProjection;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class StatsServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LocationRepository locationRepository;

    @InjectMocks
    private StatsService statsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getOverview_shouldReturnStatsOverview() {
        // Arrange
        when(locationRepository.count()).thenReturn(10L);
        when(userRepository.count()).thenReturn(50L);
        when(reportRepository.countByStatusNotIn(anyList())).thenReturn(30L);

        CategoryCountProjection projection1 = new CategoryCountProjection() {
            @Override
            public String getCategoryId() { return "c1"; }
            @Override
            public String getCategoryName() { return "Category 1"; }
            @Override
            public long getCount() { return 20L; }
        };

        CategoryCountProjection projection2 = new CategoryCountProjection() {
            @Override
            public String getCategoryId() { return "c2"; }
            @Override
            public String getCategoryName() { return "Category 2"; }
            @Override
            public long getCount() { return 10L; }
        };

        when(reportRepository.countReportsByCategory()).thenReturn(Arrays.asList(projection1, projection2));

        // Act
        StatsOverviewDto result = statsService.getOverview();

        // Assert
        assertNotNull(result);
        assertEquals(10L, result.getLocationsCount());
        assertEquals(30L, result.getActiveReportsCount());
        assertEquals(50L, result.getUsersCount());
        assertNotNull(result.getCategoriesBreakdown());
        assertEquals(2, result.getCategoriesBreakdown().size());
        assertEquals("Category 1", result.getCategoriesBreakdown().get(0).getCategoryName());
        assertEquals(20L, result.getCategoriesBreakdown().get(0).getCount());
        assertEquals(67, result.getCategoriesBreakdown().get(0).getPercentage()); // 20/30 * 100
    }

    @Test
    void getOverview_withNoReports_shouldHandleZeroPercentage() {
        // Arrange
        when(locationRepository.count()).thenReturn(5L);
        when(userRepository.count()).thenReturn(10L);
        when(reportRepository.countByStatusNotIn(anyList())).thenReturn(0L);
        when(reportRepository.countReportsByCategory()).thenReturn(Collections.emptyList());

        // Act
        StatsOverviewDto result = statsService.getOverview();

        // Assert
        assertNotNull(result);
        assertEquals(5L, result.getLocationsCount());
        assertEquals(0L, result.getActiveReportsCount());
        assertEquals(10L, result.getUsersCount());
        assertTrue(result.getCategoriesBreakdown().isEmpty());
    }

    @Test
    void getDashboardStats_withoutUserId_shouldReturnAllStats() {
        // Arrange
        when(reportRepository.count()).thenReturn(100L);
        when(reportRepository.countByStatus(ReportStatus.PENDING)).thenReturn(20L);
        when(reportRepository.countByStatus(ReportStatus.IN_ANALYSIS)).thenReturn(15L);
        when(reportRepository.countByStatus(ReportStatus.RESOLVED_PROVISIONAL)).thenReturn(25L);
        when(reportRepository.countByStatus(ReportStatus.RESOLVED_CONFIRMED)).thenReturn(30L);
        when(reportRepository.countByStatus(ReportStatus.ARCHIVED)).thenReturn(10L);

        CategoryCountProjection projection = new CategoryCountProjection() {
            @Override
            public String getCategoryId() { return "c1"; }
            @Override
            public String getCategoryName() { return "Category 1"; }
            @Override
            public long getCount() { return 50L; }
        };

        when(reportRepository.countReportsByCategory()).thenReturn(Arrays.asList(projection));

        LocationTypeCountProjection locProjection = new LocationTypeCountProjection() {
            @Override
            public String getType() { return "station"; }
            @Override
            public Long getCount() { return 40L; }
            @Override
            public Long getTotalLocations() { return 10L; }
        };

        when(reportRepository.countReportsByLocationType()).thenReturn(Arrays.asList(locProjection));

        // Act
        DashboardStatsDto result = statsService.getDashboardStats(null);

        // Assert
        assertNotNull(result);
        assertEquals(100L, result.getTotalReports());
        assertEquals(20L, result.getPendingReports());
        assertEquals(55L, result.getResolvedReports()); // 25 + 30
        assertEquals(55.0, result.getResolutionRate()); // 55/100 * 100
        assertNotNull(result.getProblemsByCategory());
        assertEquals(1, result.getProblemsByCategory().size());
        assertNotNull(result.getReportsByLocationType());
        assertEquals(1, result.getReportsByLocationType().size());
        assertEquals("Estações", result.getReportsByLocationType().get(0).getTypeName());
        assertNotNull(result.getStatusBreakdown());
        assertEquals(20L, result.getStatusBreakdown().getPending());
        assertEquals(15L, result.getStatusBreakdown().getInAnalysis());
    }

    @Test
    void getDashboardStats_withUserId_shouldReturnFilteredStats() {
        // Arrange
        String userId = "user1";
        Page<Report> emptyPage = new PageImpl<>(Collections.emptyList());
        Page<Report> pageWith10 = new PageImpl<>(Collections.nCopies(10, null));
        Page<Report> pageWith5 = new PageImpl<>(Collections.nCopies(5, null));
        Page<Report> pageWith3 = new PageImpl<>(Collections.nCopies(3, null));
        Page<Report> pageWith2 = new PageImpl<>(Collections.nCopies(2, null));

        when(reportRepository.findByAuthorId(eq(userId), any(Pageable.class))).thenReturn(pageWith10);
        when(reportRepository.findByFilters(eq(ReportStatus.PENDING), isNull(), isNull(), eq(userId), any(Pageable.class)))
                .thenReturn(pageWith3);
        when(reportRepository.findByFilters(eq(ReportStatus.IN_ANALYSIS), isNull(), isNull(), eq(userId), any(Pageable.class)))
                .thenReturn(pageWith2);
        when(reportRepository.findByFilters(eq(ReportStatus.RESOLVED_PROVISIONAL), isNull(), isNull(), eq(userId), any(Pageable.class)))
                .thenReturn(pageWith5);
        when(reportRepository.findByFilters(eq(ReportStatus.RESOLVED_CONFIRMED), isNull(), isNull(), eq(userId), any(Pageable.class)))
                .thenReturn(emptyPage);
        when(reportRepository.findByFilters(eq(ReportStatus.ARCHIVED), isNull(), isNull(), eq(userId), any(Pageable.class)))
                .thenReturn(emptyPage);

        when(reportRepository.countReportsByCategory()).thenReturn(Collections.emptyList());
        when(reportRepository.countReportsByLocationType()).thenReturn(Collections.emptyList());

        // Act
        DashboardStatsDto result = statsService.getDashboardStats(userId);

        // Assert
        assertNotNull(result);
        assertEquals(10L, result.getTotalReports());
        assertEquals(3L, result.getPendingReports());
        assertEquals(5L, result.getResolvedReports()); // 5 + 0
        assertEquals(50.0, result.getResolutionRate()); // 5/10 * 100
    }

    @Test
    void getDashboardStats_withZeroReports_shouldHandleZeroResolutionRate() {
        // Arrange
        when(reportRepository.count()).thenReturn(0L);
        when(reportRepository.countByStatus(any(ReportStatus.class))).thenReturn(0L);
        when(reportRepository.countReportsByCategory()).thenReturn(Collections.emptyList());
        when(reportRepository.countReportsByLocationType()).thenReturn(Collections.emptyList());

        // Act
        DashboardStatsDto result = statsService.getDashboardStats(null);

        // Assert
        assertNotNull(result);
        assertEquals(0L, result.getTotalReports());
        assertEquals(0L, result.getResolvedReports());
        assertEquals(0.0, result.getResolutionRate());
    }

    @Test
    void getDashboardStats_shouldMapLocationTypeNames() {
        // Arrange
        when(reportRepository.count()).thenReturn(100L);
        when(reportRepository.countByStatus(any(ReportStatus.class))).thenReturn(0L);
        when(reportRepository.countReportsByCategory()).thenReturn(Collections.emptyList());

        LocationTypeCountProjection station = new LocationTypeCountProjection() {
            @Override
            public String getType() { return "station"; }
            @Override
            public Long getCount() { return 10L; }
            @Override
            public Long getTotalLocations() { return 5L; }
        };

        LocationTypeCountProjection terminal = new LocationTypeCountProjection() {
            @Override
            public String getType() { return "terminal"; }
            @Override
            public Long getCount() { return 20L; }
            @Override
            public Long getTotalLocations() { return 8L; }
        };

        LocationTypeCountProjection busStop = new LocationTypeCountProjection() {
            @Override
            public String getType() { return "bus_stop"; }
            @Override
            public Long getCount() { return 15L; }
            @Override
            public Long getTotalLocations() { return 12L; }
        };

        when(reportRepository.countReportsByLocationType())
                .thenReturn(Arrays.asList(station, terminal, busStop));

        // Act
        DashboardStatsDto result = statsService.getDashboardStats(null);

        // Assert
        assertNotNull(result);
        assertEquals(3, result.getReportsByLocationType().size());
        assertEquals("Estações", result.getReportsByLocationType().get(0).getTypeName());
        assertEquals("Terminais", result.getReportsByLocationType().get(1).getTypeName());
        assertEquals("Pontos de Ônibus", result.getReportsByLocationType().get(2).getTypeName());
    }
}
