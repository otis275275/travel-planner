package com.travelplanning.backend.dtos.destination;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DestinationDto {
    private UUID id;
    private String placeId;
    private String name;
    private String state;
    private String country;
    private String summary;
    private List<String> pros;
    private List<String> cons;
    private String bestTimeToVisit;
    private List<String> specialtyDishes;
    private String estimatedBudget;
    private List<String> themeTags;
    private List<String> photoUrls;
    private Double latitude;
    private Double longitude;
    private OffsetDateTime createdAt;
}
