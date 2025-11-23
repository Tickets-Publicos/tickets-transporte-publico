package com.tickets.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tickets.api.dto.location.CreateLocationDto;
import com.tickets.api.dto.location.LocationResponseDto;
import com.tickets.api.service.LocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LocationControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper mapper = new ObjectMapper();

    @Mock
    private LocationService locationService;

    @InjectMocks
    private LocationController locationController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(locationController).build();
    }

    @Test
    void create_shouldReturn201() throws Exception {
        CreateLocationDto dto = new CreateLocationDto();
        dto.setName("Test Station");
        dto.setAddress("123 Test St");
        dto.setLatitude(-23.5505);
        dto.setLongitude(-46.6333);
        dto.setType("station");

        LocationResponseDto responseDto = new LocationResponseDto();
        responseDto.setId("l1");
        responseDto.setName("Test Station");

        when(locationService.create(any(CreateLocationDto.class))).thenReturn(responseDto);

        mockMvc.perform(post("/locations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("l1"))
                .andExpect(jsonPath("$.name").value("Test Station"));

        verify(locationService, times(1)).create(any(CreateLocationDto.class));
    }

    @Test
    void findAll_shouldReturn200() throws Exception {
        LocationResponseDto loc1 = new LocationResponseDto();
        loc1.setId("l1");
        loc1.setName("Location 1");

        LocationResponseDto loc2 = new LocationResponseDto();
        loc2.setId("l2");
        loc2.setName("Location 2");

        when(locationService.findAll()).thenReturn(Arrays.asList(loc1, loc2));

        mockMvc.perform(get("/locations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("l1"))
                .andExpect(jsonPath("$[1].id").value("l2"));

        verify(locationService, times(1)).findAll();
    }

    @Test
    void findById_shouldReturn200() throws Exception {
        LocationResponseDto responseDto = new LocationResponseDto();
        responseDto.setId("l1");
        responseDto.setName("Test Location");

        when(locationService.findById("l1")).thenReturn(responseDto);

        mockMvc.perform(get("/locations/l1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("l1"))
                .andExpect(jsonPath("$.name").value("Test Location"));

        verify(locationService, times(1)).findById("l1");
    }

    @Test
    void update_shouldReturn200() throws Exception {
        CreateLocationDto dto = new CreateLocationDto();
        dto.setName("Updated Location");
        dto.setAddress("456 New St");
        dto.setLatitude(-23.5605);
        dto.setLongitude(-46.6433);
        dto.setType("terminal");

        LocationResponseDto responseDto = new LocationResponseDto();
        responseDto.setId("l1");
        responseDto.setName("Updated Location");

        when(locationService.update(eq("l1"), any(CreateLocationDto.class))).thenReturn(responseDto);

        mockMvc.perform(patch("/locations/l1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Location"));

        verify(locationService, times(1)).update(eq("l1"), any(CreateLocationDto.class));
    }

    @Test
    void delete_shouldReturn204() throws Exception {
        doNothing().when(locationService).delete("l1");

        mockMvc.perform(delete("/locations/l1"))
                .andExpect(status().isNoContent());

        verify(locationService, times(1)).delete("l1");
    }
}
