// tickets-transporte-publico/apps/web/lib/api/index.ts
export * from './config'
export * from './types'
export * from './users'
export * from './categories'
export * from './locations'
export * from './reports'

// Exportar tudo agrupado também
import { usersApi } from './users'
import { categoriesApi } from './categories'
import { locationsApi } from './locations'
import { reportsApi } from './reports'

export const api = {
  users: usersApi,
  categories: categoriesApi,
  locations: locationsApi,
  reports: reportsApi,
}