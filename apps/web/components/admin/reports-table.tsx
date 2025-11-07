"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { Report } from "@/hooks/use-admin-reports";
import { Badge } from "@/components/ui/badge";

interface ReportsTableProps {
  reports: Report[];
  onApprove: (reportId: string, newStatus: string, comment?: string) => Promise<void>;
  onReject: (reportId: string, reason: string) => Promise<void>;
  onViewDetails: (report: Report) => void;
}

export function ReportsTable({ reports, onApprove, onReject, onViewDetails }: ReportsTableProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [approveStatus, setApproveStatus] = useState<string>("IN_ANALYSIS");
  const [approveComment, setApproveComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApproveClick = (report: Report) => {
    setSelectedReport(report);
    setApproveStatus("IN_ANALYSIS");
    setApproveComment("");
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (report: Report) => {
    setSelectedReport(report);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedReport) return;
    
    setLoading(true);
    try {
      await onApprove(selectedReport.id, approveStatus, approveComment);
      setApproveDialogOpen(false);
      setSelectedReport(null);
    } catch (error) {
      console.error("Erro ao aprovar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedReport || !rejectReason.trim()) return;
    
    setLoading(true);
    try {
      await onReject(selectedReport.id, rejectReason);
      setRejectDialogOpen(false);
      setSelectedReport(null);
      setRejectReason("");
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Table>
        <TableCaption>Lista de reportes pendentes de aprovação</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Autor</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Nenhum reporte pendente
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.title}</TableCell>
                <TableCell>{report.authorName}</TableCell>
                <TableCell>{report.locationName}</TableCell>
                <TableCell>{report.categoryName}</TableCell>
                <TableCell>{formatDate(report.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{report.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(report)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApproveClick(report)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRejectClick(report)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Dialog de Aprovação */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Reporte</DialogTitle>
            <DialogDescription>
              Selecione o novo status para o reporte: <strong>{selectedReport?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Novo Status</Label>
              <Select value={approveStatus} onValueChange={setApproveStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_ANALYSIS">Em Análise</SelectItem>
                  <SelectItem value="RESOLVED_PROVISIONAL">Resolvido Provisoriamente</SelectItem>
                  <SelectItem value="RESOLVED_CONFIRMED">Resolvido e Confirmado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment">Comentário (opcional)</Label>
              <Textarea
                id="comment"
                placeholder="Adicione um comentário sobre a aprovação..."
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleApproveSubmit} disabled={loading}>
              {loading ? "Aprovando..." : "Confirmar Aprovação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Rejeição */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Reporte</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição do reporte: <strong>{selectedReport?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Motivo da Rejeição</Label>
              <Textarea
                id="reason"
                placeholder="Descreva o motivo da rejeição..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectSubmit} 
              disabled={loading || !rejectReason.trim()}
            >
              {loading ? "Rejeitando..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
