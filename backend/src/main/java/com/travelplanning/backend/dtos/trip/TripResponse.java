package com.travelplanning.backend.dtos.trip;

import com.travelplanning.backend.dtos.destination.DestinationDto;
import com.travelplanning.backend.enums.TripRole;
import com.travelplanning.backend.enums.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {
    private UUID id;
    private String title;
    private TripStatus status;
    private DestinationDto destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalBudget;
    private TripRole role;
    private OffsetDateTime createdAt;
}
