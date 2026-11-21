package com.travelplanning.backend.dtos.destination;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutocompleteItemDto {
    private String placeId;      // URL slug (e.g., phan-thiet-binh-thuan)
    private String displayName;  // e.g., "Phan Thiết, Bình Thuận"
    private String region;       // e.g., "Bình Thuận"
}
