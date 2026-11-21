package com.travelplanning.backend.services.destination;

import com.travelplanning.backend.dtos.destination.DestinationDto;
import com.travelplanning.backend.entities.Destination;
import com.travelplanning.backend.exceptions.ResourceNotFoundException;
import com.travelplanning.backend.mappers.DestinationMapper;
import com.travelplanning.backend.repositories.DestinationRepository;
import com.travelplanning.backend.services.external.GeminiService;
import com.travelplanning.backend.services.external.PhotonService;
import com.travelplanning.backend.services.external.UnsplashService;
import com.travelplanning.backend.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DestinationService {

    private final DestinationRepository destinationRepository;
    private final DestinationMapper destinationMapper;
    private final PhotonService photonService;
    private final UnsplashService unsplashService;
    private final GeminiService geminiService;

    private final ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();

    public List<DestinationDto> getTopDestinations() {
        List<Destination> top = destinationRepository.findTop12ByOrderByCreatedAtAsc();
        return destinationMapper.toDtoList(top);
    }

    public Optional<DestinationDto> findByPlaceId(String placeId) {
        return destinationRepository.findByPlaceId(placeId)
                .map(destinationMapper::toDto);
    }

    @Transactional
    //For ONE destination
    public DestinationDto getOrHydrate(String placeId, String displayName) {
        Optional<Destination> existing = destinationRepository.findByPlaceId(placeId);
        // If this place present -> check if photos need backfilling, otherwise return cached DTO
        if (existing.isPresent()) {
            Destination dest = existing.get();
            if (dest.getPhotoUrls() == null || dest.getPhotoUrls().isEmpty()) {
                try {
                    List<String> photos = unsplashService.fetchPhotos(dest.getName());
                    if (!photos.isEmpty()) {
                        dest.setPhotoUrls(photos);
                        dest = destinationRepository.save(dest);
                    }
                } catch (Exception e) {
                    log.warn("Could not backfill photos for {}: {}", dest.getName(), e.getMessage());
                }
            }
            return destinationMapper.toDto(dest);
        }

        String targetName = (displayName != null && !displayName.isBlank())
                ? displayName
                : formatNameFromSlug(placeId);

        log.info("Hydrating new destination: placeId='{}', name='{}'", placeId, targetName);

        //fetch photo -> parallel from unsplash API
        CompletableFuture<List<String>> photosFuture = CompletableFuture.supplyAsync(
                () -> unsplashService.fetchPhotos(targetName),
                virtualExecutor
        );


        // get coordinates, state, country -> parallel from photon geocoding API
        CompletableFuture<PhotonService.PhotonLocationDetails> locationDetailsFuture = CompletableFuture.supplyAsync(
                () -> photonService.geocodeLocationDetails(targetName),
                virtualExecutor
        );

        // get AI content (summarize, pros, cons,...) -> parallel from Gemini API
        CompletableFuture<GeminiService.DestinationAiContent> aiFuture = CompletableFuture.supplyAsync(
                () -> geminiService.hydrateDestination(targetName),
                virtualExecutor
        );

        try {
            CompletableFuture.allOf(photosFuture, locationDetailsFuture, aiFuture).join();

            List<String> photos = photosFuture.join();
            PhotonService.PhotonLocationDetails locationDetails = locationDetailsFuture.join();
            GeminiService.DestinationAiContent ai = aiFuture.join();

            Double lat = locationDetails != null ? locationDetails.latitude() : null;
            Double lng = locationDetails != null ? locationDetails.longitude() : null;
            String state = locationDetails != null ? locationDetails.state() : null;
            String country = locationDetails != null && locationDetails.country() != null
                    ? locationDetails.country()
                    : "Việt Nam";

            String resolvedName = targetName;
            if (resolvedName.contains(",")) {
                // If targetName is "Phan Thiết, Bình Thuận", extract pure name if state is present
                String[] parts = resolvedName.split(",");
                if (parts.length > 0) {
                    resolvedName = parts[0].trim();
                }
            }

            Destination destination = Destination.builder()
                    .placeId(placeId)
                    .name(resolvedName)
                    .state(state)
                    .country(country)
                    .summary(ai.summary())
                    .pros(ai.pros())
                    .cons(ai.cons())
                    .bestTimeToVisit(ai.bestTimeToVisit())
                    .specialtyDishes(ai.specialtyDishes())
                    .estimatedBudget(ai.estimatedBudget())
                    .themeTags(List.of("Khám phá", "Việt Nam"))
                    .photoUrls(photos)
                    .latitude(lat)
                    .longitude(lng)
                    .build();

            Destination saved = destinationRepository.save(destination);
            return destinationMapper.toDto(saved);
        } catch (Exception e) {
            log.error("Failed to hydrate destination '{}': {}", targetName, e.getMessage());
            Throwable cause = e.getCause() != null ? e.getCause() : e;
            if (cause instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw new RuntimeException("Failed to hydrate destination: " + cause.getMessage(), cause);
        }
    }

    private String formatNameFromSlug(String slug) {
        if (slug == null || slug.isBlank()) return "Điểm đến";
        String[] parts = slug.split("-");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (!p.isBlank()) {
                if (!sb.isEmpty()) sb.append(" ");
                sb.append(Character.toUpperCase(p.charAt(0))).append(p.substring(1));
            }
        }
        return sb.toString();
    }
}
