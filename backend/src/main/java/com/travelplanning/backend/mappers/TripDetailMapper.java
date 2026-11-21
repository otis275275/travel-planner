package com.travelplanning.backend.mappers;

import com.travelplanning.backend.dtos.destination.SpotResponseDto;
import com.travelplanning.backend.dtos.trip.ActivityResponseDto;
import com.travelplanning.backend.dtos.trip.TripSavedPlaceResponseDto;
import com.travelplanning.backend.entities.Activity;
import com.travelplanning.backend.entities.Place;
import com.travelplanning.backend.entities.TripSavedPlace;
import com.travelplanning.backend.enums.PlaceType;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Mapper for converting trip details, activities, spots, and saved bookmarks into their respective DTOs.
 */
@Component
public class TripDetailMapper {

    /**
     * Map a single TripSavedPlace entity to TripSavedPlaceResponseDto.
     *
     * @param savedPlace The bookmarked place entity
     * @param isScheduled Whether this place is currently scheduled in any day of the trip
     */
    public TripSavedPlaceResponseDto toSavedPlaceDto(TripSavedPlace savedPlace, boolean isScheduled) {
        if (savedPlace == null) {
            return null;
        }

        return TripSavedPlaceResponseDto.builder()
                .tripId(savedPlace.getId().getTripId())
                .placeId(savedPlace.getId().getPlaceId())
                .savedAt(savedPlace.getSavedAt())
                .place(toSpotDto(savedPlace.getPlace(), true, isScheduled))
                .build();
    }

    /**
     * Map a collection of TripSavedPlace entities to a list of TripSavedPlaceResponseDto.
     *
     * @param savedPlaces List of bookmarked places
     * @param scheduledPlaceIds Set of place IDs currently scheduled in the trip itinerary
     */
    public List<TripSavedPlaceResponseDto> toSavedPlaceDtoList(
            List<TripSavedPlace> savedPlaces,
            Set<UUID> scheduledPlaceIds) {

        if (savedPlaces == null || savedPlaces.isEmpty()) {
            return Collections.emptyList();
        }

        final Set<UUID> scheduledIds = scheduledPlaceIds != null ? scheduledPlaceIds : Collections.emptySet();

        return savedPlaces.stream()
                .map(sp -> toSavedPlaceDto(sp, scheduledIds.contains(sp.getId().getPlaceId())))
                .toList();
    }

    /**
     * Map an Activity entity to ActivityResponseDto.
     *
     * @param act The activity entity
     * @param isSaved Whether the referenced place is bookmarked in the trip
     */
    public ActivityResponseDto toActivityDto(Activity act, boolean isSaved) {
        if (act == null) {
            return null;
        }

        SpotResponseDto spotDto = null;
        if (act.getPlace() != null) {
            spotDto = toSpotDto(act.getPlace(), isSaved, true);
        }

        return ActivityResponseDto.builder()
                .id(act.getId())
                .tripDayId(act.getTripDay().getId())
                .placeId(act.getPlace() != null ? act.getPlace().getId() : null)
                .place(spotDto)
                .type(act.getType())
                .title(act.getTitle())
                .startTime(act.getStartTime())
                .endTime(act.getEndTime())
                .estCost(act.getEstCost())
                .position(act.getPosition())
                .notes(act.getNotes())
                .build();
    }

    /**
     * Map a Place entity to SpotResponseDto matching the visual interface in TripSpotExplorer.
     *
     * @param place The place entity
     * @param isSaved Whether this spot is saved/bookmarked for the active trip
     * @param isAdded Whether this spot is scheduled in any day of the active trip
     */
    public SpotResponseDto toSpotDto(Place place, boolean isSaved, boolean isAdded) {
        if (place == null) {
            return null;
        }

        return SpotResponseDto.builder()
                .id(place.getId())
                .name(place.getName())
                .category(mapCategoryLabel(place.getType()))
                .type(place.getType())
                .image(place.getThumbnailUrl())
                .photoUrls(place.getPhotoUrls())
                .address(place.getAddress())
                .area(place.getArea())
                .distance(place.getDistanceInfo())
                .rating(place.getRating() != null ? String.format(Locale.US, "%.1f", place.getRating()) : "4.5")
                .ratingValue(place.getRating() != null ? place.getRating() : 4.5f)
                .reviews(place.getReviewsCount() != null ? String.format(Locale.US, "(%d)", place.getReviewsCount()) : "(0)")
                .reviewsCount(place.getReviewsCount() != null ? place.getReviewsCount() : 0)
                .price(place.getPriceLevel())
                .hours(place.getOpenHours())
                .description(place.getDescription())
                .reviewSummary(place.getReviewSummary())
                .tags(place.getTags())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .isSaved(isSaved)
                .isAdded(isAdded)
                .build();
    }

    /**
     * Map PlaceType enum to user-friendly Vietnamese category badge label.
     */
    public String mapCategoryLabel(PlaceType type) {
        if (type == null) {
            return "Điểm đến";
        }
        return switch (type) {
            case CAFE -> "Quán cà phê";
            case RESTAURANT -> "Nhà hàng";
            case ATTRACTION -> "Điểm tham quan";
            case HOTEL -> "Khách sạn";
            case ACTIVITY -> "Hoạt động trải nghiệm";
            default -> "Địa điểm nổi tiếng";
        };
    }
}
