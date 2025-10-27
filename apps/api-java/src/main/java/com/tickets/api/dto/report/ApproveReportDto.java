package com.tickets.api.dto.report;

import com.tickets.api.model.enums.ReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApproveReportDto {
    @NotNull(message = "Status é obrigatório")
    private ReportStatus newStatus; // IN_ANALYSIS ou RESOLVED_PROVISIONAL
    
    private String comment; // Comentário opcional do admin
}
