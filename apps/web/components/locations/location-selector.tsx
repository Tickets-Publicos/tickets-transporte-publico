"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Train, Bus, Loader2 } from "lucide-react";
import { locationsApi } from "@/lib/api/locations";
import type { Location } from "@/lib/api/types";

interface LocationSelectorProps {
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  className?: string;
}

export function LocationSelector({
  selectedLocation,
  onLocationSelect,
  className,
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await locationsApi.findAll();
        setLocations(data);
      } catch (err) {
        console.error("Erro ao carregar locais:", err);
        setError(
          "Não foi possível carregar os locais. Tente novamente mais tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const filteredLocations = useMemo(() => {
    let results = locations;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (location) =>
          location.name.toLowerCase().includes(query) ||
          location.address.toLowerCase().includes(query)
      );
    }

    // Filter by tab
    if (activeTab !== "all") {
      results = results.filter(
        (location) => location.type.toLowerCase() === activeTab.toLowerCase()
      );
    }

    return results;
  }, [locations, searchQuery, activeTab]);

  const getLocationIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("bus")) return <Bus className="h-4 w-4" />;
    if (lowerType.includes("train") || lowerType.includes("trem"))
      return <Train className="h-4 w-4" />;
    if (
      lowerType.includes("subway") ||
      lowerType.includes("metrô") ||
      lowerType.includes("metro")
    )
      return <MapPin className="h-4 w-4" />;
    return <MapPin className="h-4 w-4" />;
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

  const locationsByType = useMemo(() => {
    const stats: Record<string, number> = {};
    locations.forEach((loc) => {
      stats[loc.type] = (stats[loc.type] || 0) + 1;
    });
    return stats;
  }, [locations]);

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
          <MapPin className="h-5 w-5" />
          Selecionar Local
        </CardTitle>
        <CardDescription>
          Escolha o ponto de ônibus ou estação onde você identificou o problema
          de acessibilidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="location-search">Buscar local</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location-search"
              type="text"
              placeholder="Digite o nome do local ou endereço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-describedby="search-description"
            />
          </div>
          <p id="search-description" className="text-sm text-muted-foreground">
            Busque por nome da estação, ponto de ônibus ou endereço
          </p>
        </div>

        {/* Location Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="bus_stop" className="flex items-center gap-1">
              <Bus className="h-3 w-3" />
              Ônibus
            </TabsTrigger>
            <TabsTrigger value="train" className="flex items-center gap-1">
              <Train className="h-3 w-3" />
              Trem
            </TabsTrigger>
            <TabsTrigger value="subway" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Metrô
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {/* Selected Location Display */}
            {selectedLocation && (
              <div className="mb-4 p-3 bg-accent rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getLocationIcon(selectedLocation.type)}
                    <div>
                      <p className="font-medium">{selectedLocation.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedLocation.address}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={getLocationTypeColor(selectedLocation.type)}
                  >
                    {getLocationTypeName(selectedLocation.type)}
                  </Badge>
                </div>
              </div>
            )}

            {/* Location List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLocations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum local encontrado</p>
                  <p className="text-sm">Tente ajustar sua busca ou filtro</p>
                </div>
              ) : (
                filteredLocations.map((location) => (
                  <Button
                    key={location.id}
                    variant={
                      selectedLocation?.id === location.id
                        ? "default"
                        : "outline"
                    }
                    className="w-full justify-start h-auto p-3"
                    onClick={() => onLocationSelect(location)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {getLocationIcon(location.type)}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{location.name}</span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getLocationTypeColor(location.type)}`}
                          >
                            {getLocationTypeName(location.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {location.address}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Location Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          {Object.entries(locationsByType)
            .slice(0, 3)
            .map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-xs text-muted-foreground">
                  {getLocationTypeName(type)}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
