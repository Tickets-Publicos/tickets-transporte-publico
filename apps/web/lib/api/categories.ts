// tickets-transporte-publico/apps/web/lib/api/categories.ts
import { apiRequest } from './config'
import type { Category, CreateCategoryDto } from './types'

export const categoriesApi = {
  /**
   * Criar nova categoria
   */
  async create(data: CreateCategoryDto): Promise<Category> {
    return apiRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Listar todas as categorias
   */
  async findAll(): Promise<Category[]> {
    return apiRequest<Category[]>('/categories')
  },

  /**
   * Buscar categoria por ID
   */
  async findById(id: string): Promise<Category> {
    return apiRequest<Category>(`/categories/${id}`)
  },

  /**
   * Atualizar categoria
   */
  async update(id: string, data: CreateCategoryDto): Promise<Category> {
    return apiRequest<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * Deletar categoria
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/categories/${id}`, {
      method: 'DELETE',
    })
  },
}