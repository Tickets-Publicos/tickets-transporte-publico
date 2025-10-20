// tickets-transporte-publico/apps/web/lib/api/types.ts
export enum UserRole {
  PEDESTRIAN = 'PEDESTRIAN',
  ADMIN = 'ADMIN',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  IN_ANALYSIS = 'IN_ANALYSIS',
  RESOLVED_PROVISIONAL = 'RESOLVED_PROVISIONAL',
  RESOLVED_CONFIRMED = 'RESOLVED_CONFIRMED',
  ARCHIVED = 'ARCHIVED',
}

export enum CategoryType {
  RAMP = 'RAMP',
  TACTILE_FLOOR = 'TACTILE_FLOOR',
  ELEVATOR = 'ELEVATOR',
  SIGNAGE = 'SIGNAGE',
  ACCESSIBILITY = 'ACCESSIBILITY',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  OTHER = 'OTHER',
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  name: string
  role?: UserRole
}

export interface Category {
  id: string
  name: string
  type: CategoryType
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryDto {
  name: string
  type: CategoryType
  description?: string
}

export interface Location {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  type: string
  description?: string
  createdAt: string
  updatedAt: string
  adminId?: string
  adminName?: string
}

export interface CreateLocationDto {
  name: string
  address: string
  latitude: number
  longitude: number
  type: string
  description?: string
}

export interface Report {
  id: string
  title: string
  description: string
  status: ReportStatus
  imageUrl?: string
  createdAt: string
  updatedAt: string
  authorId: string
  authorName: string
  locationId: string
  locationName: string
  categoryId: string
  categoryName: string
}

export interface CreateReportDto {
  title: string
  description: string
  imageUrl?: string
  authorId: string
  locationId: string
  categoryId: string
}

export interface UpdateStatusDto {
  status: ReportStatus
  comment?: string
  updatedBy: string
}

export interface PageResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ReportFilters {
  page?: number
  limit?: number
  status?: ReportStatus
  locationId?: string
  categoryId?: string
  authorId?: string
}