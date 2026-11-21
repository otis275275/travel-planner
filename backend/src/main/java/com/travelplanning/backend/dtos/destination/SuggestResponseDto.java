package com.travelplanning.backend.dtos.destination;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestResponseDto {
    // Detail destination after AI suggest, not just String
    private List<DestinationDto> destinations;
}
