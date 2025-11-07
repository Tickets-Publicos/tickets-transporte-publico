"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";
import { statsApi } from "@/lib/api/stats";
import type { DashboardStats } from "@/lib/api/types";

interface DashboardStatsProps {
  userReports?: boolean;
  userId?: string;
  className?: string;
}

export function DashboardStats({
  userReports = false,
  userId,
  className,
}: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await statsApi.getDashboardStats(
          userReports && userId ? userId : undefined
        );
        setStats(data);
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
        setError(
          "Não foi possível carregar as estatísticas. Tente novamente mais tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userReports, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {error || "Erro ao carregar estatísticas"}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Reportes
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              {userReports ? "Seus reportes" : "Reportes no sistema"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingReports}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando análise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.resolvedReports}
            </div>
            <p className="text-xs text-muted-foreground">
              Problemas solucionados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Resolução
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.resolutionRate.toFixed(1)}%
            </div>
            <Progress value={stats.resolutionRate} className="mt-2" />
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
            {stats.problemsByCategory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum reporte encontrado
              </p>
            ) : (
              <div className="space-y-4">
                {stats.problemsByCategory.map((stat) => (
                  <div key={stat.categoryId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {stat.categoryName}
                      </span>
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
            {stats.reportsByLocationType.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum reporte encontrado
              </p>
            ) : (
              <div className="space-y-4">
                {stats.reportsByLocationType.map((stat) => (
                  <div
                    key={stat.type}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{stat.typeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.totalLocations} locais cadastrados
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stat.count}</div>
                      <p className="text-xs text-muted-foreground">reportes</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {stats.statusBreakdown.pending}
              </div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {stats.statusBreakdown.inAnalysis}
              </div>
              <p className="text-sm text-muted-foreground">Em Análise</p>
            </div>

            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {stats.statusBreakdown.resolvedProvisional}
              </div>
              <p className="text-sm text-muted-foreground">
                Resolvido Provisório
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {stats.statusBreakdown.resolvedConfirmed}
              </div>
              <p className="text-sm text-muted-foreground">
                Resolvido Confirmado
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <XCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-600">
                {stats.statusBreakdown.archived}
              </div>
              <p className="text-sm text-muted-foreground">Arquivados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
