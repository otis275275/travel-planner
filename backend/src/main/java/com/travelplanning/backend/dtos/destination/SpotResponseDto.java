package com.travelplanning.backend.dtos.destination;

import com.travelplanning.backend.enums.PlaceType;
import lombok.*;

import java.util.List;
import java.util.UUID;

/**
 * DTO matching the TripSpot visual interface in TripSpotExplorer (design/src/App.tsx).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpotResponseDto {

    private UUID id;
    private String name;
    private String category;
    private PlaceType type;
    private String image;
    private List<String> photoUrls;
    private String address;
    private String area;
    private String distance;
    private String rating;
    private Float ratingValue;
    private String reviews;
    private Integer reviewsCount;
    private String price;
    private String hours;
    private String description;
    private String reviewSummary;
    private List<String> tags;
    private Double latitude;
    private Double longitude;

    @Builder.Default
    private boolean isAdded = false;

    @Builder.Default
    private boolean isSaved = false;
}
