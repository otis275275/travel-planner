package com.travelplanning.backend.dtos.trip;

import com.travelplanning.backend.enums.TripStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTripRequest {

    @NotBlank(message = "Title cannot be empty")
    @Size(max = 200, message = "Title must be at most 200 characters")
    private String title;

    private String placeId;

    private String destinationName;

    private LocalDate startDate;

    private LocalDate endDate;

    private BigDecimal totalBudget;

    private TripStatus status;
}
