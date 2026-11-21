package com.travelplanning.backend.services.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanning.backend.dtos.destination.SuggestRequestDto;
import com.travelplanning.backend.exceptions.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String baseUrl;

    public record DestinationAiContent(
            String summary,
            List<String> pros,
            List<String> cons,
            String bestTimeToVisit,
            List<String> specialtyDishes,
            String estimatedBudget
    ) {}

    public GeminiService(
            @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent}") String baseUrl,
            @Value("${gemini.api-key:}") String apiKey,
            @Autowired(required = false) ObjectMapper objectMapper) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
        this.restClient = RestClient.builder().build();
    }

    public DestinationAiContent hydrateDestination(String locationName) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException("Gemini API key is not configured");
        }

        String prompt = String.format("""
                Bạn là chuyên gia du lịch Việt Nam am hiểu sâu sắc. Hãy cung cấp thông tin hấp dẫn và chính xác cho địa điểm "%s".
                Trả về JSON có cấu trúc sau:
                {
                  "summary": "chuỗi 3 câu mô tả đầy cảm hứng và nổi bật về địa điểm",
                  "pros": ["ưu điểm 1", "ưu điểm 2", "ưu điểm 3"],
                  "cons": ["nhược điểm hoặc lưu ý 1", "nhược điểm hoặc lưu ý 2"],
                  "best_time_to_visit": "chuỗi ngắn gọn (ví dụ: Tháng 9 – 11)",
                  "specialty_dishes": ["món đặc sản 1", "món đặc sản 2", "món đặc sản 3"],
                  "estimated_budget": "ước tính chi phí (ví dụ: 1.000.000 – 2.500.000 ₫/người/ngày)"
                }
                """, locationName);

        String jsonText = callGemini(prompt);
        try {
            JsonNode root = objectMapper.readTree(cleanJsonText(jsonText));
            String summary = root.path("summary").asText("");
            List<String> pros = readStringList(root.path("pros"));
            List<String> cons = readStringList(root.path("cons"));
            String bestTimeToVisit = root.path("best_time_to_visit").asText("");
            List<String> specialtyDishes = readStringList(root.path("specialty_dishes"));
            String estimatedBudget = root.path("estimated_budget").asText("");

            return new DestinationAiContent(summary, pros, cons, bestTimeToVisit, specialtyDishes, estimatedBudget);
        } catch (Exception e) {
            log.error("Failed to parse Gemini response for destination {}: {}", locationName, e.getMessage());
            throw new BadRequestException("Failed to generate destination content with AI: " + e.getMessage());
        }
    }

    public List<String> suggestDestinations(SuggestRequestDto req) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException("Gemini API key is not configured");
        }

        String regionVi = switch (req.getRegion().toUpperCase()) {
            case "NORTH" -> "Miền Bắc";
            case "CENTRAL" -> "Miền Trung";
            case "SOUTH" -> "Miền Nam";
            default -> "bất kỳ miền nào ở Việt Nam";
        };

        String vibeVi = switch (req.getVibe().toUpperCase()) {
            case "NATURE" -> "Thiên nhiên, núi rừng, cảnh quan kỳ vĩ";
            case "BEACH" -> "Biển đảo, nghỉ dưỡng ven biển, lặn ngắm san hô";
            case "HISTORY" -> "Lịch sử, văn hóa cổ kính, di sản thế giới";
            case "FOOD" -> "Ẩm thực đường phố, đặc sản địa phương phong phú";
            case "PHOTO" -> "Chụp ảnh, cảnh đẹp check-in sống ảo, nghệ thuật";
            default -> req.getVibe();
        };

        String companionVi = switch (req.getCompanion().toUpperCase()) {
            case "SOLO" -> "Đi một mình (Solo)";
            case "COUPLE" -> "Cặp đôi / Tuần trăng mật";
            case "FRIENDS" -> "Nhóm bạn trẻ thích khám phá";
            case "FAMILY" -> "Gia đình có trẻ em hoặc người lớn tuổi";
            default -> req.getCompanion();
        };

        String prompt = String.format("""
                Người dùng muốn đi du lịch tại vùng %s vào Tháng %d với phong cách/chủ đề: "%s" và đối tượng đồng hành: "%s".
                Hãy gợi ý đúng 3 điểm đến nổi tiếng và phù hợp nhất ở Việt Nam (tên tỉnh hoặc thành phố/thị trấn du lịch, ví dụ: Sa Pa, Đà Nẵng, Phú Quốc, Ninh Bình, Hà Giang, Hội An).
                Trả về JSON định dạng:
                {
                  "destinations": ["Tên điểm 1", "Tên điểm 2", "Tên điểm 3"]
                }
                """, regionVi, req.getTravelMonth(), vibeVi, companionVi);

        String jsonText = callGemini(prompt);
        try {
            JsonNode root = objectMapper.readTree(cleanJsonText(jsonText));
            JsonNode destNode = root.path("destinations");
            if (destNode.isArray()) {
                return readStringList(destNode);
            } else if (root.isArray()) {
                return readStringList(root);
            }
            return List.of();
        } catch (Exception e) {
            log.error("Failed to parse Gemini suggestion response: {}", e.getMessage());
            throw new BadRequestException("Failed to generate destination suggestions: " + e.getMessage());
        }
    }

    /**
     * Synthesize a concise 1-sentence traveler sentiment review snapshot ("Khách du lịch nói gì?")
     * based on place metadata, without making expensive SerpAPI review API calls.
     */
    public String generateReviewSnapshot(String placeName, String type, Float rating, String area, List<String> tags) {
        if (apiKey == null || apiKey.isBlank()) {
            return generateDefaultReviewSnapshot(placeName, rating);
        }

        String prompt = String.format("""
                Bạn là chuyên gia du lịch am hiểu đánh giá thực tế từ cộng đồng du khách. Hãy viết đúng 1 câu ngắn gọn tóm tắt "Khách du lịch nói gì?" về địa điểm sau:
                - Tên: %s
                - Thể loại: %s
                - Đánh giá: %.1f sao
                - Khu vực: %s
                - Đặc trưng: %s

                Yêu cầu:
                1. Trả về JSON: {"review": "chuỗi 1 câu súc tích (15-25 từ) mang giọng điệu du khách thực tế khen điểm nổi bật và dặn lưu ý nhỏ"}
                2. Ví dụ: "Khung cảnh hoàng hôn rất đẹp, dễ đi và nên đến trước 17 giờ để chọn bàn đẹp ngắm đồi thông."
                """,
                placeName,
                type != null ? type : "Địa điểm",
                rating != null ? rating : 4.5f,
                area != null ? area : "trung tâm",
                tags != null && !tags.isEmpty() ? String.join(", ", tags) : "du lịch khám phá"
        );

        try {
            String jsonText = callGemini(prompt);
            JsonNode root = objectMapper.readTree(cleanJsonText(jsonText));
            String review = root.path("review").asText("");
            if (!review.isBlank()) {
                return review.trim();
            }
        } catch (Exception e) {
            log.warn("Gemini review synthesis fallback for {}: {}", placeName, e.getMessage());
        }

        return generateDefaultReviewSnapshot(placeName, rating);
    }

    private String generateDefaultReviewSnapshot(String placeName, Float rating) {
        float r = rating != null ? rating : 4.5f;
        if (r >= 4.6f) {
            return "Khung cảnh đẹp, dịch vụ chu đáo và được đông đảo du khách đánh giá rất cao khi ghé thăm.";
        } else if (r >= 4.2f) {
            return "Không gian thoáng đãng, dễ di chuyển và rất thích hợp để trải nghiệm cùng bạn bè hoặc gia đình.";
        } else {
            return "Điểm dừng chân thú vị, nên kiểm tra thời tiết và liên hệ trước để có trải nghiệm trọn vẹn nhất.";
        }
    }

    private String callGemini(String prompt) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    ),
                    "generationConfig", Map.of(
                            "responseMimeType", "application/json"
                    )
            );

            String url = baseUrl + "?key=" + apiKey;
            String responseBody = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (responseBody == null || responseBody.isBlank()) {
                throw new BadRequestException("Empty response from Gemini AI");
            }

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText("");
                }
            }
            throw new BadRequestException("No candidate content received from Gemini AI");
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            throw new BadRequestException("Gemini API error: " + e.getMessage());
        }
    }

    //clean up JSON responses generated by Large Language Models (LLMs)
    private String cleanJsonText(String raw) {
        if (raw == null) return "{}";
        String trimmed = raw.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }

    private List<String> readStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node.isArray()) {
            for (JsonNode item : node) {
                String val = item.asText("").trim();
                if (!val.isBlank()) {
                    list.add(val);
                }
            }
        }
        return list;
    }
}
