package com.travelplanning.backend.dtos.trip;

import com.travelplanning.backend.dtos.destination.SpotResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripSavedPlaceResponseDto {

    private UUID tripId;
    private UUID placeId;
    private OffsetDateTime savedAt;
    private SpotResponseDto place;
}
