package com.travelplanning.backend.controllers;

import com.travelplanning.backend.dtos.ApiResponse;
import com.travelplanning.backend.dtos.trip.TripSavedPlaceResponseDto;
import com.travelplanning.backend.security.CustomUserDetails;
import com.travelplanning.backend.services.trip.TripSavedPlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller exposing endpoints for bookmarking and managing saved places in a trip.
 */
@RestController
@RequestMapping
@RequiredArgsConstructor
public class TripSavedPlaceController {

    private final TripSavedPlaceService tripSavedPlaceService;

    /**
     * Bookmark / save a spot to the trip's saved list.
     */
    @PostMapping({"/api/trips/{tripId}/saved-places/{placeId}", "/api/v1/trips/{tripId}/saved-places/{placeId}"})
    public ResponseEntity<ApiResponse<TripSavedPlaceResponseDto>> bookmarkSpot(
            @PathVariable("tripId") UUID tripId,
            @PathVariable("placeId") UUID placeId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        TripSavedPlaceResponseDto saved = tripSavedPlaceService.bookmarkSpot(tripId, placeId, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Spot bookmarked successfully", saved));
    }

    /**
     * Remove a bookmarked spot from the trip's saved list.
     */
    @DeleteMapping({"/api/trips/{tripId}/saved-places/{placeId}", "/api/v1/trips/{tripId}/saved-places/{placeId}"})
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            @PathVariable("tripId") UUID tripId,
            @PathVariable("placeId") UUID placeId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        tripSavedPlaceService.removeBookmarkedSpot(tripId, placeId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Bookmark removed successfully", null));
    }

    /**
     * Get all bookmarked spots for a trip.
     */
    @GetMapping({"/api/trips/{tripId}/saved-places", "/api/v1/trips/{tripId}/saved-places"})
    public ResponseEntity<ApiResponse<List<TripSavedPlaceResponseDto>>> getBookmarkedSpots(
            @PathVariable("tripId") UUID tripId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID userId = userDetails != null ? userDetails.getId() : null;
        List<TripSavedPlaceResponseDto> saved = tripSavedPlaceService.getBookmarkedSpots(tripId, userId);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }
}
