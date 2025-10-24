// web/app/(private)/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ReportsList } from "@/components/dashboard/reports-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3, List } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleNewReport = () => {
    router.push("/new-report");
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Acompanhe seus reportes e estatísticas do sistema
          </p>
        </div>
        <Button onClick={handleNewReport} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Novo Reporte
        </Button>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="my-reports" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Meus Reportes
          </TabsTrigger>
          <TabsTrigger value="all-reports" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Todos os Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DashboardStats />
        </TabsContent>

        <TabsContent value="my-reports" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Meus Reportes</h2>
            <p className="text-muted-foreground">
              Acompanhe o status dos problemas que você reportou
            </p>
          </div>
          <ReportsList userReports={true} userId={user.id} />
        </TabsContent>

        <TabsContent value="all-reports" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Todos os Reportes</h2>
            <p className="text-muted-foreground">
              Visualize todos os reportes de problemas de acessibilidade no
              sistema
            </p>
          </div>
          <ReportsList />
        </TabsContent>
      </Tabs>
    </>
  );
}
