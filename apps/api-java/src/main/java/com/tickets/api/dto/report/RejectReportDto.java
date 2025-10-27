package com.tickets.api.dto.report;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectReportDto {
    @NotBlank(message = "Motivo da rejeição é obrigatório")
    private String reason; // Motivo da rejeição
}
