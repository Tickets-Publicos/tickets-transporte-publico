"use client";

import { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle, CheckCircle, MapPin } from "lucide-react";
import { locationsApi } from "@/lib/api/locations";
import { categoriesApi } from "@/lib/api/categories";
import { LocationMap } from "@/components/locations/location-map";
import type { Category, Location } from "@/lib/api/types";
import type { ReportFormData } from "@/lib/validations/report-form";

export function StepThree() {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<ReportFormData>();

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const locationId = watch("locationId");
  const categoryId = watch("categoryId");
  const title = watch("title");
  const description = watch("description");

  useEffect(() => {
    if (locationId) {
      locationsApi
        .findById(locationId)
        .then(setSelectedLocation)
        .catch(console.error);
    }
  }, [locationId]);

  useEffect(() => {
    if (categoryId) {
      categoriesApi
        .findById(categoryId)
        .then(setSelectedCategory)
        .catch(console.error);
    }
  }, [categoryId]);

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

  const getLocationTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("bus"))
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    if (lowerType.includes("train") || lowerType.includes("trem"))
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (
      lowerType.includes("subway") ||
      lowerType.includes("metrô") ||
      lowerType.includes("metro")
    )
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Location Summary */}
        {selectedLocation && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1">Local</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">
                      {selectedLocation.name}
                    </span>
                    <Badge
                      className={getLocationTypeColor(selectedLocation.type)}
                    >
                      {getLocationTypeName(selectedLocation.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {selectedLocation.address}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Summary */}
        {selectedCategory && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1">Categoria</p>
                  <p className="font-medium truncate">
                    {selectedCategory.name}
                  </p>
                  {selectedCategory.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {selectedCategory.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Descrever o Problema
              </CardTitle>
              <CardDescription>
                Forneça detalhes sobre o problema de acessibilidade para ajudar
                na resolução
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Field */}
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Título do Problema{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ex: Rampa de acesso danificada na entrada principal"
                      {...field}
                      aria-invalid={errors.title ? "true" : "false"}
                      aria-describedby="title-description title-counter title-error"
                    />
                    <div className="flex justify-between items-center">
                      <p
                        id="title-description"
                        className="text-sm text-muted-foreground"
                      >
                        Seja específico e claro sobre o problema
                      </p>
                      <p
                        id="title-counter"
                        className="text-xs text-muted-foreground"
                      >
                        {field.value?.length || 0}/255
                      </p>
                    </div>
                    {errors.title && (
                      <p
                        id="title-error"
                        className="text-sm text-destructive"
                        role="alert"
                      >
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Description Field */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Descrição Detalhada{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o problema em detalhes: localização exata, como afeta a acessibilidade, há quanto tempo existe, etc."
                      rows={6}
                      {...field}
                      aria-invalid={errors.description ? "true" : "false"}
                      aria-describedby="description-description description-counter description-error"
                    />
                    <div className="flex justify-between items-center">
                      <p
                        id="description-description"
                        className="text-sm text-muted-foreground"
                      >
                        Inclua detalhes como localização exata, gravidade e
                        impacto
                      </p>
                      <p
                        id="description-counter"
                        className="text-xs text-muted-foreground"
                      >
                        {field.value?.length || 0}/2000
                      </p>
                    </div>
                    {errors.description && (
                      <p
                        id="description-error"
                        className="text-sm text-destructive"
                        role="alert"
                      >
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Image URL Field (Optional) */}
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">URL da Imagem (Opcional)</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://exemplo.com/imagem.jpg"
                      {...field}
                      aria-invalid={errors.imageUrl ? "true" : "false"}
                      aria-describedby="imageUrl-description imageUrl-error"
                    />
                    <p
                      id="imageUrl-description"
                      className="text-sm text-muted-foreground"
                    >
                      Adicione uma imagem para ilustrar o problema
                    </p>
                    {errors.imageUrl && (
                      <p
                        id="imageUrl-error"
                        className="text-sm text-destructive"
                        role="alert"
                      >
                        {errors.imageUrl.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Guidelines */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Dicas para um bom reporte:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Seja específico sobre a localização do problema</li>
                    <li>
                      • Explique como o problema afeta pessoas com deficiência
                    </li>
                    <li>• Mencione se é um problema recorrente ou pontual</li>
                    <li>• Inclua informações sobre horários se relevante</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Character Count Warnings */}
              {title && title.length > 0 && title.length < 10 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    O título deve ter pelo menos 10 caracteres para ser
                    descritivo.
                  </AlertDescription>
                </Alert>
              )}

              {description &&
                description.length > 0 &&
                description.length < 20 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      A descrição deve ter pelo menos 20 caracteres para
                      fornecer detalhes úteis.
                    </AlertDescription>
                  </Alert>
                )}
            </CardContent>
          </Card>
        </div>

        <div>
          <LocationMap location={selectedLocation} />
        </div>
      </div>
    </div>
  );
}
