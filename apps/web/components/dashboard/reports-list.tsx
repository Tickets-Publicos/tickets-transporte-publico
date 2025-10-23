"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, MapPin, AlertTriangle, Eye } from "lucide-react"
import {
  getAllReports,
  getReportStatusColor,
  getReportStatusLabel,
  getProblemCategoryById,
  type Report,
} from "@/lib/reports"
import { getLocationById, getLocationTypeName } from "@/lib/locations"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ReportsListProps {
  userReports?: boolean
  userId?: string
  className?: string
}

export function ReportsList({ userReports = false, userId, className }: ReportsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const allReports = getAllReports()
  const reports = userReports && userId ? allReports.filter((report) => String(report.user_id) === userId) : allReports

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      !searchQuery ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || report.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getReportLocation = (locationId: number) => {
    return getLocationById(locationId)
  }

  const getReportCategory = (categoryId: number) => {
    return getProblemCategoryById(categoryId)
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      })
    } catch {
      return "Data inválida"
    }
  }

  const statusCounts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    "in-progress": reports.filter((r) => r.status === "in-progress").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  }

  return (
    <div className={className}>
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos ({statusCounts.all})</SelectItem>
                <SelectItem value="pending">Pendente ({statusCounts.pending})</SelectItem>
                <SelectItem value="in-progress">Em Andamento ({statusCounts["in-progress"]})</SelectItem>
                <SelectItem value="resolved">Resolvido ({statusCounts.resolved})</SelectItem>
                <SelectItem value="rejected">Rejeitado ({statusCounts.rejected})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Cards */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum reporte encontrado</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery || statusFilter !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : userReports
                      ? "Você ainda não fez nenhum reporte"
                      : "Nenhum reporte foi registrado ainda"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => {
              const location = getReportLocation(report.location_id)
              const category = getReportCategory(report.problem_category_id)

              return (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                    selectedReport?.id === report.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight mb-2">{report.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(report.created_at)}</span>
                          <span>•</span>
                          <span>#{report.id}</span>
                        </div>
                      </div>
                      <Badge className={getReportStatusColor(report.status)}>
                        {getReportStatusLabel(report.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Location */}
                      {location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{location.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {getLocationTypeName(location.location_type_id)}
                          </Badge>
                        </div>
                      )}

                      {/* Category */}
                      {category && (
                        <div className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <span>{category.name}</span>
                        </div>
                      )}

                      {/* Description Preview */}
                      <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>

                      {/* View Details Button */}
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Eye className="h-3 w-3 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Report Details Panel */}
        <div className="lg:sticky lg:top-4">
          {selectedReport ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl leading-tight">{selectedReport.title}</CardTitle>
                    <CardDescription className="mt-2">
                      Reporte #{selectedReport.id} • {formatDate(selectedReport.created_at)}
                    </CardDescription>
                  </div>
                  <Badge className={getReportStatusColor(selectedReport.status)}>
                    {getReportStatusLabel(selectedReport.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Location Details */}
                {(() => {
                  const location = getReportLocation(selectedReport.location_id)
                  return location ? (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Local
                      </h4>
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{location.name}</span>
                          <Badge variant="outline">{getLocationTypeName(location.location_type_id)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{location.address}</p>
                      </div>
                    </div>
                  ) : null
                })()}

                {/* Category Details */}
                {(() => {
                  const category = getReportCategory(selectedReport.problem_category_id)
                  return category ? (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Categoria
                      </h4>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  ) : null
                })()}

                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Descrição do Problema</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedReport.description}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-medium mb-2">Histórico</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">{formatDate(selectedReport.created_at)}</span>
                      <span>Reporte criado</span>
                    </div>
                    {selectedReport.updated_at !== selectedReport.created_at && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        <span className="text-muted-foreground">{formatDate(selectedReport.updated_at)}</span>
                        <span>Última atualização</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione um reporte</h3>
                <p className="text-muted-foreground text-center">
                  Clique em um reporte da lista para ver os detalhes completos
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
