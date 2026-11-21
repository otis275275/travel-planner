package com.travelplanning.backend.services.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanning.backend.exceptions.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class UnsplashService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String accessKey;

    public UnsplashService(
            @Value("${unsplash.base-url:https://api.unsplash.com}") String unsplashBaseUrl,
            @Value("${unsplash.access-key:}") String accessKey,
            @Autowired(required = false) ObjectMapper objectMapper) {
        this.restClient = RestClient.builder()
                .baseUrl(unsplashBaseUrl)
                .build();
        this.accessKey = accessKey;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    public List<String> fetchPhotos(String locationName) {
        if (accessKey == null || accessKey.isBlank()) {
            throw new BadRequestException("Unsplash access key is not configured");
        }

        if (locationName == null || locationName.isBlank()) {
            return List.of();
        }

        List<String> photos = searchUnsplash(locationName.trim());
        if (photos.isEmpty()) {
            // Try ASCII normalized version if diacritics caused 0 results (e.g., "Đà Nẵng" -> "Da Nang")
            String asciiQuery = com.travelplanning.backend.utils.SlugUtils.toSlug(locationName).replace("-", " ");
            if (!asciiQuery.isBlank() && !asciiQuery.equalsIgnoreCase(locationName)) {
                photos = searchUnsplash(asciiQuery);
            }
        }
        return photos;
    }

    private List<String> searchUnsplash(String query) {
        try {
            String responseBody = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/photos")
                            .queryParam("query", query)
                            .queryParam("per_page", 5)
                            .queryParam("orientation", "landscape")
                            .build())
                    .header("Authorization", "Client-ID " + accessKey)
                    .retrieve()
                    .body(String.class);

            if (responseBody == null || responseBody.isBlank()) {
                return List.of();
            }

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode results = root.path("results");

            List<String> photos = new ArrayList<>();
            if (results.isArray()) {
                for (JsonNode photoNode : results) {
                    String photoUrl = extractPhotoUrl(photoNode);
                    if (photoUrl != null && !photoUrl.isBlank()) {
                        photos.add(photoUrl);
                    }
                }
            }
            return photos;
        } catch (Exception e) {
            log.error("Error fetching photos from Unsplash for '{}': {}", query, e.getMessage());
            return List.of();
        }
    }

    private String extractPhotoUrl(JsonNode photoNode) {
        JsonNode urls = photoNode.path("urls");
        if (urls.isMissingNode() || urls.isNull()) {
            return null;
        }

        String[] fields = {"regular", "full", "raw", "small", "small_s3", "thumb"};
        for (String field : fields) {
            String url = urls.path(field).asText(null);
            if (url != null && !url.isBlank()) {
                return url;
            }
        }
        return null;
    }
}
