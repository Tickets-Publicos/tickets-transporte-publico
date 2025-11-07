"use client";

import { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { LocationSelector } from "@/components/locations/location-selector";
import { LocationMap } from "@/components/locations/location-map";
import { locationsApi } from "@/lib/api/locations";
import type { Location } from "@/lib/api/types";
import type { ReportFormData } from "@/lib/validations/report-form";

export function StepOne() {
  const { control, watch, setValue } = useFormContext<ReportFormData>();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const locationId = watch("locationId");

  // Load selected location if locationId exists
  useEffect(() => {
    if (locationId && !selectedLocation) {
      locationsApi
        .findById(locationId)
        .then(setSelectedLocation)
        .catch(console.error);
    }
  }, [locationId, selectedLocation]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setValue("locationId", location.id, { shouldValidate: true });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Controller
        name="locationId"
        control={control}
        render={({ fieldState }) => (
          <div>
            <LocationSelector
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
            />
            {fieldState.error && (
              <p className="text-sm text-destructive mt-2" role="alert">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
      <LocationMap location={selectedLocation} />
    </div>
  );
}
