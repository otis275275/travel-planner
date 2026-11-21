package com.travelplanning.backend.dtos.trip;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripDayDetailsDto {

    private UUID id;
    private UUID tripId;
    private Integer dayNumber;
    private LocalDate date;
    private String notes;

    @Builder.Default
    private List<ActivityResponseDto> activities = new ArrayList<>();
}
