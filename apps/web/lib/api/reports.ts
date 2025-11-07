// tickets-transporte-publico/apps/web/lib/api/reports.ts
import { apiRequest } from './config'
import type { Report, CreateReportDto, UpdateStatusDto, PageResponse, ReportFilters } from './types'

export const reportsApi = {
  /**
   * Criar novo reporte
   */
  async create(data: CreateReportDto): Promise<Report> {
    return apiRequest<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Listar reportes com filtros e paginação
   */
  async findAll(filters?: ReportFilters): Promise<PageResponse<Report>> {
    const params = new URLSearchParams()
    
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.locationId) params.append('locationId', filters.locationId)
    if (filters?.categoryId) params.append('categoryId', filters.categoryId)
    if (filters?.authorId) params.append('authorId', filters.authorId)

    const queryString = params.toString()
    const endpoint = queryString ? `/reports?${queryString}` : '/reports'

    return apiRequest<PageResponse<Report>>(endpoint)
  },

  /**
   * Buscar reporte por ID
   */
  async findById(id: string): Promise<Report> {
    return apiRequest<Report>(`/reports/${id}`)
  },

  /**
   * Atualizar status do reporte
   */
  async updateStatus(id: string, data: UpdateStatusDto): Promise<Report> {
    return apiRequest<Report>(`/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
}