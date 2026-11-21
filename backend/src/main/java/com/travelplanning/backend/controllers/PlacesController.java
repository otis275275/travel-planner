package com.travelplanning.backend.controllers;

import com.travelplanning.backend.dtos.ApiResponse;
import com.travelplanning.backend.dtos.destination.AutocompleteItemDto;
import com.travelplanning.backend.services.external.PhotonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlacesController {

    private final PhotonService photonService;

    @GetMapping("/autocomplete")
    public ResponseEntity<ApiResponse<List<AutocompleteItemDto>>> autocomplete(
            @RequestParam(name = "q", defaultValue = "") String query) {
        List<AutocompleteItemDto> suggestions = photonService.autocomplete(query);
        return ResponseEntity.ok(ApiResponse.success(suggestions));
    }
}
