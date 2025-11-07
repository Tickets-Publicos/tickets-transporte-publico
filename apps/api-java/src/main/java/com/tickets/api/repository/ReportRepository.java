package com.tickets.api.repository;

import com.tickets.api.model.entity.Report;
import com.tickets.api.model.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.tickets.api.repository.projection.CategoryCountProjection;
import com.tickets.api.repository.projection.LocationTypeCountProjection;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {

  Page<Report> findByStatus(ReportStatus status, Pageable pageable);

  Page<Report> findByLocationId(String locationId, Pageable pageable);

  Page<Report> findByCategoryId(String categoryId, Pageable pageable);

  Page<Report> findByAuthorId(String authorId, Pageable pageable);

  @Query("SELECT r FROM Report r WHERE " +
      "(:status IS NULL OR r.status = :status) AND " +
      "(:locationId IS NULL OR r.location.id = :locationId) AND " +
      "(:categoryId IS NULL OR r.category.id = :categoryId) AND " +
      "(:authorId IS NULL OR r.author.id = :authorId)")
  Page<Report> findByFilters(
      @Param("status") ReportStatus status,
      @Param("locationId") String locationId,
      @Param("categoryId") String categoryId,
      @Param("authorId") String authorId,
      Pageable pageable);

  @Query("SELECT r.category.id as categoryId, r.category.name as categoryName, COUNT(r) as count " +
      "FROM Report r GROUP BY r.category.id, r.category.name")
  List<CategoryCountProjection> countReportsByCategory();

  @Query("SELECT COUNT(r) FROM Report r WHERE r.status NOT IN :excluded")
  long countByStatusNotIn(@Param("excluded") List<ReportStatus> excluded);

  @Query("SELECT l.type as type, COUNT(r) as count, " +
      "(SELECT COUNT(loc) FROM Location loc WHERE loc.type = l.type) as totalLocations " +
      "FROM Report r JOIN r.location l GROUP BY l.type")
  List<LocationTypeCountProjection> countReportsByLocationType();

  long countByStatus(ReportStatus status);
}
