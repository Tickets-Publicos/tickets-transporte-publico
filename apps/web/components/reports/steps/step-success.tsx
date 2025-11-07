"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface StepSuccessProps {
  reportId: string;
  onNewReport: () => void;
  onViewReports: () => void;
}

export function StepSuccess({
  reportId,
  onNewReport,
  onViewReports,
}: StepSuccessProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold mb-2">
            Reporte Enviado com Sucesso!
          </h2>
          <p className="text-muted-foreground mb-6">
            Seu reporte{" "}
            <span className="font-mono font-semibold">
              #{reportId.substring(0, 8)}
            </span>{" "}
            foi registrado e será analisado pela equipe responsável. Você pode
            acompanhar o status na área de reportes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onNewReport} variant="outline">
              Fazer Novo Reporte
            </Button>
            <Button onClick={onViewReports}>Ver Meus Reportes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
