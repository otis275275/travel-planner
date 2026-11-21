package com.travelplanning.backend.utils;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Normalizes user search queries by stripping conversational noise and stopwords,
 * mapping common travel synonyms, and producing canonical cache keys and search tokens.
 */
public final class QueryCanonicalizer {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9\\s]");
    private static final Pattern MULTIPLE_SPACES = Pattern.compile("\\s+");

    // Common conversational fillers and subjective adjectives
    private static final Set<String> STOPWORDS = Set.of(
            "quan", "tiem", "cho", "diem", "noi", "khu",
            "dep", "ngon", "chill", "xin", "noi tieng", "hot", "re", "lang man", "tuyet", "tuyet voi",
            "o", "tai", "gan", "de", "ngam", "xem", "co", "cua", "chieu", "vao", "nhat", "rat"
    );

    // Synonym clusters mapping to standard canonical concepts
    private static final Map<String, String> SYNONYM_MAP = new LinkedHashMap<>();

    static {
        // Nature / Scenery cluster
        SYNONYM_MAP.put("quang canh", "nature");
        SYNONYM_MAP.put("phong canh", "nature");
        SYNONYM_MAP.put("thien nhien", "nature");
        SYNONYM_MAP.put("canh dep", "nature");

        // Sunset cluster
        SYNONYM_MAP.put("mat troi lan", "sunset");
        SYNONYM_MAP.put("hoang hon", "sunset");
        SYNONYM_MAP.put("chieu ta", "sunset");

        // Cloud hunting cluster
        SYNONYM_MAP.put("san may", "cloud_hunting");
        SYNONYM_MAP.put("doi may", "cloud_hunting");

        // Cafe cluster
        SYNONYM_MAP.put("ca phe", "cafe");
        SYNONYM_MAP.put("coffee", "cafe");
        SYNONYM_MAP.put("tiem tra", "cafe");

        // Food & Dining cluster
        SYNONYM_MAP.put("an uong", "food");
        SYNONYM_MAP.put("am thuc", "food");
        SYNONYM_MAP.put("dac san", "food");
        SYNONYM_MAP.put("quan an", "food");
        SYNONYM_MAP.put("nha hang", "food");

        // History / Heritage cluster
        SYNONYM_MAP.put("di tich", "history");
        SYNONYM_MAP.put("lich su", "history");
        SYNONYM_MAP.put("kien truc", "history");
    }

    private QueryCanonicalizer() {}

    /**
     * Remove Vietnamese diacritics and convert to lower-case ASCII string.
     */
    public static String unaccent(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }
        String normalized = text.trim().toLowerCase(Locale.ROOT);
        normalized = normalized.replace("đ", "d").replace("Đ", "d");
        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD);
        normalized = DIACRITICS.matcher(normalized).replaceAll("");
        normalized = NON_ALPHANUMERIC.matcher(normalized).replaceAll(" ");
        return MULTIPLE_SPACES.matcher(normalized).replaceAll(" ").trim();
    }

    /**
     * Generate a deterministic, canonical Redis cache key component for a search query.
     * E.g.: "quán cà phê đẹp ngắm hoàng hôn" -> "cafe_sunset"
     */
    public static String toCanonicalKey(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return "all";
        }

        String cleaned = unaccent(rawQuery);

        // Check if the entire multi-word phrase matches a known synonym
        for (Map.Entry<String, String> entry : SYNONYM_MAP.entrySet()) {
            if (cleaned.contains(entry.getKey())) {
                cleaned = cleaned.replace(entry.getKey(), entry.getValue());
            }
        }

        // Split into tokens and remove stopwords
        String[] rawTokens = cleaned.split(" ");
        List<String> validTokens = new ArrayList<>();
        for (String token : rawTokens) {
            token = token.trim();
            if (!token.isBlank() && !STOPWORDS.contains(token)) {
                String mapped = SYNONYM_MAP.getOrDefault(token, token);
                if (!validTokens.contains(mapped)) {
                    validTokens.add(mapped);
                }
            }
        }

        if (validTokens.isEmpty()) {
            return unaccent(rawQuery).replace(" ", "_");
        }

        Collections.sort(validTokens);
        return String.join("_", validTokens);
    }

    /**
     * Extract clean semantic tokens from user input to be passed into PostgreSQL array queries.
     */
    public static List<String> extractTokens(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return List.of();
        }

        String cleaned = unaccent(rawQuery);
        List<String> tokens = new ArrayList<>();

        for (Map.Entry<String, String> entry : SYNONYM_MAP.entrySet()) {
            if (cleaned.contains(entry.getKey())) {
                tokens.add(entry.getValue());
                cleaned = cleaned.replace(entry.getKey(), " ");
            }
        }

        String[] words = cleaned.split(" ");
        for (String word : words) {
            word = word.trim();
            if (!word.isBlank() && word.length() > 1 && !STOPWORDS.contains(word)) {
                String mapped = SYNONYM_MAP.getOrDefault(word, word);
                if (!tokens.contains(mapped)) {
                    tokens.add(mapped);
                }
            }
        }

        return tokens;
    }
}
