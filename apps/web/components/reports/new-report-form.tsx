"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reportsApi } from "@/lib/api/reports";
import {
  reportFormSchema,
  type ReportFormData,
} from "@/lib/validations/report-form";
import type { User } from "@/lib/api/types";

// Import step components
import { StepOne } from "./steps/step-one";
import { StepTwo } from "./steps/step-two";
import { StepThree } from "./steps/step-three";
import { StepSuccess } from "./steps/step-success";

interface NewReportFormProps {
  user: User;
}

export function NewReportForm({ user }: NewReportFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [reportId, setReportId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    mode: "onChange",
    defaultValues: {
      locationId: "",
      categoryId: "",
      title: "",
      description: "",
      imageUrl: "",
    },
  });

  const { handleSubmit, trigger, watch } = methods;

  const locationId = watch("locationId");
  const categoryId = watch("categoryId");

  const handleNext = async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = await trigger("locationId");
    } else if (currentStep === 2) {
      isValid = await trigger("categoryId");
    } else if (currentStep === 3) {
      isValid = await trigger(["title", "description", "imageUrl"]);
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep < 4) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.push("/dashboard");
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    try {
      setIsSubmitting(true);

      const result = await reportsApi.create({
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl || undefined,
        authorId: user.id,
        locationId: data.locationId,
        categoryId: data.categoryId,
      });

      setReportId(result.id);
      setCurrentStep(4);

      toast({
        title: "Reporte enviado com sucesso!",
        description: "Seu reporte foi registrado e será analisado em breve.",
      });
    } catch (error) {
      console.error("Erro ao enviar reporte:", error);
      toast({
        title: "Erro ao enviar reporte",
        description: "Ocorreu um erro ao enviar o reporte. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewReport = () => {
    methods.reset();
    setCurrentStep(1);
    setReportId(null);
  };

  const handleViewReports = () => {
    router.push("/dashboard");
  };

  const getStepLabel = (step: number) => {
    switch (step) {
      case 1:
        return "Selecionar Local";
      case 2:
        return "Categoria do Problema";
      case 3:
        return "Detalhes do Reporte";
      case 4:
        return "Confirmação";
      default:
        return "";
    }
  };

  if (currentStep === 4 && reportId) {
    return (
      <StepSuccess
        reportId={reportId}
        onNewReport={handleNewReport}
        onViewReports={handleViewReports}
      />
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Novo Reporte</h1>
              <p className="text-muted-foreground">
                {getStepLabel(currentStep)}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 1 ? "✓" : "1"}
              </div>
              <span className={currentStep === 1 ? "font-medium" : ""}>
                Local
              </span>
            </div>
            <ArrowRight className="h-4 w-4" />
            <div className="flex items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 2 ? "✓" : "2"}
              </div>
              <span className={currentStep === 2 ? "font-medium" : ""}>
                Categoria
              </span>
            </div>
            <ArrowRight className="h-4 w-4" />
            <div className="flex items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 3
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 3 ? "✓" : "3"}
              </div>
              <span className={currentStep === 3 ? "font-medium" : ""}>
                Detalhes
              </span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 1 && <StepOne />}
          {currentStep === 2 && <StepTwo />}
          {currentStep === 3 && <StepThree />}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentStep === 1 ? "Cancelar" : "Voltar"}
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !locationId) ||
                    (currentStep === 2 && !categoryId)
                  }
                >
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar Reporte"}
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </form>
      </div>
    </FormProvider>
  );
}
