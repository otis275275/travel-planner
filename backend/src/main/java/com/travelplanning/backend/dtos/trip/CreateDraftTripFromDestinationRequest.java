package com.travelplanning.backend.dtos.trip;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDraftTripFromDestinationRequest {

    @NotBlank(message = "placeId is required")
    private String placeId;

    @NotBlank(message = "destinationName is required")
    private String destinationName;
}
