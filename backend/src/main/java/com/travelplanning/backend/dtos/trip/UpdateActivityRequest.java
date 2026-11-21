package com.travelplanning.backend.dtos.trip;

import com.travelplanning.backend.enums.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateActivityRequest {

    private String title;

    private ActivityType type;

    private LocalTime startTime;

    private LocalTime endTime;

    private BigDecimal estCost;

    private String notes;
}
