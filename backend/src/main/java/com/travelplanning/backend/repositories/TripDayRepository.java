package com.travelplanning.backend.repositories;

import com.travelplanning.backend.entities.TripDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TripDayRepository extends JpaRepository<TripDay, UUID> {

    /**
     * Find all days belonging to a trip, sorted sequentially by day number (Day 1, Day 2, etc.).
     */
    List<TripDay> findByTripIdOrderByDayNumberAsc(UUID tripId);

    /**
     * Find a specific day within a trip by its day number (e.g. Day 1, Day 2).
     */
    Optional<TripDay> findByTripIdAndDayNumber(UUID tripId, Integer dayNumber);

    /**
     * Count the total number of days configured for a trip.
     */
    long countByTripId(UUID tripId);

    /**
     * Complex Query: Find all days for a trip eagerly joining the Trip entity,
     * ordered sequentially by day number. Avoids lazy-loading exceptions.
     */
    @Query("""
        SELECT td FROM TripDay td
        JOIN FETCH td.trip t
        WHERE t.id = :tripId
        ORDER BY td.dayNumber ASC
        """)
    List<TripDay> findAllByTripIdOrdered(@Param("tripId") UUID tripId);

    /**
     * Compute the maximum day_number currently assigned in a trip.
     * Used when adding an extra day to an existing trip (returns max dayNumber, or 0 if empty).
     */
    @Query("""
        SELECT COALESCE(MAX(td.dayNumber), 0)
        FROM TripDay td
        WHERE td.trip.id = :tripId
        """)
    Integer findMaxDayNumberByTripId(@Param("tripId") UUID tripId);
}
