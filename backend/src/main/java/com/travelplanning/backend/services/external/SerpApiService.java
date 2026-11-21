package com.travelplanning.backend.services.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Service to interface with SerpAPI Google Maps API (engine=google_maps).
 * Includes Mock Mode to enable development and testing without exhausting the 250 requests/month quota.
 */
@Service
@Slf4j
public class SerpApiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String baseUrl;
    private final boolean mockMode;

    public record SerpApiPlaceItem(
            String title,
            String googlePlaceId,
            String dataId,
            Float rating,
            Integer reviewsCount,
            String priceLevel,
            String openHours,
            String address,
            String area,
            String distanceInfo,
            Double latitude,
            Double longitude,
            String thumbnailUrl,
            List<String> photoUrls,
            String description,
            String primaryType,
            List<String> tags
    ) {}

    public SerpApiService(
            @Value("${serpapi.base-url:https://serpapi.com/search.json}") String baseUrl,
            @Value("${serpapi.api-key:}") String apiKey,
            @Value("${serpapi.mock-mode:true}") boolean mockMode,
            @Autowired(required = false) ObjectMapper objectMapper) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.mockMode = mockMode;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
        this.restClient = RestClient.builder().build();
    }

    /**
     * Search Google Maps places using SerpAPI with pagination offset.
     *
     * @param query Search keywords (e.g. "quán cafe ngắm hoàng hôn", "điểm du lịch nổi tiếng")
     * @param latitude Center latitude for region biasing
     * @param longitude Center longitude for region biasing
     * @param page Page index (0 for first 20 spots, 1 for spots 21-40)
     * @return List of parsed place items
     */
    public List<SerpApiPlaceItem> searchGoogleMaps(String query, Double latitude, Double longitude, int page) {
        if (mockMode || apiKey == null || apiKey.isBlank()) {
            log.info("SerpAPI running in MOCK MODE for query '{}', page {}", query, page);
            return getMockPlaces(query, page);
        }

        try {
            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(baseUrl)
                    .queryParam("engine", "google_maps")
                    .queryParam("q", query)
                    .queryParam("hl", "vi")
                    .queryParam("gl", "vn")
                    .queryParam("start", page * 20)
                    .queryParam("api_key", apiKey);

            if (latitude != null && longitude != null) {
                uriBuilder.queryParam("ll", String.format(Locale.US, "@%.6f,%.6f,14z", latitude, longitude));
            }

            URI uri = uriBuilder.build().toUri();
            log.info("Calling SerpAPI Google Maps: query='{}', start={}, uri={}", query, page * 20, uri);

            String responseBody = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(String.class);

            if (responseBody == null || responseBody.isBlank()) {
                return List.of();
            }

            return parseSerpApiResponse(responseBody);
        } catch (Exception e) {
            log.error("SerpAPI call failed for query '{}': {}. Falling back to mock data.", query, e.getMessage());
            return getMockPlaces(query, page);
        }
    }

    private List<SerpApiPlaceItem> parseSerpApiResponse(String jsonResponse) {
        List<SerpApiPlaceItem> items = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode localResults = root.path("local_results");

            if (localResults.isArray()) {
                for (JsonNode node : localResults) {
                    items.add(parseSingleResultNode(node));
                }
            } else if (root.has("place_results")) {
                items.add(parseSingleResultNode(root.path("place_results")));
            }
        } catch (Exception e) {
            log.error("Failed to parse SerpAPI response: {}", e.getMessage());
        }
        return items;
    }

    private SerpApiPlaceItem parseSingleResultNode(JsonNode node) {
        String title = node.path("title").asText("");
        String googlePlaceId = node.path("place_id").asText("");
        String dataId = node.path("data_id").asText("");
        float rating = (float) node.path("rating").asDouble(4.5);
        int reviewsCount = node.path("reviews").asInt(0);
        String priceLevel = node.path("price").asText("Giá hợp lý");
        String openHours = node.path("open_state").asText(node.path("hours").asText("Mở cửa cả ngày"));
        String address = node.path("address").asText("");
        String area = extractAreaFromAddress(address);
        String distanceInfo = "Khu vực trung tâm";

        double lat = node.path("gps_coordinates").path("latitude").asDouble(0.0);
        double lng = node.path("gps_coordinates").path("longitude").asDouble(0.0);

        String thumbnailUrl = node.path("thumbnail").asText(node.path("serpapi_thumbnail").asText(""));
        List<String> photoUrls = new ArrayList<>();
        if (!thumbnailUrl.isBlank()) {
            photoUrls.add(thumbnailUrl);
        }

        String description = node.path("description").asText(node.path("snippet").asText(""));

        // Support both textual type (local_results) and array type (place_results)
        String primaryType = "ATTRACTION";
        JsonNode typeNode = node.path("type");
        if (typeNode.isTextual() && !typeNode.asText().isBlank()) {
            primaryType = typeNode.asText();
        } else if (typeNode.isArray() && !typeNode.isEmpty()) {
            primaryType = typeNode.get(0).asText("ATTRACTION");
        }

        List<String> tags = new ArrayList<>();
        JsonNode typesNode = node.path("types");
        if (typesNode.isArray()) {
            for (JsonNode t : typesNode) {
                String typeStr = t.asText().toLowerCase(Locale.ROOT).replace(" ", "_");
                if (!typeStr.isBlank() && !tags.contains(typeStr)) {
                    tags.add(typeStr);
                }
            }
        }
        if (typeNode.isArray()) {
            for (JsonNode t : typeNode) {
                String typeStr = t.asText().toLowerCase(Locale.ROOT).replace(" ", "_");
                if (!typeStr.isBlank() && !tags.contains(typeStr)) {
                    tags.add(typeStr);
                }
            }
        }

        return new SerpApiPlaceItem(
                title,
                googlePlaceId,
                dataId,
                rating,
                reviewsCount,
                priceLevel,
                openHours,
                address,
                area,
                distanceInfo,
                lat,
                lng,
                thumbnailUrl,
                photoUrls,
                description,
                primaryType,
                tags
        );
    }

    private String extractAreaFromAddress(String address) {
        if (address == null || address.isBlank()) {
            return "Trung tâm thành phố";
        }
        String[] parts = address.split(",");
        if (parts.length >= 2) {
            return parts[parts.length - 2].trim() + ", " + parts[parts.length - 1].trim();
        }
        return address.trim();
    }

    /**
     * High quality mock spots matching the actual design and categories in design/src/App.tsx.
     */
    private List<SerpApiPlaceItem> getMockPlaces(String query, int page) {
        if (page > 0) {
            // Page 2 mock results
            return List.of(
                    new SerpApiPlaceItem(
                            "Tiệm cà phê Hoàng Hôn Chiều",
                            "mock_place_21",
                            "mock_data_21",
                            4.7f,
                            4280,
                            "55.000 ₫ – 80.000 ₫",
                            "06:00–19:30",
                            "Dốc số 9, Trại Mát, Phường 11, TP. Đà Lạt",
                            "Trại Mát, Đà Lạt",
                            "Cách trung tâm 7,5 km",
                            11.9340, 108.4900,
                            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600",
                            List.of("https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600"),
                            "Quán cà phê săn mây và ngắm hoàng hôn với view thung lũng Trại Mát lãng mạn.",
                            "CAFE",
                            List.of("cafe", "sunset", "view_doi", "cloud_hunting")
                    ),
                    new SerpApiPlaceItem(
                            "Quán Lẩu Gà Lá É Tao Ngộ",
                            "mock_place_22",
                            "mock_data_22",
                            4.6f,
                            8920,
                            "200.000 ₫ – 300.000 ₫",
                            "08:00–21:00",
                            "Số 5 Đường 3 Tháng 4, Phường 3, TP. Đà Lạt",
                            "Đường 3 Tháng 4, Đà Lạt",
                            "Cách trung tâm 1,5 km",
                            11.9300, 108.4410,
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
                            List.of("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"),
                            "Đặc sản lẩu gà lá é trứ danh Đà Lạt với nước dùng cay nhẹ nồng ấm.",
                            "RESTAURANT",
                            List.of("food", "dac_san", "lau_ga", "am_thuc")
                    ),
                    new SerpApiPlaceItem(
                            "Thác Datanla",
                            "mock_place_23",
                            "mock_data_23",
                            4.5f,
                            14200,
                            "50.000 ₫ – 200.000 ₫",
                            "07:30–17:00",
                            "Đèo Prenn, Quốc lộ 20, Phường 3, TP. Đà Lạt",
                            "Đèo Prenn, Đà Lạt",
                            "Cách trung tâm 5 km",
                            11.9030, 108.4500,
                            "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600",
                            List.of("https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600"),
                            "Thác nước kỳ vĩ với hệ thống máng trượt alpine coaster xuyên rừng thông dài nhất Đông Nam Á.",
                            "ATTRACTION",
                            List.of("nature", "thac_nuoc", "adventure", "tham_quan")
                    )
            );
        }

        // Page 1 mock results (Matches design/src/App.tsx line 310-315)
        return List.of(
                new SerpApiPlaceItem(
                        "Hồ Tuyền Lâm",
                        "mock_place_01",
                        "mock_data_01",
                        4.7f,
                        12840,
                        "Miễn phí",
                        "Mở cửa cả ngày",
                        "Phường 4, TP. Đà Lạt, Lâm Đồng",
                        "Phường 4, Đà Lạt",
                        "Cách trung tâm 6,2 km",
                        11.8900, 108.4280,
                        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600",
                        List.of("https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600"),
                        "Không gian hồ yên tĩnh giữa rừng thông, phù hợp đi dạo, ngắm hoàng hôn và chèo SUP.",
                        "ATTRACTION",
                        List.of("nature", "lake", "sunset", "chill", "tham_quan")
                ),
                new SerpApiPlaceItem(
                        "Thiền viện Trúc Lâm",
                        "mock_place_02",
                        "mock_data_02",
                        4.6f,
                        9320,
                        "Miễn phí",
                        "07:00–17:00",
                        "Đồi Phụng Hoàng, Phường 3, TP. Đà Lạt",
                        "Núi Phụng Hoàng, Đà Lạt",
                        "Cách Hồ Tuyền Lâm 8 phút",
                        11.9030, 108.4350,
                        "https://images.unsplash.com/photo-1548013146-72479768bada?w=600",
                        List.of("https://images.unsplash.com/photo-1548013146-72479768bada?w=600"),
                        "Thiền viện trên đồi thông với khuôn viên thanh tĩnh, vườn hoa và tầm nhìn rộng xuống hồ.",
                        "ATTRACTION",
                        List.of("history", "culture", "tam_linh", "kien_truc", "nature")
                ),
                new SerpApiPlaceItem(
                        "Vườn hoa thành phố",
                        "mock_place_03",
                        "mock_data_03",
                        4.5f,
                        6780,
                        "100.000 ₫",
                        "07:00–18:00",
                        "Trần Quốc Toản, Phường 8, TP. Đà Lạt",
                        "Trần Quốc Toản, Đà Lạt",
                        "Cách trung tâm 1,8 km",
                        11.9510, 108.4520,
                        "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600",
                        List.of("https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600"),
                        "Một trong những điểm ngắm hoa nổi tiếng nhất Đà Lạt, có nhiều khu trưng bày và góc chụp ảnh.",
                        "ATTRACTION",
                        List.of("check_in", "nature", "chup_anh", "hoa")
                ),
                new SerpApiPlaceItem(
                        "Dinh Bảo Đại III",
                        "mock_place_04",
                        "mock_data_04",
                        4.4f,
                        5160,
                        "40.000 ₫",
                        "07:00–17:30",
                        "1 Triệu Việt Vương, Phường 4, TP. Đà Lạt",
                        "Triệu Việt Vương, Đà Lạt",
                        "Cách trung tâm 2,4 km",
                        11.9298, 108.4287,
                        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600",
                        List.of("https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600"),
                        "Biệt điện mùa hè mang dấu ấn kiến trúc Đông Dương, lưu giữ nhiều không gian và hiện vật lịch sử.",
                        "ATTRACTION",
                        List.of("history", "architecture", "kien_truc_phap", "di_tich")
                ),
                new SerpApiPlaceItem(
                        "Tiệm cà phê Cheo Veooo",
                        "mock_place_05",
                        "mock_data_05",
                        4.7f,
                        3820,
                        "45.000 ₫ – 75.000 ₫",
                        "07:00–21:00",
                        "116 Hùng Vương, Hẻm Dã Chiến, Phường 11, TP. Đà Lạt",
                        "Hẻm Dã Chiến, Đà Lạt",
                        "Cách trung tâm 4,5 km",
                        11.9420, 108.4720,
                        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600",
                        List.of("https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600"),
                        "Quán cà phê mộc mạc nép mình bên sườn đồi, nơi lý tưởng để ngắm hoàng hôn và nghe nhạc acoustic.",
                        "CAFE",
                        List.of("cafe", "sunset", "view_doi", "acoustic", "chill")
                ),
                new SerpApiPlaceItem(
                        "Lẩu Bò Quán Gỗ Ba Toa",
                        "mock_place_06",
                        "mock_data_06",
                        4.6f,
                        11200,
                        "150.000 ₫ – 250.000 ₫",
                        "10:00–21:30",
                        "1/29 Hoàng Diệu, Phường 5, TP. Đà Lạt",
                        "Hoàng Diệu, Đà Lạt",
                        "Cách trung tâm 1,2 km",
                        11.9380, 108.4320,
                        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
                        List.of("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600"),
                        "Quán lẩu bò nổi tiếng với nồi lẩu ngập thịt, gân bò mềm và nước dùng ngọt thanh đặc trưng.",
                        "RESTAURANT",
                        List.of("food", "lau_bo", "dac_san", "am_thuc")
                )
        );
    }
}
