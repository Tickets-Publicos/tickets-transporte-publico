"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAdminReports, Report } from "@/hooks/use-admin-reports";
import { ReportsTable } from "@/components/admin/reports-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { fetchPendingReports, approveReport, rejectReport, loading, error } = useAdminReports();
  
  // A role agora vem direto do Better Auth Admin plugin na sessão
  const isAdmin = user?.role === "ADMIN";
  
  const [reports, setReports] = useState<Report[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [currentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Verificar se é admin
  useEffect(() => {
    if (!authLoading && isAuthenticated && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, authLoading, isAuthenticated, router]);

  // Carregar reportes pendentes
  const loadReports = async () => {
    try {
      const response = await fetchPendingReports(currentPage, 10);
      setReports(response.data);
      setTotalReports(response.total);
    } catch (err) {
      console.error("Erro ao carregar reportes:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, currentPage]);

  const handleApprove = async (reportId: string, newStatus: string, comment?: string) => {
    try {
      await approveReport(reportId, {
        newStatus: newStatus as "IN_ANALYSIS" | "RESOLVED_PROVISIONAL" | "RESOLVED_CONFIRMED",
        comment,
      });
      // Recarregar a lista
      await loadReports();
    } catch (err) {
      console.error("Erro ao aprovar:", err);
      throw err;
    }
  };

  const handleReject = async (reportId: string, reason: string) => {
    try {
      await rejectReport(reportId, { reason });
      // Recarregar a lista
      await loadReports();
    } catch (err) {
      console.error("Erro ao rejeitar:", err);
      throw err;
    }
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setDetailsDialogOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">
          Gerencie os reportes pendentes de aprovação
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Reportes Pendentes</CardTitle>
              <CardDescription>
                {totalReports} {totalReports === 1 ? "reporte pendente" : "reportes pendentes"} de análise
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadReports}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && reports.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ReportsTable
              reports={reports}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewDetails={handleViewDetails}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>Detalhes do reporte</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Autor</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.authorName}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Localização</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.locationName}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Categoria</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.categoryName}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Status</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.status}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Descrição</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedReport.description}
                </p>
              </div>
              {selectedReport.imageUrl && (
                <div>
                  <h4 className="font-semibold mb-2">Imagem</h4>
                  <Image
                    src={selectedReport.imageUrl}
                    alt={selectedReport.title}
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-lg border"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-semibold">Criado em:</span>{" "}
                  {new Date(selectedReport.createdAt).toLocaleString("pt-BR")}
                </div>
                <div>
                  <span className="font-semibold">Atualizado em:</span>{" "}
                  {new Date(selectedReport.updatedAt).toLocaleString("pt-BR")}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
