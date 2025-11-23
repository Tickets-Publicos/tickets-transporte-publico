package com.tickets.api.service;

import com.tickets.api.dto.location.CreateLocationDto;
import com.tickets.api.dto.location.LocationResponseDto;
import com.tickets.api.exception.ResourceNotFoundException;
import com.tickets.api.model.entity.Location;
import com.tickets.api.model.entity.User;
import com.tickets.api.repository.LocationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LocationServiceTest {

    @Mock
    private LocationRepository locationRepository;

    @InjectMocks
    private LocationService locationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void create_shouldSaveLocationAndReturnDto() {
        // Arrange
        CreateLocationDto dto = new CreateLocationDto();
        dto.setName("Test Location");
        dto.setAddress("123 Test St");
        dto.setLatitude(-23.5505);
        dto.setLongitude(-46.6333);
        dto.setType("station");
        dto.setDescription("Test description");

        Location savedLocation = Location.builder()
                .id("l1")
                .name("Test Location")
                .address("123 Test St")
                .latitude(-23.5505)
                .longitude(-46.6333)
                .type("station")
                .description("Test description")
                .build();

        when(locationRepository.save(any(Location.class))).thenReturn(savedLocation);

        // Act
        LocationResponseDto result = locationService.create(dto);

        // Assert
        assertNotNull(result);
        assertEquals("l1", result.getId());
        assertEquals("Test Location", result.getName());
        assertEquals("123 Test St", result.getAddress());
        assertEquals(-23.5505, result.getLatitude());
        assertEquals(-46.6333, result.getLongitude());
        assertEquals("station", result.getType());
        assertEquals("Test description", result.getDescription());
        verify(locationRepository, times(1)).save(any(Location.class));
    }

    @Test
    void findAll_shouldReturnAllLocations() {
        // Arrange
        Location loc1 = Location.builder()
                .id("l1")
                .name("Location 1")
                .address("Address 1")
                .latitude(-23.5505)
                .longitude(-46.6333)
                .type("station")
                .build();

        Location loc2 = Location.builder()
                .id("l2")
                .name("Location 2")
                .address("Address 2")
                .latitude(-23.5605)
                .longitude(-46.6433)
                .type("terminal")
                .build();

        when(locationRepository.findAll()).thenReturn(Arrays.asList(loc1, loc2));

        // Act
        List<LocationResponseDto> result = locationService.findAll();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("l1", result.get(0).getId());
        assertEquals("l2", result.get(1).getId());
        verify(locationRepository, times(1)).findAll();
    }

    @Test
    void findById_shouldReturnLocation() {
        // Arrange
        Location location = Location.builder()
                .id("l1")
                .name("Test Location")
                .address("123 Test St")
                .latitude(-23.5505)
                .longitude(-46.6333)
                .type("station")
                .description("Test description")
                .build();

        when(locationRepository.findById("l1")).thenReturn(Optional.of(location));

        // Act
        LocationResponseDto result = locationService.findById("l1");

        // Assert
        assertNotNull(result);
        assertEquals("l1", result.getId());
        assertEquals("Test Location", result.getName());
        assertEquals("123 Test St", result.getAddress());
        verify(locationRepository, times(1)).findById("l1");
    }

    @Test
    void findById_withNonExistentId_shouldThrowResourceNotFoundException() {
        // Arrange
        when(locationRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> locationService.findById("nonexistent"));
        verify(locationRepository, times(1)).findById("nonexistent");
    }

    @Test
    void update_shouldUpdateLocationAndReturnDto() {
        // Arrange
        Location existingLocation = Location.builder()
                .id("l1")
                .name("Old Name")
                .address("Old Address")
                .latitude(-23.5505)
                .longitude(-46.6333)
                .type("station")
                .description("Old description")
                .build();

        CreateLocationDto dto = new CreateLocationDto();
        dto.setName("New Name");
        dto.setAddress("New Address");
        dto.setLatitude(-23.5605);
        dto.setLongitude(-46.6433);
        dto.setType("terminal");
        dto.setDescription("New description");

        when(locationRepository.findById("l1")).thenReturn(Optional.of(existingLocation));
        when(locationRepository.save(any(Location.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        LocationResponseDto result = locationService.update("l1", dto);

        // Assert
        assertNotNull(result);
        assertEquals("l1", result.getId());
        assertEquals("New Name", result.getName());
        assertEquals("New Address", result.getAddress());
        assertEquals(-23.5605, result.getLatitude());
        assertEquals(-46.6433, result.getLongitude());
        assertEquals("terminal", result.getType());
        assertEquals("New description", result.getDescription());
        verify(locationRepository, times(1)).findById("l1");
        verify(locationRepository, times(1)).save(any(Location.class));
    }

    @Test
    void update_withNonExistentId_shouldThrowResourceNotFoundException() {
        // Arrange
        CreateLocationDto dto = new CreateLocationDto();
        dto.setName("New Name");
        dto.setAddress("New Address");

        when(locationRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> locationService.update("nonexistent", dto));
        verify(locationRepository, never()).save(any(Location.class));
    }

    @Test
    void delete_shouldDeleteLocation() {
        // Arrange
        when(locationRepository.existsById("l1")).thenReturn(true);

        // Act
        locationService.delete("l1");

        // Assert
        verify(locationRepository, times(1)).existsById("l1");
        verify(locationRepository, times(1)).deleteById("l1");
    }

    @Test
    void delete_withNonExistentId_shouldThrowResourceNotFoundException() {
        // Arrange
        when(locationRepository.existsById("nonexistent")).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> locationService.delete("nonexistent"));
        verify(locationRepository, never()).deleteById(anyString());
    }

    @Test
    void findById_withAdmin_shouldIncludeAdminInfo() {
        // Arrange
        User admin = User.builder()
                .id("u1")
                .name("Admin User")
                .build();

        Location location = Location.builder()
                .id("l1")
                .name("Test Location")
                .address("123 Test St")
                .latitude(-23.5505)
                .longitude(-46.6333)
                .type("station")
                .admin(admin)
                .build();

        when(locationRepository.findById("l1")).thenReturn(Optional.of(location));

        // Act
        LocationResponseDto result = locationService.findById("l1");

        // Assert
        assertNotNull(result);
        assertEquals("l1", result.getId());
        assertEquals("u1", result.getAdminId());
        assertEquals("Admin User", result.getAdminName());
    }
}
