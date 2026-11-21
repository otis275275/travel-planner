package com.travelplanning.backend.services.trip;

import com.travelplanning.backend.dtos.destination.DestinationDto;
import com.travelplanning.backend.dtos.destination.SuggestRequestDto;
import com.travelplanning.backend.dtos.destination.SuggestResponseDto;
import com.travelplanning.backend.services.destination.DestinationService;
import com.travelplanning.backend.services.external.GeminiService;
import com.travelplanning.backend.utils.SlugUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Service
@Slf4j
public class TripSuggestionService {

    private final GeminiService geminiService;
    private final DestinationService destinationService;
    private final Executor virtualThreadExecutor;

    public TripSuggestionService(
            GeminiService geminiService,
            DestinationService destinationService,
            @Qualifier("virtualThreadExecutor") Executor virtualThreadExecutor) {
        this.geminiService = geminiService;
        this.destinationService = destinationService;
        this.virtualThreadExecutor = virtualThreadExecutor;
    }

    // after user input their interests, filter
    public SuggestResponseDto suggest(SuggestRequestDto req) {
        List<String> suggestedNames = geminiService.suggestDestinations(req);
        if (suggestedNames == null || suggestedNames.isEmpty()) {
            return new SuggestResponseDto(List.of());
        }

        // Hydrate all suggested destinations concurrently (Nha trang, mui ne at the same time)
        List<CompletableFuture<DestinationDto>> futures = suggestedNames.stream()
                .map(name -> CompletableFuture.supplyAsync(() -> {
                    String placeId = SlugUtils.toSlug(name);
                    return destinationService.getOrHydrate(placeId, name);
                }, virtualThreadExecutor))
                .toList();

        List<DestinationDto> results = new ArrayList<>();
        for (var future : futures) {
            try {
                results.add(future.join());
            } catch (Exception e) {
                log.error("Failed to hydrate suggested destination: {}", e.getMessage());
            }
        }

        return new SuggestResponseDto(results);
    }
}
