package com.travelplanning.backend.dtos.destination;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestRequestDto {

    @NotBlank(message = "Region is required")
    private String region;      // NORTH, CENTRAL, SOUTH, ANY

    @NotBlank(message = "Vibe is required")
    private String vibe;        // NATURE, BEACH, HISTORY, FOOD, PHOTO

    @NotBlank(message = "Companion is required")
    private String companion;   // SOLO, COUPLE, FRIENDS, FAMILY

    @NotNull(message = "Travel month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer travelMonth;
}
