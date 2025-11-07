package com.tickets.api.repository.projection;

public interface CategoryCountProjection {
    String getCategoryId();
    String getCategoryName();
    long getCount();
}
