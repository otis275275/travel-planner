package com.travelplanning.backend.services.trip;

import com.travelplanning.backend.dtos.destination.SpotResponseDto;
import com.travelplanning.backend.dtos.trip.*;
import com.travelplanning.backend.entities.*;
import com.travelplanning.backend.enums.PlaceType;
import com.travelplanning.backend.enums.TripRole;
import com.travelplanning.backend.exceptions.ForbiddenException;
import com.travelplanning.backend.exceptions.ResourceNotFoundException;
import com.travelplanning.backend.mappers.DestinationMapper;
import com.travelplanning.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripDetailService {

    private final TripRepository tripRepository;
    private final TripDayRepository tripDayRepository;
    private final ActivityRepository activityRepository;
    private final TripSavedPlaceRepository tripSavedPlaceRepository;
    private final TripMemberRepository tripMemberRepository;
    private final DestinationMapper destinationMapper;

    /**
     * Retrieve the comprehensive workspace payload for TripDetailPage:
     * - Trip metadata
     * - Chronologically sorted trip days with ordered timeline activities
     * - Bookmarked / saved spots list
     * - Activity count & Saved spot count
     */
    @Transactional
    public TripFullDetailsResponseDto getFullTripDetails(UUID tripId, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        TripRole role = checkReadPermission(trip, userId);

        // Fetch or initialize Days
        List<TripDay> days = tripDayRepository.findByTripIdOrderByDayNumberAsc(tripId);
        if (days.isEmpty()) {
            log.info("Trip '{}' ({}) has no days configured. Initializing Day 1...", trip.getTitle(), tripId);
            TripDay day1 = TripDay.builder()
                    .trip(trip)
                    .dayNumber(1)
                    .date(trip.getStartDate())
                    .build();
            days = List.of(tripDayRepository.save(day1));
        }

        // Fetch all activities for the entire trip (single JOIN FETCH query)
        List<Activity> allActivities = activityRepository.findAllByTripIdOrdered(tripId);

        // Group activities by tripDayId
        Map<UUID, List<Activity>> activitiesByDayId = allActivities.stream()
                .collect(Collectors.groupingBy(a -> a.getTripDay().getId()));

        // Fetch all saved places for the trip (single JOIN FETCH query)
        List<TripSavedPlace> savedPlaces = tripSavedPlaceRepository.findAllByTripIdWithPlaceDetails(tripId);

        // Set of all scheduled place IDs in the trip for fast lookup
        Set<UUID> scheduledPlaceIds = allActivities.stream()
                .filter(a -> a.getPlace() != null)
                .map(a -> a.getPlace().getId())
                .collect(Collectors.toSet());

        // Set of all saved place IDs
        Set<UUID> savedPlaceIds = savedPlaces.stream()
                .map(sp -> sp.getId().getPlaceId())
                .collect(Collectors.toSet());

        // Map Days with Activities
        List<TripDayDetailsDto> dayDtos = days.stream()
                .map(day -> {
                        //Get activities of one day per loop
                    List<Activity> dayActivities = activitiesByDayId.getOrDefault(day.getId(), Collections.emptyList());
                    List<ActivityResponseDto> activityDtos = dayActivities.stream()
                            .map(act -> mapToActivityDto(act, savedPlaceIds.contains(act.getPlace() != null ? act.getPlace().getId() : null)))
                            .toList();

                    return TripDayDetailsDto.builder()
                            .id(day.getId())
                            .tripId(tripId)
                            .dayNumber(day.getDayNumber())
                            .date(day.getDate())
                            .notes(day.getNotes())
                            .activities(activityDtos)
                            .build();
                })
                .toList();

        // Map Saved Places
        List<TripSavedPlaceResponseDto> savedPlaceDtos = savedPlaces.stream()
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

        return TripFullDetailsResponseDto.builder()
                .id(trip.getId())
                .title(trip.getTitle())
                .destination(trip.getDestination() != null ? destinationMapper.toDto(trip.getDestination()) : null)
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .totalBudget(trip.getTotalBudget())
                .status(trip.getStatus())
                .role(role)
                .days(dayDtos)
                .savedPlaces(savedPlaceDtos)
                .totalActivitiesCount(allActivities.size())
                .totalSavedPlacesCount(savedPlaces.size())
                .build();
    }

    /**
     * Add an additional day to the trip itinerary.
     */
    @Transactional
    public TripDayDetailsDto addDay(UUID tripId, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        checkWritePermission(trip, userId);

        int nextDayNumber = tripDayRepository.findMaxDayNumberByTripId(tripId) + 1;
        LocalDate dayDate = trip.getStartDate() != null ? trip.getStartDate().plusDays(nextDayNumber - 1) : null;

        TripDay newDay = TripDay.builder()
                .trip(trip)
                .dayNumber(nextDayNumber)
                .date(dayDate)
                .build();

        TripDay savedDay = tripDayRepository.save(newDay);

        return TripDayDetailsDto.builder()
                .id(savedDay.getId())
                .tripId(tripId)
                .dayNumber(savedDay.getDayNumber())
                .date(savedDay.getDate())
                .notes(savedDay.getNotes())
                .activities(List.of())
                .build();
    }

    /**
     * Delete a day and all its scheduled activities from the trip.
     */
    @Transactional
    public void deleteDay(UUID tripId, UUID dayId, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        checkWritePermission(trip, userId);

        TripDay day = tripDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("TripDay", "id", dayId));

        if (!day.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("TripDay does not belong to this Trip");
        }

        activityRepository.deleteAllByTripDayId(dayId);
        tripDayRepository.delete(day);
    }

    private TripRole checkReadPermission(Trip trip, UUID userId) {
        if (userId == null) {
            return TripRole.VIEWER;
        }
        if (trip.getOwner().getId().equals(userId)) {
            return TripRole.OWNER;
        }
        return tripMemberRepository.findByTripIdAndUserId(trip.getId(), userId)
                .map(TripMember::getRole)
                .orElse(TripRole.VIEWER);
    }

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

    private ActivityResponseDto mapToActivityDto(Activity act, boolean isSaved) {
        SpotResponseDto spotDto = null;
        if (act.getPlace() != null) {
            spotDto = mapPlaceToSpotDto(act.getPlace(), isSaved, true);
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
            default -> "Địa điểm nổi tiếng";
        };
    }
}
