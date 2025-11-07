package com.tickets.api.controller;

import com.tickets.api.annotation.RequireRole;
import com.tickets.api.dto.location.CreateLocationDto;
import com.tickets.api.dto.location.LocationResponseDto;
import com.tickets.api.model.enums.UserRole;
import com.tickets.api.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/locations")
@RequiredArgsConstructor
public class LocationController {

  private final LocationService locationService;

  /**
   * Cria uma nova localização.
   * Apenas administradores podem criar localizações.
   */
  @RequireRole({ UserRole.ADMIN })
  @PostMapping
  public ResponseEntity<LocationResponseDto> create(@Valid @RequestBody CreateLocationDto dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(locationService.create(dto));
  }

  /**
   * Lista todas as localizações.
   * Qualquer usuário autenticado pode listar localizações.
   */
  @GetMapping
  public ResponseEntity<List<LocationResponseDto>> findAll() {
    return ResponseEntity.ok(locationService.findAll());
  }

  /**
   * Busca uma localização por ID.
   * Qualquer usuário autenticado pode visualizar localizações.
   */
  @GetMapping("/{id}")
  public ResponseEntity<LocationResponseDto> findById(@PathVariable String id) {
    return ResponseEntity.ok(locationService.findById(id));
  }

  /**
   * Atualiza uma localização.
   * Apenas administradores podem atualizar localizações.
   */
  @RequireRole({ UserRole.ADMIN })
  @PatchMapping("/{id}")
  public ResponseEntity<LocationResponseDto> update(@PathVariable String id,
      @Valid @RequestBody CreateLocationDto dto) {
    return ResponseEntity.ok(locationService.update(id, dto));
  }

  /**
   * Deleta uma localização.
   * Apenas administradores podem deletar localizações.
   */
  @RequireRole({ UserRole.ADMIN })
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    locationService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
