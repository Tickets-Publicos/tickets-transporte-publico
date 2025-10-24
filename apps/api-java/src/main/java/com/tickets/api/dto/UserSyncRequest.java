package com.tickets.api.dto;

import lombok.Data;

@Data
public class UserSyncRequest {
  private String id;
  private String email;
  private String name;
  private String image;
  private String provider;
  private String providerId;
}
