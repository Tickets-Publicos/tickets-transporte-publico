// tickets-transporte-publico/apps/web/lib/api/config.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new ApiError(response.status, error.message || 'An error occurred', error)
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return {} as T
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${apiConfig.baseURL}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    return handleResponse<T>(response)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, 'Network error', error)
  }
}