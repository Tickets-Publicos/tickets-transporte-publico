// tickets-transporte-publico/apps/web/lib/api/users.ts
import { apiRequest } from './config'
import type { User, CreateUserDto } from './types'

export const usersApi = {
  /**
   * Criar novo usuário
   */
  async create(data: CreateUserDto): Promise<User> {
    return apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Listar todos os usuários
   */
  async findAll(): Promise<User[]> {
    return apiRequest<User[]>('/users')
  },

  /**
   * Buscar usuário por ID
   */
  async findById(id: string): Promise<User> {
    return apiRequest<User>(`/users/${id}`)
  },

  /**
   * Buscar usuário por email
   */
  async findByEmail(email: string): Promise<User> {
    return apiRequest<User>(`/users/email/${encodeURIComponent(email)}`)
  },

  /**
   * Atualizar usuário
   */
  async update(id: string, data: Partial<CreateUserDto>): Promise<User> {
    return apiRequest<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * Deletar usuário
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    })
  },
}