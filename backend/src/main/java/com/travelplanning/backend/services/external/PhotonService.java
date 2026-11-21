package com.travelplanning.backend.services.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanning.backend.dtos.destination.AutocompleteItemDto;
import com.travelplanning.backend.utils.SlugUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class PhotonService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public PhotonService(
            @Value("${photon.base-url:https://photon.komoot.io}") String photonBaseUrl,
            @Autowired(required = false) ObjectMapper objectMapper) {
        this.restClient = RestClient.builder()
                .baseUrl(photonBaseUrl)
                .build();
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    public List<AutocompleteItemDto> autocomplete(String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }

        try {
            String responseBody = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/")
                            .queryParam("q", query)
                            .queryParam("limit", 6)
                            .queryParam("lang", "en")
                            .build())
                    .retrieve()
                    .body(String.class);

            if (responseBody == null || responseBody.isBlank()) {
                return List.of();
            }

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode features = root.path("features");

            List<AutocompleteItemDto> items = new ArrayList<>();
            if (features.isArray()) {
                for (JsonNode feature : features) {
                    JsonNode props = feature.path("properties");
                    // Example Input 1: name="Hội An", state="Quảng Nam", country="Vietnam"
                    // Example Input 2: name="Hanoi", state="", country="Vietnam"
                    String name = props.path("name").asText("");
                    String state = props.path("state").asText("");
                    String country = props.path("country").asText("");

                    if (name.isBlank()) {
                        continue;
                    }

                    StringBuilder display = new StringBuilder(name);
                    if (!state.isBlank() && !state.equalsIgnoreCase(name)) {
                        display.append(", ").append(state);
                    } else if (!country.isBlank() && !country.equalsIgnoreCase(name)) {
                        display.append(", ").append(country);
                    }

                    // Example 1 displayName: "Hội An, Quảng Nam"
                    // Example 2 displayName: "Hanoi, Vietnam"
                    String displayName = display.toString();

                    // Example 1 placeId: "hoi-an-quang-nam"
                    // Example 2 placeId: "hanoi-vietnam"
                    String placeId = SlugUtils.toSlug(displayName);
                    if (placeId.isBlank()) {
                        placeId = SlugUtils.toSlug(name);
                    }

                    items.add(AutocompleteItemDto.builder()
                            .placeId(placeId)
                            .displayName(displayName)
                            .region(state.isBlank() ? country : state)
                            .build());
                }
            }
            return items;
        } catch (Exception e) {
            log.error("Error calling Photon autocomplete for query '{}': {}", query, e.getMessage());
            return List.of();
        }
    }

    public record PhotonLocationDetails(
            Double latitude,
            Double longitude,
            String name,
            String state,
            String country
    ) {}

    // Get longitude, latitude, state and country of a location
    public PhotonLocationDetails geocodeLocationDetails(String locationName) {
        if (locationName == null || locationName.isBlank()) {
            return null;
        }

        try {
            String responseBody = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/")
                            .queryParam("q", locationName)
                            .queryParam("limit", 1)
                            .queryParam("lang", "en")
                            .build())
                    .retrieve()
                    .body(String.class);

            if (responseBody == null || responseBody.isBlank()) {
                return null;
            }

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode features = root.path("features");
            if (features.isArray() && !features.isEmpty()) {
                JsonNode first = features.get(0);
                JsonNode coordinates = first.path("geometry").path("coordinates");
                JsonNode props = first.path("properties");

                Double lat = null;
                Double lng = null;
                if (coordinates.isArray() && coordinates.size() >= 2) {
                    lng = coordinates.get(0).asDouble();
                    lat = coordinates.get(1).asDouble();
                }

                String name = props.path("name").asText(locationName);
                String state = props.path("state").asText(null);
                String country = props.path("country").asText("Việt Nam");
                if ("Vietnam".equalsIgnoreCase(country)) {
                    country = "Việt Nam";
                }

                return new PhotonLocationDetails(lat, lng, name, state, country);
            }
        } catch (Exception e) {
            log.error("Error geocoding location '{}': {}", locationName, e.getMessage());
        }
        return null;
    }

    // Get longitude and latitude of a location
    public double[] geocode(String locationName) {
        PhotonLocationDetails details = geocodeLocationDetails(locationName);
        if (details != null && details.latitude() != null && details.longitude() != null) {
            return new double[]{details.latitude(), details.longitude()};
        }
        return null;
    }
}
