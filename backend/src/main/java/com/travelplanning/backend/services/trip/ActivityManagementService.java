package com.travelplanning.backend.services.trip;

import com.travelplanning.backend.dtos.destination.SpotResponseDto;
import com.travelplanning.backend.dtos.trip.ActivityResponseDto;
import com.travelplanning.backend.dtos.trip.AddSpotToDayRequest;
import com.travelplanning.backend.dtos.trip.UpdateActivityRequest;
import com.travelplanning.backend.entities.*;
import com.travelplanning.backend.enums.ActivityType;
import com.travelplanning.backend.enums.PlaceType;
import com.travelplanning.backend.enums.TripRole;
import com.travelplanning.backend.exceptions.ForbiddenException;
import com.travelplanning.backend.exceptions.ResourceNotFoundException;
import com.travelplanning.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityManagementService {

    private final TripRepository tripRepository;
    private final TripDayRepository tripDayRepository;
    private final ActivityRepository activityRepository;
    private final PlaceRepository placeRepository;
    private final TripSavedPlaceRepository tripSavedPlaceRepository;
    private final TripMemberRepository tripMemberRepository;

    /**
     * Add a spot or custom activity to a specific trip day.
     * Appends to the end of the day's timeline (position = max + 1).
     */
    @Transactional
    public ActivityResponseDto addSpotToDay(UUID tripId, UUID dayId, AddSpotToDayRequest request, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        checkWritePermission(trip, userId);

        TripDay tripDay = tripDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("TripDay", "id", dayId));

        if (!tripDay.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("TripDay does not belong to the specified Trip");
        }

        Place place = null;
        if (request.getPlaceId() != null) {
            place = placeRepository.findById(request.getPlaceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Place", "id", request.getPlaceId()));
        }

        String title = (request.getTitle() != null && !request.getTitle().isBlank())
                ? request.getTitle().trim()
                : (place != null ? place.getName() : "Hoạt động mới");

        int nextPosition = activityRepository.getNextPositionForTripDay(dayId);

        Activity activity = Activity.builder()
                .tripDay(tripDay)
                .place(place)
                .type(request.getType() != null ? request.getType() : ActivityType.VISIT)
                .title(title)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .estCost(request.getEstCost())
                .position(nextPosition)
                .notes(request.getNotes())
                .build();

        Activity savedActivity = activityRepository.save(activity);
        if (request.getStartTime() != null) {
            sortAndReindexDayActivities(dayId);
        }

        log.info("Added activity '{}' to Day {} of Trip '{}'", title, tripDay.getDayNumber(), trip.getTitle());

        boolean isSaved = place != null && tripSavedPlaceRepository.existsByIdTripIdAndIdPlaceId(tripId, place.getId());
        return mapToActivityDto(savedActivity, isSaved);
    }

    /**
     * Update an activity on a trip day timeline and re-sort the day's activities by startTime ascending if needed.
     */
    @Transactional
    public ActivityResponseDto updateActivity(UUID tripId, UUID activityId, UpdateActivityRequest request, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        checkWritePermission(trip, userId);

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity", "id", activityId));

        TripDay tripDay = activity.getTripDay();
        if (!tripDay.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("Activity does not belong to the specified Trip");
        }

        // Check if startTime is being modified
        boolean timeChanged = !Objects.equals(request.getStartTime(), activity.getStartTime());

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            activity.setTitle(request.getTitle().trim());
        }
        if (request.getType() != null) {
            activity.setType(request.getType());
        }
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        if (request.getEstCost() != null) {
            activity.setEstCost(request.getEstCost());
        }
        if (request.getNotes() != null) {
            activity.setNotes(request.getNotes().trim());
        }

        Activity savedActivity = activityRepository.save(activity);

        // Optimization: Only re-sort & re-index all activities in this day if startTime actually changed
        if (timeChanged) {
            sortAndReindexDayActivities(tripDay.getId());
            log.info("Updated activity '{}' and re-sorted Day {} timeline in Trip '{}'",
                    activity.getTitle(), tripDay.getDayNumber(), trip.getTitle());
        } else {
            log.info("Updated activity '{}' in Day {} of Trip '{}' (time unchanged, skipped re-indexing)",
                    activity.getTitle(), tripDay.getDayNumber(), trip.getTitle());
        }

        boolean isSaved = activity.getPlace() != null &&
                tripSavedPlaceRepository.existsByIdTripIdAndIdPlaceId(tripId, activity.getPlace().getId());

        return mapToActivityDto(savedActivity, isSaved);
    }

    /**
     * Remove an activity from a trip day timeline.
     */
    @Transactional
    public void deleteActivity(UUID tripId, UUID activityId, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        checkWritePermission(trip, userId);

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity", "id", activityId));

        TripDay tripDay = activity.getTripDay();
        if (!tripDay.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("Activity does not belong to the specified Trip");
        }

        activityRepository.delete(activity);
        sortAndReindexDayActivities(tripDay.getId());
        log.info("Deleted activity '{}' from Trip '{}'", activity.getTitle(), trip.getTitle());
    }

    private void sortAndReindexDayActivities(UUID tripDayId) {
        List<Activity> dayActivities = activityRepository.findByTripDayIdOrderByPositionAsc(tripDayId);
        if (dayActivities.isEmpty()) {
            return;
        }

        // Sort by startTime ascending (nulls last), preserving position as secondary tiebreaker
        dayActivities.sort(Comparator.comparing(Activity::getStartTime, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(Activity::getPosition, Comparator.nullsLast(Comparator.naturalOrder())));

        for (int i = 0; i < dayActivities.size(); i++) {
            dayActivities.get(i).setPosition(i);
        }
        activityRepository.saveAll(dayActivities);
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
            default -> throw new IllegalArgumentException("Unexpected value: " + type);
        };
    }
}
