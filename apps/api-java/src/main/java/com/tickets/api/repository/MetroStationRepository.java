// tickets-transporte-publico/apps/api-java/src/main/java/com/tickets/api/repository/MetroStationRepository.java
package com.tickets.api.repository;

import com.tickets.api.model.entity.MetroStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetroStationRepository extends JpaRepository<MetroStation, String> {

  List<MetroStation> findByLine(String line);
}