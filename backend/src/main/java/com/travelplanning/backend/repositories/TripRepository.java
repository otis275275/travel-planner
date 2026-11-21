package com.travelplanning.backend.repositories;

import com.travelplanning.backend.entities.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TripRepository extends JpaRepository<Trip, UUID> {
    List<Trip> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
}
