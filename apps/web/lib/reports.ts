export interface ProblemCategory {
  id: number
  name: string
  description: string
}

export interface Report {
  id: number
  user_id: string
  location_id: number
  problem_category_id: number
  title: string
  description: string
  status: "pending" | "in-progress" | "resolved" | "rejected"
  created_at: string
  updated_at: string
}

export interface CreateReportData {
  user_id: string
  location_id: number
  problem_category_id: number
  title: string
  description: string
}

// Mock data based on our database schema
export const problemCategories: ProblemCategory[] = [
  { id: 1, name: "Rampa de Acesso", description: "Problemas com rampas para cadeirantes" },
  { id: 2, name: "Piso Tátil", description: "Ausência ou problemas no piso tátil para deficientes visuais" },
  { id: 3, name: "Elevador", description: "Elevadores quebrados ou inacessíveis" },
  { id: 4, name: "Sinalização", description: "Falta de sinalização adequada ou em braile" },
  { id: 5, name: "Banheiro Acessível", description: "Problemas nos banheiros adaptados" },
  { id: 6, name: "Plataforma", description: "Problemas de acesso às plataformas" },
  { id: 7, name: "Outros", description: "Outros problemas de acessibilidade" },
]

// Mock reports storage
const reports: Report[] = [
  {
    id: 1,
    user_id: "1",
    location_id: 1,
    problem_category_id: 1,
    title: "Rampa danificada no ponto da Paulista",
    description: "A rampa de acesso está com buracos e dificulta o acesso de cadeirantes",
    status: "pending",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    user_id: "2",
    location_id: 4,
    problem_category_id: 2,
    title: "Piso tátil interrompido na Estação Sé",
    description: "O piso tátil está interrompido próximo à entrada principal",
    status: "pending",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    user_id: "3",
    location_id: 8,
    problem_category_id: 3,
    title: "Elevador fora de funcionamento",
    description: "Elevador da Estação Luz não está funcionando há 3 dias",
    status: "pending",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

export function getProblemCategoryById(id: number): ProblemCategory | undefined {
  return problemCategories.find((category) => category.id === id)
}

export function getAllReports(): Report[] {
  return reports
}

export function getReportsByUser(userId: string): Report[] {
  return reports.filter((report) => report.user_id === userId)
}

export function getReportsByLocation(locationId: number): Report[] {
  return reports.filter((report) => report.location_id === locationId)
}

export async function createReport(
  data: CreateReportData,
): Promise<{ success: boolean; report?: Report; error?: string }> {
  try {
    const newReport: Report = {
      id: reports.length + 1,
      ...data,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    reports.push(newReport)

    return { success: true, report: newReport }
  } catch {
    return { success: false, error: "Erro ao criar reporte" }
  }
}

export function getReportStatusColor(status: Report["status"]): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "in-progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "resolved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

export function getReportStatusLabel(status: Report["status"]): string {
  switch (status) {
    case "pending":
      return "Pendente"
    case "in-progress":
      return "Em Andamento"
    case "resolved":
      return "Resolvido"
    case "rejected":
      return "Rejeitado"
    default:
      return "Desconhecido"
  }
}
