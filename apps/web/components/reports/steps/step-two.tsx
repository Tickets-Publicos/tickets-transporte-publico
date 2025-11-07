"use client";

import { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { ProblemCategorySelector } from "@/components/reports/problem-category-selector";
import { LocationMap } from "@/components/locations/location-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { categoriesApi } from "@/lib/api/categories";
import { locationsApi } from "@/lib/api/locations";
import type { Category, Location } from "@/lib/api/types";
import type { ReportFormData } from "@/lib/validations/report-form";

export function StepTwo() {
  const { control, watch, setValue } = useFormContext<ReportFormData>();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const categoryId = watch("categoryId");
  const locationId = watch("locationId");

  // Load selected category if categoryId exists
  useEffect(() => {
    if (categoryId && !selectedCategory) {
      categoriesApi
        .findById(categoryId)
        .then(setSelectedCategory)
        .catch(console.error);
    }
  }, [categoryId, selectedCategory]);

  // Load selected location
  useEffect(() => {
    if (locationId) {
      locationsApi
        .findById(locationId)
        .then(setSelectedLocation)
        .catch(console.error);
    }
  }, [locationId]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setValue("categoryId", category.id, { shouldValidate: true });
  };

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
      {/* Selected Location Summary */}
      {selectedLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Local Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{selectedLocation.name}</span>
              <Badge className={getLocationTypeColor(selectedLocation.type)}>
                {getLocationTypeName(selectedLocation.type)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedLocation.address}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Controller
            name="categoryId"
            control={control}
            render={({ fieldState }) => (
              <div>
                <ProblemCategorySelector
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                />
                {fieldState.error && (
                  <p className="text-sm text-destructive mt-2" role="alert">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
        <div>
          <LocationMap location={selectedLocation} />
        </div>
      </div>
    </div>
  );
}
