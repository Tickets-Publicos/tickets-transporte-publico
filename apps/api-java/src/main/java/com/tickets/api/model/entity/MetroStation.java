package com.tickets.api.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "metro_stations")
@PrimaryKeyJoinColumn(name = "location_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MetroStation extends Location {

  @Column(nullable = false)
  private String line; // Ex: "Linha 1 - Azul", "Linha 2 - Verde"

  @Column(nullable = false)
  private String platform; // Plataforma: "Central", "Lado A", "Lado B"

  @Column(name = "has_accessibility", nullable = false)
  @Builder.Default
  private Boolean hasAccessibility = false; // Possui recursos de acessibilidade

  @Column(name = "has_elevator")
  @Builder.Default
  private Boolean hasElevator = false;

  @Column(name = "has_escalator")
  @Builder.Default
  private Boolean hasEscalator = false;
}