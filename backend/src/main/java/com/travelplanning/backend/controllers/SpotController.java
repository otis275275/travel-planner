package com.travelplanning.backend.controllers;

import com.travelplanning.backend.dtos.ApiResponse;
import com.travelplanning.backend.dtos.destination.SpotResponseDto;
import com.travelplanning.backend.services.destination.SpotDiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller exposing spot discovery, dual-mode search, and detail endpoints
 * for the TripSpotExplorer workspace component.
 */
@RestController
@RequestMapping
@RequiredArgsConstructor
public class SpotController {

    private final SpotDiscoveryService spotDiscoveryService;

    /**
     * Browse spots for a destination filtered by category tab.
     */
    @GetMapping({"/api/destinations/{destinationId}/spots", "/api/v1/destinations/{destinationId}/spots"})
    public ResponseEntity<ApiResponse<Page<SpotResponseDto>>> getSpotsByDestination(
            @PathVariable("destinationId") UUID destinationId,
            @RequestParam(name = "category", defaultValue = "ALL") String category,
            @RequestParam(name = "tripId", required = false) UUID tripId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(50, Math.max(1, size)),
                Sort.by(Sort.Direction.DESC, "rating").and(Sort.by(Sort.Direction.DESC, "reviewsCount")));

        Page<SpotResponseDto> spots = spotDiscoveryService.getSpotsByDestination(destinationId, category, tripId, pageable);
        return ResponseEntity.ok(ApiResponse.success(spots));
    }

    /**
     * Search spots for a destination using Dual-Mode keyword search.
     */
    @GetMapping({"/api/destinations/{destinationId}/spots/search", "/api/v1/destinations/{destinationId}/spots/search"})
    public ResponseEntity<ApiResponse<Page<SpotResponseDto>>> searchSpots(
            @PathVariable("destinationId") UUID destinationId,
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(name = "tripId", required = false) UUID tripId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(50, Math.max(1, size)));

        Page<SpotResponseDto> spots = spotDiscoveryService.searchSpots(destinationId, query, tripId, pageable);
        return ResponseEntity.ok(ApiResponse.success(spots));
    }

    /**
     * Get single spot details with user trip saved/added status.
     */
    @GetMapping({"/api/spots/{spotId}", "/api/v1/spots/{spotId}"})
    public ResponseEntity<ApiResponse<SpotResponseDto>> getSpotById(
            @PathVariable("spotId") UUID spotId,
            @RequestParam(name = "tripId", required = false) UUID tripId) {

        SpotResponseDto spot = spotDiscoveryService.getSpotById(spotId, tripId);
        return ResponseEntity.ok(ApiResponse.success(spot));
    }
}
