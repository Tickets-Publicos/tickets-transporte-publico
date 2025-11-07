package com.tickets.api.service;

import com.tickets.api.dto.location.CreateLocationDto;
import com.tickets.api.dto.location.LocationResponseDto;
import com.tickets.api.exception.ResourceNotFoundException;
import com.tickets.api.model.entity.Location;
import com.tickets.api.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;

    @Transactional
    public LocationResponseDto create(CreateLocationDto dto) {
        Location l = Location.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .type(dto.getType())
                .description(dto.getDescription())
                .build();

        Location saved = locationRepository.save(l);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<LocationResponseDto> findAll() {
        return locationRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LocationResponseDto findById(String id) {
        Location l = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Localização não encontrada"));
        return mapToDto(l);
    }

    @Transactional
    public LocationResponseDto update(String id, CreateLocationDto dto) {
        Location l = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Localização não encontrada"));

        l.setName(dto.getName());
        l.setAddress(dto.getAddress());
        l.setLatitude(dto.getLatitude());
        l.setLongitude(dto.getLongitude());
        l.setType(dto.getType());
        l.setDescription(dto.getDescription());

        // opcional: vincular admin
        if (dto.getDescription() != null) {
            // nada especial aqui
        }

        Location updated = locationRepository.save(l);
        return mapToDto(updated);
    }

    @Transactional
    public void delete(String id) {
        if (!locationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Localização não encontrada");
        }
        locationRepository.deleteById(id);
    }

    private LocationResponseDto mapToDto(Location l) {
        LocationResponseDto dto = new LocationResponseDto();
        dto.setId(l.getId());
        dto.setName(l.getName());
        dto.setAddress(l.getAddress());
        dto.setLatitude(l.getLatitude());
        dto.setLongitude(l.getLongitude());
        dto.setType(l.getType());
        dto.setDescription(l.getDescription());
        dto.setCreatedAt(l.getCreatedAt());
        dto.setUpdatedAt(l.getUpdatedAt());
        if (l.getAdmin() != null) {
            dto.setAdminId(l.getAdmin().getId());
            dto.setAdminName(l.getAdmin().getName());
        }
        return dto;
    }
}
