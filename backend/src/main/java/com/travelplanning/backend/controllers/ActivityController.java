package com.travelplanning.backend.controllers;

import com.travelplanning.backend.dtos.ApiResponse;
import com.travelplanning.backend.dtos.trip.ActivityResponseDto;
import com.travelplanning.backend.dtos.trip.AddSpotToDayRequest;
import com.travelplanning.backend.security.CustomUserDetails;
import com.travelplanning.backend.services.trip.ActivityManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityManagementService activityManagementService;

    /**
     * Add a spot or activity to a trip day timeline.
     */
    @PostMapping({"/api/trips/{tripId}/days/{dayId}/activities", "/api/v1/trips/{tripId}/days/{dayId}/activities"})
    public ResponseEntity<ApiResponse<ActivityResponseDto>> addSpotToDay(
            @PathVariable("tripId") UUID tripId,
            @PathVariable("dayId") UUID dayId,
            @Valid @RequestBody AddSpotToDayRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        ActivityResponseDto activity = activityManagementService.addSpotToDay(tripId, dayId, request, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Spot added to itinerary successfully", activity));
    }

    /**
     * Update an activity on a trip day timeline.
     */
    @PutMapping({"/api/trips/{tripId}/activities/{activityId}", "/api/v1/trips/{tripId}/activities/{activityId}"})
    public ResponseEntity<ApiResponse<ActivityResponseDto>> updateActivity(
            @PathVariable("tripId") UUID tripId,
            @PathVariable("activityId") UUID activityId,
            @Valid @RequestBody com.travelplanning.backend.dtos.trip.UpdateActivityRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        ActivityResponseDto activity = activityManagementService.updateActivity(tripId, activityId, request, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Activity updated successfully", activity));
    }

    /**
     * Delete an activity from a trip day.
     */
    @DeleteMapping({"/api/trips/{tripId}/activities/{activityId}", "/api/v1/trips/{tripId}/activities/{activityId}"})
    public ResponseEntity<ApiResponse<Void>> deleteActivity(
            @PathVariable("tripId") UUID tripId,
            @PathVariable("activityId") UUID activityId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        activityManagementService.deleteActivity(tripId, activityId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Activity removed successfully", null));
    }
}
