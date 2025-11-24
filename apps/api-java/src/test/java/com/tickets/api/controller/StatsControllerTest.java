package com.tickets.api.controller;

import com.tickets.api.dto.stats.*;
import com.tickets.api.service.StatsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StatsControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StatsService statsService;

    @InjectMocks
    private StatsController statsController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(statsController).build();
    }

    @Test
    void getOverview_shouldReturn200() throws Exception {
        CategoryStatsDto categoryStats = new CategoryStatsDto("c1", "Category 1", 20L, 50);
        StatsOverviewDto overview = new StatsOverviewDto(
                10L,  // locationsCount
                30L,  // activeReportsCount
                50L,  // usersCount
                Arrays.asList(categoryStats)
        );

        when(statsService.getOverview()).thenReturn(overview);

        mockMvc.perform(get("/stats/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.locationsCount").value(10))
                .andExpect(jsonPath("$.activeReportsCount").value(30))
                .andExpect(jsonPath("$.usersCount").value(50))
                .andExpect(jsonPath("$.categoriesBreakdown[0].categoryName").value("Category 1"));

        verify(statsService, times(1)).getOverview();
    }

    @Test
    void getDashboardStats_withoutUserId_shouldReturn200() throws Exception {
        StatusBreakdownDto statusBreakdown = new StatusBreakdownDto(20L, 15L, 25L, 30L, 10L);
        DashboardStatsDto dashboardStats = new DashboardStatsDto(
                100L,  // totalReports
                20L,   // pendingReports
                55L,   // resolvedReports
                55.0,  // resolutionRate
                Collections.emptyList(),
                Collections.emptyList(),
                statusBreakdown
        );

        when(statsService.getDashboardStats(null)).thenReturn(dashboardStats);

        mockMvc.perform(get("/stats/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalReports").value(100))
                .andExpect(jsonPath("$.pendingReports").value(20))
                .andExpect(jsonPath("$.resolvedReports").value(55))
                .andExpect(jsonPath("$.resolutionRate").value(55.0));

        verify(statsService, times(1)).getDashboardStats(null);
    }

    @Test
    void getDashboardStats_withUserId_shouldReturn200() throws Exception {
        StatusBreakdownDto statusBreakdown = new StatusBreakdownDto(3L, 2L, 5L, 0L, 0L);
        DashboardStatsDto dashboardStats = new DashboardStatsDto(
                10L,   // totalReports
                3L,    // pendingReports
                5L,    // resolvedReports
                50.0,  // resolutionRate
                Collections.emptyList(),
                Collections.emptyList(),
                statusBreakdown
        );

        when(statsService.getDashboardStats("user1")).thenReturn(dashboardStats);

        mockMvc.perform(get("/stats/dashboard")
                .param("userId", "user1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalReports").value(10))
                .andExpect(jsonPath("$.pendingReports").value(3))
                .andExpect(jsonPath("$.resolvedReports").value(5))
                .andExpect(jsonPath("$.resolutionRate").value(50.0));

        verify(statsService, times(1)).getDashboardStats("user1");
    }
}
