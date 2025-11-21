"use client";

import { useState, useCallback } from "react";
import { apiRequest, ApiError } from "../lib/api/config";

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

  const fetchPendingReports = useCallback(async (page = 1, limit = 10): Promise<PageResponse<Report>> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest<PageResponse<Report>>(
        `/reports/pending-review?page=${page}&limit=${limit}`
      );
      return data;
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        throw new Error("Acesso negado. Você precisa ser administrador.");
      }
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
      const result = await apiRequest<Report>(`/reports/${reportId}/approve`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return result;
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        throw new Error("Acesso negado. Você precisa ser administrador.");
      }
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
      const result = await apiRequest<Report>(`/reports/${reportId}/reject`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return result;
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        throw new Error("Acesso negado. Você precisa ser administrador.");
      }
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
