// tickets-transporte-publico/apps/web/lib/api/stats.ts
import { apiRequest } from './config'
import type { StatsOverview, DashboardStats } from './types'

export const statsApi = {
  async getOverview(): Promise<StatsOverview> {
    return apiRequest<StatsOverview>('/stats/overview')
  },

  async getDashboardStats(userId?: string): Promise<DashboardStats> {
    const params = userId ? `?userId=${userId}` : ''
    return apiRequest<DashboardStats>(`/stats/dashboard${params}`)
  },
}
