// tickets-transporte-publico/apps/web/lib/api/stats.ts
import { apiRequest } from './config'
import type { StatsOverview } from './types'

export const statsApi = {
  async getOverview(): Promise<StatsOverview> {
    return apiRequest<StatsOverview>('/stats/overview')
  },
}
