package com.tickets.api.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "bus_stops")
@PrimaryKeyJoinColumn(name = "location_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class BusStop extends Location {

  @Column(name = "municipal_code", unique = true)
  private String municipalCode; // Código municipal do ponto

  @Column(nullable = false)
  private String direction; // Sentido: "Centro-Bairro", "Bairro-Centro", etc.

  @Column(name = "has_shelter")
  @Builder.Default
  private Boolean hasShelter = false; // Possui abrigo/cobertura

  @Column(name = "has_bench")
  @Builder.Default
  private Boolean hasBench = false; // Possui banco
}