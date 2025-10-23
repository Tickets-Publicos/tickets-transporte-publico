"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Clock, XCircle, MapPin, TrendingUp, Calendar } from "lucide-react"
import { getAllReports, problemCategories } from "@/lib/reports"
import { locations, locationTypes } from "@/lib/locations"

interface DashboardStatsProps {
  userReports?: boolean
  userId?: string
  className?: string
}

export function DashboardStats({ userReports = false, userId, className }: DashboardStatsProps) {
  const allReports = getAllReports()
  const reports = userReports && userId ? allReports.filter((report) => String(report.user_id) === userId) : allReports

  // Status counts
  const statusCounts = {
    pending: reports.filter((r) => r.status === "pending").length,
    inProgress: reports.filter((r) => r.status === "in-progress").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  }

  const totalReports = reports.length
  const resolutionRate = totalReports > 0 ? (statusCounts.resolved / totalReports) * 100 : 0

  // Category distribution
  const categoryStats = problemCategories
    .map((category) => {
      const count = reports.filter((r) => r.problem_category_id === category.id).length
      const percentage = totalReports > 0 ? (count / totalReports) * 100 : 0
      return {
        ...category,
        count,
        percentage,
      }
    })
    .filter((stat) => stat.count > 0)
    .sort((a, b) => b.count - a.count)

  // Location type distribution
  const locationTypeStats = locationTypes.map((type) => {
    const typeLocations = locations.filter((l) => l.location_type_id === type.id)
    const count = reports.filter((r) => {
      const location = locations.find((l) => l.id === r.location_id)
      return location?.location_type_id === type.id
    }).length
    return {
      ...type,
      count,
      totalLocations: typeLocations.length,
    }
  })

  return (
    <div className={className}>
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Reportes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">{userReports ? "Seus reportes" : "Reportes no sistema"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <p className="text-xs text-muted-foreground">Aguardando análise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts.resolved}</div>
            <p className="text-xs text-muted-foreground">Problemas solucionados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolutionRate.toFixed(1)}%</div>
            <Progress value={resolutionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Problemas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum reporte encontrado</p>
            ) : (
              <div className="space-y-4">
                {categoryStats.map((stat) => (
                  <div key={stat.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {stat.count} ({stat.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={stat.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Reportes por Tipo de Local
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationTypeStats.map((stat) => (
                <div key={stat.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{stat.name}</p>
                    <p className="text-sm text-muted-foreground">{stat.totalLocations} locais cadastrados</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{stat.count}</div>
                    <p className="text-xs text-muted-foreground">reportes</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Status dos Reportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{statusCounts.resolved}</div>
              <p className="text-sm text-muted-foreground">Resolvidos</p>
            </div>

            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
              <p className="text-sm text-muted-foreground">Rejeitados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
