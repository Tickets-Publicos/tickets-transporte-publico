// tickets-transporte-publico/apps/api-java/src/main/java/com/tickets/api/model/entity/Evidence.java
package com.tickets.api.model.entity;

import com.tickets.api.model.enums.MediaType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "evidences", indexes = {
    @Index(name = "idx_evidence_report", columnList = "report_id"),
    @Index(name = "idx_evidence_type", columnList = "type")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MediaType type;

    @Column(nullable = false)
    private String url; // URL do arquivo armazenado (S3, MinIO, etc.)

    @Column(name = "size_kb")
    private Integer sizeKb; // Tamanho em KB

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "mime_type")
    private String mimeType; // Ex: "image/jpeg", "video/mp4"

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    // Relações
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;
}