// tickets-transporte-publico/apps/api-java/src/main/java/com/tickets/api/repository/NotificationRepository.java
package com.tickets.api.repository;

import com.tickets.api.model.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

  Page<Notification> findByRecipientIdOrderBySentAtDesc(String recipientId, Pageable pageable);

  List<Notification> findByRecipientIdAndIsReadFalseOrderBySentAtDesc(String recipientId);

  long countByRecipientIdAndIsReadFalse(String recipientId);
}