// tickets-transporte-publico/apps/api-java/src/main/java/com/tickets/api/model/entity/Organization.java
package com.tickets.api.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organizations", indexes = {
    @Index(name = "idx_org_cnpj", columnList = "cnpj", unique = true),
    @Index(name = "idx_org_name", columnList = "name")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;

    @Column(nullable = false)
    private String type; // Ex: "Prefeitura", "Empresa de Transporte", etc.

    @Column(name = "main_contact", nullable = false)
    private String mainContact; // Email ou telefone principal

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;

    // Relações
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    @Builder.Default
    private List<User> administrators = new ArrayList<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Location> managedLocations = new ArrayList<>();
}