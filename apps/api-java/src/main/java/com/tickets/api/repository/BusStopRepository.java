// tickets-transporte-publico/apps/api-java/src/main/java/com/tickets/api/repository/BusStopRepository.java
package com.tickets.api.repository;

import com.tickets.api.model.entity.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusStopRepository extends JpaRepository<BusStop, String> {

  Optional<BusStop> findByMunicipalCode(String municipalCode);
}