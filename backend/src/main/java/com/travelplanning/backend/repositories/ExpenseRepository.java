package com.travelplanning.backend.repositories;

import com.travelplanning.backend.entities.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    /**
     * Retrieve all expenses for a specific trip, ordered by creation time descending.
     * Uses join fetch to eagerly load related activity, day, and payer to prevent N+1 queries.
     */
    @Query("""
        SELECT e FROM Expense e
        LEFT JOIN FETCH e.activity a
        LEFT JOIN FETCH a.tripDay td
        LEFT JOIN FETCH e.paidByUser u
        WHERE e.trip.id = :tripId
        ORDER BY e.createdAt DESC
        """)
    List<Expense> findAllByTripIdWithDetails(@Param("tripId") UUID tripId);

    List<Expense> findByActivityId(UUID activityId);

}
