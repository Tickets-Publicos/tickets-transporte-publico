// tickets-transporte-publico/apps/api-java/src/main/java/com/tickets/api/repository/EvidenceRepository.java
package com.tickets.api.repository;

import com.tickets.api.model.entity.Evidence;
import com.tickets.api.model.enums.MediaType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, String> {

  List<Evidence> findByReportId(String reportId);

  List<Evidence> findByReportIdAndType(String reportId, MediaType type);
}