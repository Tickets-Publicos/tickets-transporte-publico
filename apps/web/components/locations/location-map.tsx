"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";
import type { Location } from "@/lib/api/types";

interface LocationMapProps {
  location: Location | null;
  className?: string;
}

export function LocationMap({ location, className }: LocationMapProps) {
  const getLocationTypeName = (type: string) => {
    switch (type) {
      case "bus_stop":
        return "Ponto de Ônibus";
      case "train":
        return "Estação de Trem";
      case "subway":
        return "Estação de Metrô";
      case "terminal":
        return "Terminal";
      default:
        return "Outros";
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case "bus_stop":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "train":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "subway":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "terminal":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (!location) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localização
          </CardTitle>
          <CardDescription>
            Selecione um local para ver sua localização no mapa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum local selecionado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localização Selecionada
        </CardTitle>
        <CardDescription>
          Confirme se este é o local correto para seu reporte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{location.name}</h3>
            <Badge className={getLocationTypeColor(location.type)}>
              {getLocationTypeName(location.type)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Navigation className="h-3 w-3" />
            {location.address}
          </p>
        </div>

        {/* Map Placeholder */}
        <div className="relative">
          <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="font-medium">{location.name}</p>
              <p className="text-sm text-muted-foreground">
                Lat: {location.latitude.toFixed(4)}, Lng:{" "}
                {location.longitude.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Map overlay with location details */}
          <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 border">
            <p className="text-xs font-medium">
              {getLocationTypeName(location.type)}
            </p>
          </div>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Latitude:</span>
            <p className="font-mono">{location.latitude.toFixed(6)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Longitude:</span>
            <p className="font-mono">{location.longitude.toFixed(6)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
