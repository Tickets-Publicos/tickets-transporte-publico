package com.tickets.api.repository.projection;

public interface LocationTypeCountProjection {
  String getType();

  Long getCount();

  Long getTotalLocations();
}
