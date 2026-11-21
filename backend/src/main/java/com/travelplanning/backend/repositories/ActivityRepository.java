package com.travelplanning.backend.repositories;

import com.travelplanning.backend.entities.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    /**
     * Find all activities scheduled for a specific trip day,
     * ordered sequentially by their timeline position index.
     */
    List<Activity> findByTripDayIdOrderByPositionAsc(UUID tripDayId);

    /**
     * Count the total number of activities scheduled within a specific trip day.
     */
    long countByTripDayId(UUID tripDayId);

    /**
     * Complex Query: Retrieve all activities across all days for an entire trip,
     * eagerly fetching TripDay and Place (with its Destination) to avoid N+1 queries.
     * Sorted chronologically by day number and then by timeline position.
     */
    @Query("""
        SELECT a FROM Activity a
        JOIN FETCH a.tripDay td
        LEFT JOIN FETCH a.place p
        LEFT JOIN FETCH p.destination
        WHERE td.trip.id = :tripId
        ORDER BY td.dayNumber ASC, a.startTime ASC NULLS LAST, a.position ASC
        """)
    List<Activity> findAllByTripIdOrdered(@Param("tripId") UUID tripId);

    /**
     * Complex Query: Calculate the total count of activities scheduled across all days of a trip.
     * Used for the "12 mục đã lên lịch" badge in the Trip Detail overview card.
     */
    @Query("""
        SELECT COUNT(a) FROM Activity a
        WHERE a.tripDay.trip.id = :tripId
        """)
    long countTotalActivitiesByTripId(@Param("tripId") UUID tripId);

    /**
     * Complex Query: Compute the next available timeline position index when appending
     * a new spot to a trip day (returns MAX(position) + 1, or 0 if day has no activities yet).
     */
    @Query("""
        SELECT COALESCE(MAX(a.position) + 1, 0)
        FROM Activity a
        WHERE a.tripDay.id = :tripDayId
        """)
    Integer getNextPositionForTripDay(@Param("tripDayId") UUID tripDayId);

    /**
     * Delete all activities belonging to a specific trip day.
     */
    @Modifying
    @Query("DELETE FROM Activity a WHERE a.tripDay.id = :tripDayId")
    void deleteAllByTripDayId(@Param("tripDayId") UUID tripDayId);

    /**
     * Check if a specific place is currently scheduled as an activity anywhere in a trip.
     * Used to toggle the "✓ Đã thêm" badge on spot cards.
     */
    @Query("""
        SELECT COUNT(a) > 0 FROM Activity a
        WHERE a.tripDay.trip.id = :tripId AND a.place.id = :placeId
        """)
    boolean isPlaceScheduledInTrip(@Param("tripId") UUID tripId, @Param("placeId") UUID placeId);

    /**
     * Batch query: Find all scheduled place IDs across all days for a given trip and collection of place IDs.
     * Prevents N+1 query loop when rendering spot lists.
     */
    @Query("""
        SELECT DISTINCT a.place.id FROM Activity a
        WHERE a.tripDay.trip.id = :tripId AND a.place.id IN :placeIds
        """)
    java.util.Set<UUID> findScheduledPlaceIdsByTripIdAndPlaceIds(
            @Param("tripId") UUID tripId,
            @Param("placeIds") java.util.Collection<UUID> placeIds
    );
}
