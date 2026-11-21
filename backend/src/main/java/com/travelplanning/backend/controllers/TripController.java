package com.travelplanning.backend.controllers;

import com.travelplanning.backend.dtos.ApiResponse;
import com.travelplanning.backend.dtos.trip.CreateDraftTripFromDestinationRequest;
import com.travelplanning.backend.dtos.trip.CreateTripRequest;
import com.travelplanning.backend.dtos.trip.DraftTripResponse;
import com.travelplanning.backend.dtos.trip.TripDayDetailsDto;
import com.travelplanning.backend.dtos.trip.TripFullDetailsResponseDto;
import com.travelplanning.backend.dtos.trip.TripResponse;
import com.travelplanning.backend.dtos.trip.UpdateTripRequest;
import com.travelplanning.backend.security.CustomUserDetails;
import com.travelplanning.backend.services.trip.TripDetailService;
import com.travelplanning.backend.services.trip.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/trips", "/api/v1/trips"})
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;
    private final TripDetailService tripDetailService;

    @PostMapping
    public ResponseEntity<ApiResponse<TripResponse>> createTrip(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateTripRequest request) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        TripResponse response = tripService.createTrip(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Trip created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TripResponse>>> getUserTrips(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        List<TripResponse> trips = tripService.getUserTrips(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(trips));
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<ApiResponse<TripResponse>> getTripById(
            @PathVariable("tripId") UUID tripId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        TripResponse response = tripService.getTripById(tripId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<ApiResponse<TripResponse>> updateTrip(
            @PathVariable("tripId") UUID tripId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateTripRequest request) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        TripResponse response = tripService.updateTrip(tripId, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Trip updated successfully", response));
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<ApiResponse<Void>> deleteTrip(
            @PathVariable("tripId") UUID tripId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        tripService.deleteTrip(tripId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Trip deleted successfully", null));
    }

    @PostMapping("/from-destination")
    public ResponseEntity<ApiResponse<DraftTripResponse>> createDraftTripFromDestination(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateDraftTripFromDestinationRequest request) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        DraftTripResponse response = tripService.createDraftFromDestination(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Draft trip created successfully", response));
    }

    // ── Trip Workspace & Details Endpoints ─────────────────────────────────────

    /**
     * Retrieve full trip workspace details (days, activities, saved places, destination info).
     */
    @GetMapping("/{tripId}/full-details")
    public ResponseEntity<ApiResponse<TripFullDetailsResponseDto>> getFullTripDetails(
            @PathVariable("tripId") UUID tripId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID userId = userDetails != null ? userDetails.getId() : null;
        TripFullDetailsResponseDto details = tripDetailService.getFullTripDetails(tripId, userId);
        return ResponseEntity.ok(ApiResponse.success(details));
    }

    /**
     * Add a new day to the trip itinerary (+ Ngày 2, + Ngày 3).
     */
    @PostMapping("/{tripId}/days")
    public ResponseEntity<ApiResponse<TripDayDetailsDto>> addDay(
            @PathVariable("tripId") UUID tripId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        TripDayDetailsDto day = tripDetailService.addDay(tripId, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Day added successfully", day));
    }

    /**
     * Delete a day and its activities from the trip itinerary.
     */
    @DeleteMapping("/{tripId}/days/{dayId}")
    public ResponseEntity<ApiResponse<Void>> deleteDay(
            @PathVariable("tripId") UUID tripId,
            @PathVariable("dayId") UUID dayId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        tripDetailService.deleteDay(tripId, dayId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Day deleted successfully", null));
    }
}
