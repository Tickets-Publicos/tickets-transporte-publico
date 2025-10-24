"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  Accessibility,
  Navigation,
  Calculator as Elevator,
  Eye,
  PenTool as Restroom,
  Train,
  AlertTriangle,
} from "lucide-react";
import { categoriesApi } from "@/lib/api/categories";
import type { Category } from "@/lib/api/types";

interface ProblemCategorySelectorProps {
  selectedCategory: Category | null;
  onCategorySelect: (category: Category) => void;
  className?: string;
}

export function ProblemCategorySelector({
  selectedCategory,
  onCategorySelect,
  className,
}: ProblemCategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await categoriesApi.findAll();
        setCategories(data);
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
        setError(
          "Não foi possível carregar as categorias. Tente novamente mais tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryIcon = (categoryName: string) => {
    const nameLower = categoryName.toLowerCase();
    if (nameLower.includes("rampa"))
      return <Accessibility className="h-5 w-5" />;
    if (nameLower.includes("piso") || nameLower.includes("tátil"))
      return <Navigation className="h-5 w-5" />;
    if (nameLower.includes("elevador")) return <Elevator className="h-5 w-5" />;
    if (nameLower.includes("sinalização")) return <Eye className="h-5 w-5" />;
    if (nameLower.includes("banheiro")) return <Restroom className="h-5 w-5" />;
    if (nameLower.includes("plataforma")) return <Train className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Tipo de Problema
        </CardTitle>
        <CardDescription>
          Selecione a categoria que melhor descreve o problema de acessibilidade
          encontrado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Selected Category Display */}
        {selectedCategory && (
          <div className="mb-4 p-3 bg-accent rounded-lg border">
            <div className="flex items-center gap-3">
              {getCategoryIcon(selectedCategory.name)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{selectedCategory.name}</span>
                  <Badge className={getCategoryColor(0)}>Selecionado</Badge>
                </div>
                {selectedCategory.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={
                selectedCategory?.id === category.id ? "default" : "outline"
              }
              className="h-auto p-4 justify-start"
              onClick={() => onCategorySelect(category)}
            >
              <div className="flex items-start gap-3 w-full">
                {getCategoryIcon(category.name)}
                <div className="flex-1 text-left">
                  <div className="font-medium mb-1">{category.name}</div>
                  {category.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Dica:</strong> Se você não tem certeza sobre a categoria,
            escolha &ldquo;Outros&rdquo; e descreva detalhadamente o problema no
            campo de descrição.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
