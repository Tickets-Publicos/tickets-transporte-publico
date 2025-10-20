// tickets-transporte-publico/apps/web/lib/api/locations.ts
import { apiRequest } from './config'
import type { Location, CreateLocationDto } from './types'

export const locationsApi = {
  /**
   * Criar nova localização
   */
  async create(data: CreateLocationDto): Promise<Location> {
    return apiRequest<Location>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Listar todas as localizações
   */
  async findAll(): Promise<Location[]> {
    return apiRequest<Location[]>('/locations')
  },

  /**
   * Buscar localização por ID
   */
  async findById(id: string): Promise<Location> {
    return apiRequest<Location>(`/locations/${id}`)
  },

  /**
   * Atualizar localização
   */
  async update(id: string, data: CreateLocationDto): Promise<Location> {
    return apiRequest<Location>(`/locations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * Deletar localização
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/locations/${id}`, {
      method: 'DELETE',
    })
  },
}