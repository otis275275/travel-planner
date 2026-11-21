package com.travelplanning.backend.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class SlugUtils {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern MULTI_HYPHEN = Pattern.compile("-+");

    private SlugUtils() {
    }
    //convert Phan thiết, bình thuận -> phan-thiet-binh-thuan
    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String normalized = input.trim();
        // Replace special Vietnamese characters
        normalized = normalized.replace("đ", "d").replace("Đ", "d");
        // Remove diacritics
        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD);
        normalized = Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
        // Replace whitespace with hyphens
        String noWhitespace = WHITESPACE.matcher(normalized).replaceAll("-");
        // Remove non-alphanumeric chars (excluding hyphens)
        String slug = NONLATIN.matcher(noWhitespace).replaceAll("");
        // Deduplicate hyphens
        slug = MULTI_HYPHEN.matcher(slug).replaceAll("-");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("^-|-$", "");
    }
}  