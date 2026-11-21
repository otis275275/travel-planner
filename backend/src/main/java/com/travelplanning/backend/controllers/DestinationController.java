package com.travelplanning.backend.controllers;

import com.travelplanning.backend.dtos.ApiResponse;
import com.travelplanning.backend.dtos.destination.DestinationDto;
import com.travelplanning.backend.dtos.destination.SuggestRequestDto;
import com.travelplanning.backend.dtos.destination.SuggestResponseDto;
import com.travelplanning.backend.services.destination.DestinationService;
import com.travelplanning.backend.services.trip.TripSuggestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService destinationService;
    private final TripSuggestionService tripSuggestionService;

    @GetMapping("/top")
    public ResponseEntity<ApiResponse<List<DestinationDto>>> getTopDestinations() {
        List<DestinationDto> destinations = destinationService.getTopDestinations();
        return ResponseEntity.ok(ApiResponse.success(destinations));
    }

    @PostMapping("/suggest")
    public ResponseEntity<ApiResponse<SuggestResponseDto>> suggestDestinations(
            @Valid @RequestBody SuggestRequestDto request) {
        SuggestResponseDto response = tripSuggestionService.suggest(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{placeId}")
    public ResponseEntity<ApiResponse<DestinationDto>> getDestination(
            @PathVariable("placeId") String placeId,
            @RequestParam(name = "name", required = false) String name) {
        DestinationDto destination = destinationService.getOrHydrate(placeId, name);
        return ResponseEntity.ok(ApiResponse.success(destination));
    }
}
