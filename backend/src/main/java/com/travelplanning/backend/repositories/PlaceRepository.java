package com.travelplanning.backend.repositories;

import com.travelplanning.backend.entities.Place;
import com.travelplanning.backend.enums.PlaceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlaceRepository extends JpaRepository<Place, UUID> {

  /**
   * Find a place by its unique Google Place ID (e.g. ChIJ...).
   * Used for lookups against Google Maps public entity references.
   */
  Optional<Place> findByGooglePlaceId(String googlePlaceId);

  /**
   * Find a place by its unique SerpAPI / Google Maps data_id hex identifier.
   * Primary method for deduplication to prevent saving duplicate places from
   * SerpAPI.
   */
  Optional<Place> findByDataId(String dataId);

  /**
   * Count how many places are already stored and cached for a destination.
   * Used to determine if initial seeding is needed.
   */
  long countByDestinationId(UUID destinationId);

  /**
   * Check if a specific place (by data_id) already exists within a destination.
   */
  boolean existsByDestinationIdAndDataId(UUID destinationId, String dataId);

  /**
   * Retrieve a paginated list of all places belonging to a destination,
   * ordered by default by rating and reviews count.
   */
  Page<Place> findByDestinationId(UUID destinationId, Pageable pageable);

  /**
   * Retrieve a paginated list of places in a destination filtered by category
   * type
   * (e.g. ATTRACTION, CAFE, RESTAURANT).
   */
  Page<Place> findByDestinationIdAndType(UUID destinationId, PlaceType type, Pageable pageable);

  /**
   * Complex Dual-Mode Search:
   * - Mode A (Exact Name Match): Matches unaccented place name (e.g., 'Hồ Xuân
   * Hương', 'Dinh Bảo Đại')
   * and assigns Priority #1.
   * - Mode B (Thematic Tag & Description Match): Checks array overlap against
   * tags and text in description/reviews
   * and assigns Priority #2.
   * Results are ordered by Match Priority (Exact Name first), then Rating, then
   * Review Count.
   */
  @Query(value = """
      SELECT * FROM places p
      WHERE p.destination_id = :destinationId
        AND (
          -- Mode A: Direct Name Match (Case-insensitive & unaccented)
          unaccent(p.name) ILIKE '%' || unaccent(:rawQuery) || '%'

          -- Mode B: Tag Match (Array overlap) or Description / Review Match
          OR (cast(:hasTokens as boolean) = true AND p.tags && cast(:tokens as text[]))
          OR p.description ILIKE '%' || :rawQuery || '%'
          OR p.review_summary ILIKE '%' || :rawQuery || '%'
        )
      ORDER BY
        CASE
          WHEN unaccent(p.name) ILIKE '%' || unaccent(:rawQuery) || '%' THEN 1
          WHEN cast(:hasTokens as boolean) = true AND p.tags && cast(:tokens as text[]) THEN 2
          ELSE 3
        END,
        p.rating DESC NULLS LAST,
        p.reviews_count DESC NULLS LAST
      """, countQuery = """
      SELECT count(*) FROM places p
      WHERE p.destination_id = :destinationId
        AND (
          unaccent(p.name) ILIKE '%' || unaccent(:rawQuery) || '%'
          OR (cast(:hasTokens as boolean) = true AND p.tags && cast(:tokens as text[]))
          OR p.description ILIKE '%' || :rawQuery || '%'
          OR p.review_summary ILIKE '%' || :rawQuery || '%'
        )
      """, nativeQuery = true)
  Page<Place> searchPlaces(
      @Param("destinationId") UUID destinationId,
      @Param("rawQuery") String rawQuery,
      @Param("tokens") String[] tokens, // split from user input & canonicalized
      @Param("hasTokens") boolean hasTokens,
      Pageable pageable);

  /**
   * Retrieve places in a destination that contain a specific tag in their tags
   * array
   * (e.g., tag = 'nature', 'sunset', 'cafe').
   * Written in native SQL because PostgreSQL uses array ANY operator.
   */
  @Query(value = """
      SELECT * FROM places p
      WHERE p.destination_id = :destinationId
        AND :tag = ANY(p.tags)
      ORDER BY p.rating DESC NULLS LAST, p.reviews_count DESC NULLS LAST
      """, nativeQuery = true)
  List<Place> findByDestinationIdAndTag(
      @Param("destinationId") UUID destinationId,
      @Param("tag") String tag);
}
