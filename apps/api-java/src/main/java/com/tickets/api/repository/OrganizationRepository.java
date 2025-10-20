// tickets-transporte-publico/apps/api-java/src/main/java/com/tickets/api/repository/OrganizationRepository.java
package com.tickets.api.repository;

import com.tickets.api.model.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, String> {

  Optional<Organization> findByCnpj(String cnpj);

  boolean existsByCnpj(String cnpj);
}