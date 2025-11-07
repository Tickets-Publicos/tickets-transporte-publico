"use client";

import { useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface Report {
  id: string;
  title: string;
  description: string;
  status: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
  locationId: string;
  locationName: string;
  categoryId: string;
  categoryName: string;
}

interface PageResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApproveData {
  newStatus: "IN_ANALYSIS" | "RESOLVED_PROVISIONAL" | "RESOLVED_CONFIRMED";
  comment?: string;
}

interface RejectData {
  reason: string;
}

export function useAdminReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = async () => {
    // Buscar o token do backend JWT gerado pelo auth.server.ts
    const response = await fetch("/api/auth/token", {
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Não autenticado");
    }
    
    const { token } = await response.json();
    return token;
  };

  const fetchPendingReports = useCallback(async (page = 1, limit = 10): Promise<PageResponse<Report>> => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${API_URL}/reports/pending-review?page=${page}&limit=${limit}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Acesso negado. Você precisa ser administrador.");
        }
        throw new Error("Erro ao buscar reportes pendentes");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveReport = useCallback(async (reportId: string, data: ApproveData): Promise<Report> => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/reports/${reportId}/approve`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Acesso negado. Você precisa ser administrador.");
        }
        throw new Error("Erro ao aprovar reporte");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectReport = useCallback(async (reportId: string, data: RejectData): Promise<Report> => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/reports/${reportId}/reject`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Acesso negado. Você precisa ser administrador.");
        }
        throw new Error("Erro ao rejeitar reporte");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchPendingReports,
    approveReport,
    rejectReport,
  };
}
