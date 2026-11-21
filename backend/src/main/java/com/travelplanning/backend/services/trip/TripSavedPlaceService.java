package com.travelplanning.backend.services.trip;

import com.travelplanning.backend.dtos.destination.SpotResponseDto;
import com.travelplanning.backend.dtos.trip.TripSavedPlaceResponseDto;
import com.travelplanning.backend.entities.Place;
import com.travelplanning.backend.entities.Trip;
import com.travelplanning.backend.entities.TripMember;
import com.travelplanning.backend.entities.TripSavedPlace;
import com.travelplanning.backend.entities.TripSavedPlaceId;
import com.travelplanning.backend.enums.PlaceType;
import com.travelplanning.backend.enums.TripRole;
import com.travelplanning.backend.exceptions.ForbiddenException;
import com.travelplanning.backend.exceptions.ResourceNotFoundException;
import com.travelplanning.backend.repositories.ActivityRepository;
import com.travelplanning.backend.repositories.PlaceRepository;
import com.travelplanning.backend.repositories.TripMemberRepository;
import com.travelplanning.backend.repositories.TripRepository;
import com.travelplanning.backend.repositories.TripSavedPlaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

/**
 * Service managing bookmarked / saved places for a Trip (Wishlist / Sidebar collection).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TripSavedPlaceService {

    private final TripRepository tripRepository;
    private final PlaceRepository placeRepository;
    private final TripSavedPlaceRepository tripSavedPlaceRepository;
    private final ActivityRepository activityRepository;
    private final TripMemberRepository tripMemberRepository;

    /**
     * Bookmark / save a spot to the trip's saved places collection.
     */
    @Transactional
    public TripSavedPlaceResponseDto bookmarkSpot(UUID tripId, UUID placeId, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        checkWritePermission(trip, userId);

        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place", "id", placeId));

        TripSavedPlaceId id = new TripSavedPlaceId(tripId, placeId);
        Optional<TripSavedPlace> existing = tripSavedPlaceRepository.findById(id);

        TripSavedPlace savedPlace;
        if (existing.isPresent()) {
            savedPlace = existing.get();
        } else {
            savedPlace = TripSavedPlace.builder()
                    .id(id)
                    .trip(trip)
                    .place(place)
                    .savedAt(OffsetDateTime.now())
                    .build();
            savedPlace = tripSavedPlaceRepository.save(savedPlace);
            log.info("Bookmarked spot '{}' in Trip '{}'", place.getName(), trip.getTitle());
        }

        boolean isScheduled = activityRepository.isPlaceScheduledInTrip(tripId, placeId);
        return TripSavedPlaceResponseDto.builder()
                .tripId(tripId)
                .placeId(placeId)
                .savedAt(savedPlace.getSavedAt())
                .place(mapPlaceToSpotDto(place, true, isScheduled))
                .build();
    }

    /**
     * Remove a bookmarked / saved spot from the trip.
     */
    @Transactional
    public void removeBookmarkedSpot(UUID tripId, UUID placeId, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        checkWritePermission(trip, userId);

        tripSavedPlaceRepository.deleteByTripIdAndPlaceId(tripId, placeId);
        log.info("Removed bookmarked spot {} from Trip '{}'", placeId, trip.getTitle());
    }

    /**
     * Retrieve all bookmarked spots for a trip.
     */
    @Transactional(readOnly = true)
    public List<TripSavedPlaceResponseDto> getBookmarkedSpots(UUID tripId, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        checkReadPermission(trip, userId);

        List<TripSavedPlace> savedPlaces = tripSavedPlaceRepository.findAllByTripIdWithPlaceDetails(tripId);
        if (savedPlaces.isEmpty()) {
            return List.of();
        }

        List<UUID> placeIds = savedPlaces.stream().map(sp -> sp.getId().getPlaceId()).toList();
        Set<UUID> scheduledPlaceIds = activityRepository.findScheduledPlaceIdsByTripIdAndPlaceIds(tripId, placeIds);

        return savedPlaces.stream()
                .map(sp -> TripSavedPlaceResponseDto.builder()
                        .tripId(tripId)
                        .placeId(sp.getId().getPlaceId())
                        .savedAt(sp.getSavedAt())
                        .place(mapPlaceToSpotDto(
                                sp.getPlace(),
                                true,
                                scheduledPlaceIds.contains(sp.getId().getPlaceId())
                        ))
                        .build())
                .toList();
    }

    // ── Internal Helpers ────────────────────────────────────────────────────────

    private void checkWritePermission(Trip trip, UUID userId) {
        if (userId == null) {
            throw new ForbiddenException("Authentication required to modify this trip");
        }
        if (trip.getOwner().getId().equals(userId)) {
            return;
        }
        TripMember member = tripMemberRepository.findByTripIdAndUserId(trip.getId(), userId)
                .orElseThrow(() -> new ForbiddenException("You do not have permission to modify this trip"));
        if (member.getRole() != TripRole.OWNER && member.getRole() != TripRole.EDITOR) {
            throw new ForbiddenException("You do not have permission to modify this trip");
        }
    }

    private void checkReadPermission(Trip trip, UUID userId) {
        if (userId == null) {
            return;
        }
        if (trip.getOwner().getId().equals(userId)) {
            return;
        }
        tripMemberRepository.findByTripIdAndUserId(trip.getId(), userId)
                .orElseThrow(() -> new ForbiddenException("You do not have access to this trip"));
    }

    private SpotResponseDto mapPlaceToSpotDto(Place place, boolean isSaved, boolean isAdded) {
        if (place == null) return null;
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

    private String mapCategoryLabel(PlaceType type) {
        if (type == null) return "Điểm đến";
        return switch (type) {
            case CAFE -> "Quán cà phê";
            case RESTAURANT -> "Nhà hàng";
            case ATTRACTION -> "Điểm tham quan";
            case HOTEL -> "Khách sạn";
            case ACTIVITY -> "Hoạt động trải nghiệm";
            default -> throw new IllegalArgumentException("Unexpected value: " + type);
        };
    }
}
