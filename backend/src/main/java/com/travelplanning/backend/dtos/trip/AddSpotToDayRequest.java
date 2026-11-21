package com.travelplanning.backend.dtos.trip;

import com.travelplanning.backend.enums.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddSpotToDayRequest {

    private UUID placeId;

    private String title;

    @Builder.Default
    private ActivityType type = ActivityType.VISIT;

    private LocalTime startTime;

    private LocalTime endTime;

    private BigDecimal estCost;

    private String notes;
}
