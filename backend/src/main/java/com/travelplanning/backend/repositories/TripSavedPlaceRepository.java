package com.travelplanning.backend.repositories;

import com.travelplanning.backend.entities.TripSavedPlace;
import com.travelplanning.backend.entities.TripSavedPlaceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TripSavedPlaceRepository extends JpaRepository<TripSavedPlace, TripSavedPlaceId> {

    /**
     * Check if a specific place is already bookmarked / saved in a trip.
     * Prevents duplicate bookmarks on the UI.
     */
    boolean existsByIdTripIdAndIdPlaceId(UUID tripId, UUID placeId);

    /**
     * Count the total number of bookmarked places for a trip.
     * Used for the "Lựa chọn đã lưu · X mục" badge in the Trip Detail sidebar.
     */
    long countByIdTripId(UUID tripId);

    /**
     * Complex Query: Retrieve all bookmarked places for a trip, eagerly fetching Place
     * and its Destination to prevent N+1 query bottlenecks, ordered by save timestamp descending.
     */
    @Query("""
        SELECT sp FROM TripSavedPlace sp
        JOIN FETCH sp.place p
        LEFT JOIN FETCH p.destination
        WHERE sp.id.tripId = :tripId
        ORDER BY sp.savedAt DESC
        """)
    List<TripSavedPlace> findAllByTripIdWithPlaceDetails(@Param("tripId") UUID tripId);

    /**
     * Delete a single bookmark by tripId and placeId.
     * Written with explicit HQL/JPQL for atomic delete execution.
     */
    @Modifying
    @Query("DELETE FROM TripSavedPlace sp WHERE sp.id.tripId = :tripId AND sp.id.placeId = :placeId")
    void deleteByTripIdAndPlaceId(@Param("tripId") UUID tripId, @Param("placeId") UUID placeId);

    /**
     * Batch query: Find saved place IDs for a given trip and collection of place IDs.
     * Prevents N+1 query loop when rendering spot lists.
     */
    @Query("""
        SELECT sp.id.placeId FROM TripSavedPlace sp
        WHERE sp.id.tripId = :tripId AND sp.id.placeId IN :placeIds
        """)
    java.util.Set<UUID> findSavedPlaceIdsByTripIdAndPlaceIds(
            @Param("tripId") UUID tripId,
            @Param("placeIds") java.util.Collection<UUID> placeIds
    );

    /**
     * Delete all bookmarks belonging to a trip when a trip is cleared or deleted.
     */
    @Modifying
    @Query("DELETE FROM TripSavedPlace sp WHERE sp.id.tripId = :tripId")
    void deleteAllByTripId(@Param("tripId") UUID tripId);
}
