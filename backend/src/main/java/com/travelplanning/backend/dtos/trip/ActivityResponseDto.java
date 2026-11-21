package com.travelplanning.backend.dtos.trip;

import com.travelplanning.backend.dtos.destination.SpotResponseDto;
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
public class ActivityResponseDto {

    private UUID id;
    private UUID tripDayId;
    private UUID placeId;
    private SpotResponseDto place;
    private ActivityType type;
    private String title;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal estCost;
    private Integer position;
    private String notes;
}
