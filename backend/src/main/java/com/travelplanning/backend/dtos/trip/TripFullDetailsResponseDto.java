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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripFullDetailsResponseDto {

    private UUID id;
    private String title;
    private DestinationDto destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalBudget;
    private TripStatus status;
    private TripRole role;

    @Builder.Default
    private List<TripDayDetailsDto> days = new ArrayList<>();

    @Builder.Default
    private List<TripSavedPlaceResponseDto> savedPlaces = new ArrayList<>();

    private long totalActivitiesCount;
    private long totalSavedPlacesCount;
}
