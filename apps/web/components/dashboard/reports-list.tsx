"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Calendar,
  MapPin,
  AlertTriangle,
  Eye,
  Loader2,
} from "lucide-react";
import { reportsApi } from "@/lib/api/reports";
import { categoriesApi } from "@/lib/api/categories";
import { locationsApi } from "@/lib/api/locations";
import type { Report, Category, Location, ReportStatus } from "@/lib/api/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportsListProps {
  userReports?: boolean;
  userId?: string;
  className?: string;
}

// Helper functions for status mapping
function getReportStatusColor(status: ReportStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "IN_ANALYSIS":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "RESOLVED_PROVISIONAL":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "RESOLVED_CONFIRMED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

function getReportStatusLabel(status: ReportStatus): string {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "IN_ANALYSIS":
      return "Em Análise";
    case "RESOLVED_PROVISIONAL":
      return "Resolvido Provisório";
    case "RESOLVED_CONFIRMED":
      return "Resolvido Confirmado";
    case "ARCHIVED":
      return "Arquivado";
    default:
      return "Desconhecido";
  }
}

export function ReportsList({
  userReports = false,
  userId,
  className,
}: ReportsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar categorias e locais (necessários para exibição)
        const [categoriesData, locationsData] = await Promise.all([
          categoriesApi.findAll(),
          locationsApi.findAll(),
        ]);

        setCategories(categoriesData);
        setLocations(locationsData);

        // Buscar reportes
        const filters: {
          page?: number;
          limit?: number;
          status?: ReportStatus;
          authorId?: string;
        } = {
          page: 1,
          limit: 100, // Aumentar limite para pegar mais reportes
        };

        if (statusFilter !== "all") {
          filters.status = statusFilter as ReportStatus;
        }

        if (userReports && userId) {
          filters.authorId = userId;
        }

        const reportsData = await reportsApi.findAll(filters);
        setReports(reportsData.data);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError(
          "Não foi possível carregar os reportes. Tente novamente mais tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter, userReports, userId]);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      !searchQuery ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getReportLocation = (locationId: string): Location | undefined => {
    return locations.find((loc) => loc.id === locationId);
  };

  const getReportCategory = (categoryId: string): Category | undefined => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "Data inválida";
    }
  };

  const statusCounts = {
    all: reports.length,
    PENDING: reports.filter((r) => r.status === "PENDING").length,
    IN_ANALYSIS: reports.filter((r) => r.status === "IN_ANALYSIS").length,
    RESOLVED_PROVISIONAL: reports.filter(
      (r) => r.status === "RESOLVED_PROVISIONAL"
    ).length,
    RESOLVED_CONFIRMED: reports.filter((r) => r.status === "RESOLVED_CONFIRMED")
      .length,
    ARCHIVED: reports.filter((r) => r.status === "ARCHIVED").length,
  };

  // Função auxiliar para obter nome amigável do tipo de local
  const getLocationTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      station: "Estação",
      terminal: "Terminal",
      bus_stop: "Ponto de Ônibus",
      subway: "Metrô",
      train: "Trem",
    };
    return typeMap[type.toLowerCase()] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
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
                <SelectItem value="PENDING">
                  Pendente ({statusCounts.PENDING})
                </SelectItem>
                <SelectItem value="IN_ANALYSIS">
                  Em Análise ({statusCounts.IN_ANALYSIS})
                </SelectItem>
                <SelectItem value="RESOLVED_PROVISIONAL">
                  Resolvido Provisório ({statusCounts.RESOLVED_PROVISIONAL})
                </SelectItem>
                <SelectItem value="RESOLVED_CONFIRMED">
                  Resolvido Confirmado ({statusCounts.RESOLVED_CONFIRMED})
                </SelectItem>
                <SelectItem value="ARCHIVED">
                  Arquivado ({statusCounts.ARCHIVED})
                </SelectItem>
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
                <h3 className="text-lg font-medium mb-2">
                  Nenhum reporte encontrado
                </h3>
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
              const location = getReportLocation(report.locationId);
              const category = getReportCategory(report.categoryId);

              return (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                    selectedReport?.id === report.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight mb-2">
                          {report.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(report.createdAt)}</span>
                          <span>•</span>
                          <span>#{report.id.substring(0, 8)}</span>
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
                            {getLocationTypeName(location.type)}
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
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.description}
                      </p>

                      {/* View Details Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                      >
                        <Eye className="h-3 w-3 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
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
                    <CardTitle className="text-xl leading-tight">
                      {selectedReport.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Reporte #{selectedReport.id.substring(0, 8)} •{" "}
                      {formatDate(selectedReport.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge
                    className={getReportStatusColor(selectedReport.status)}
                  >
                    {getReportStatusLabel(selectedReport.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Location Details */}
                {(() => {
                  const location = getReportLocation(selectedReport.locationId);
                  return location ? (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Local
                      </h4>
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{location.name}</span>
                          <Badge variant="outline">
                            {getLocationTypeName(location.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {location.address}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Category Details */}
                {(() => {
                  const category = getReportCategory(selectedReport.categoryId);
                  return category ? (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Categoria
                      </h4>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Descrição do Problema</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedReport.description}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-medium mb-2">Histórico</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">
                        {formatDate(selectedReport.createdAt)}
                      </span>
                      <span>Reporte criado</span>
                    </div>
                    {selectedReport.updatedAt !== selectedReport.createdAt && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        <span className="text-muted-foreground">
                          {formatDate(selectedReport.updatedAt)}
                        </span>
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
                <h3 className="text-lg font-medium mb-2">
                  Selecione um reporte
                </h3>
                <p className="text-muted-foreground text-center">
                  Clique em um reporte da lista para ver os detalhes completos
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
