package com.tickets.api.service;

import com.tickets.api.dto.common.PageResponseDto;
import com.tickets.api.dto.report.ApproveReportDto;
import com.tickets.api.dto.report.CreateReportDto;
import com.tickets.api.dto.report.RejectReportDto;
import com.tickets.api.dto.report.ReportResponseDto;
import com.tickets.api.dto.report.UpdateStatusDto;
import com.tickets.api.exception.ResourceNotFoundException;
import com.tickets.api.model.entity.Category;
import com.tickets.api.model.entity.Location;
import com.tickets.api.model.entity.Report;
import com.tickets.api.model.entity.StatusHistory;
import com.tickets.api.model.entity.User;
import com.tickets.api.model.enums.ReportStatus;
import com.tickets.api.repository.CategoryRepository;
import com.tickets.api.repository.LocationRepository;
import com.tickets.api.repository.ReportRepository;
import com.tickets.api.repository.StatusHistoryRepository;
import com.tickets.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final CategoryRepository categoryRepository;
    private final StatusHistoryRepository statusHistoryRepository;

    @Transactional
    public ReportResponseDto create(CreateReportDto dto) {
        User author = userRepository.findById(dto.getAuthorId())
                .orElseThrow(() -> new ResourceNotFoundException("Autor não encontrado"));
        Location location = locationRepository.findById(dto.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Localização não encontrada"));
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        Report report = Report.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .author(author)
                .location(location)
                .category(category)
                .build();

        Report saved = reportRepository.save(report);

        // criar status history inicial
        StatusHistory sh = StatusHistory.builder()
                .report(saved)
                .status(ReportStatus.PENDING)
                .comment("Report criado")
                .user(author)
                .build();
        statusHistoryRepository.save(sh);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public PageResponseDto<ReportResponseDto> findAll(
            Integer page,
            Integer limit,
            ReportStatus status,
            String locationId,
            String categoryId,
            String authorId
    ) {
        int p = (page == null || page < 1) ? 1 : page;
        int l = (limit == null || limit < 1) ? 10 : limit;
        Pageable pageable = PageRequest.of(p - 1, l);

        Page<Report> pageRes = reportRepository.findByFilters(status, locationId, categoryId, authorId, pageable);
        List<ReportResponseDto> data = pageRes.getContent().stream().map(this::mapToDto).collect(Collectors.toList());

        return new PageResponseDto<>(data, pageRes.getTotalElements(), p, l, pageRes.getTotalPages());
    }

    @Transactional(readOnly = true)
    public ReportResponseDto findById(String id) {
        Report r = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report não encontrado"));
        return mapToDto(r);
    }

    @Transactional
    public ReportResponseDto updateStatus(String id, UpdateStatusDto dto) {
        Report r = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report não encontrado"));
        User user = userRepository.findById(dto.getUpdatedBy())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        StatusHistory sh = StatusHistory.builder()
                .report(r)
                .status(dto.getStatus())
                .comment(dto.getComment())
                .user(user)
                .build();
        statusHistoryRepository.save(sh);

        r.setStatus(dto.getStatus());
        Report updated = reportRepository.save(r);
        return mapToDto(updated);
    }

    /**
     * Lista reportes pendentes de aprovação (apenas para admins)
     */
    @Transactional(readOnly = true)
    public PageResponseDto<ReportResponseDto> findPendingReports(Integer page, Integer limit) {
        int p = (page == null || page < 1) ? 1 : page;
        int l = (limit == null || limit < 1) ? 10 : limit;
        Pageable pageable = PageRequest.of(p - 1, l);

        Page<Report> pageRes = reportRepository.findByStatus(ReportStatus.PENDING, pageable);
        List<ReportResponseDto> data = pageRes.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PageResponseDto<>(data, pageRes.getTotalElements(), p, l, pageRes.getTotalPages());
    }

    /**
     * Aprova um reporte (muda status)
     */
    @Transactional
    public ReportResponseDto approveReport(String id, ApproveReportDto dto, String adminId) {
        Report r = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report não encontrado"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin não encontrado"));

        // Validar o novo status
        if (dto.getNewStatus() != ReportStatus.IN_ANALYSIS && 
            dto.getNewStatus() != ReportStatus.RESOLVED_PROVISIONAL &&
            dto.getNewStatus() != ReportStatus.RESOLVED_CONFIRMED) {
            throw new IllegalArgumentException("Status inválido para aprovação");
        }

        // Criar histórico
        StatusHistory sh = StatusHistory.builder()
                .report(r)
                .status(dto.getNewStatus())
                .comment(dto.getComment() != null ? dto.getComment() : "Reporte aprovado pelo administrador")
                .user(admin)
                .build();
        statusHistoryRepository.save(sh);

        r.setStatus(dto.getNewStatus());
        Report updated = reportRepository.save(r);
        return mapToDto(updated);
    }

    /**
     * Rejeita um reporte (arquiva com motivo)
     */
    @Transactional
    public ReportResponseDto rejectReport(String id, RejectReportDto dto, String adminId) {
        Report r = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report não encontrado"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin não encontrado"));

        // Criar histórico com motivo da rejeição
        StatusHistory sh = StatusHistory.builder()
                .report(r)
                .status(ReportStatus.ARCHIVED)
                .comment("Rejeitado: " + dto.getReason())
                .user(admin)
                .build();
        statusHistoryRepository.save(sh);

        r.setStatus(ReportStatus.ARCHIVED);
        Report updated = reportRepository.save(r);
        return mapToDto(updated);
    }

    private ReportResponseDto mapToDto(Report r) {
        ReportResponseDto dto = new ReportResponseDto();
        dto.setId(r.getId());
        dto.setTitle(r.getTitle());
        dto.setDescription(r.getDescription());
        dto.setStatus(r.getStatus());
        dto.setImageUrl(r.getImageUrl());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        dto.setAuthorId(r.getAuthor().getId());
        dto.setAuthorName(r.getAuthor().getName());
        dto.setLocationId(r.getLocation().getId());
        dto.setLocationName(r.getLocation().getName());
        dto.setCategoryId(r.getCategory().getId());
        dto.setCategoryName(r.getCategory().getName());
        return dto;
    }
}
