package com.travelplanning.backend.dtos.trip;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DraftTripResponse {
    private UUID tripId;
    private String title;
    private String destination;
    private UUID destinationId;
    private String placeId;
    private String destinationCoverUrl;
}
