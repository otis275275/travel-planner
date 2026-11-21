package com.travelplanning.backend.repositories;

import com.travelplanning.backend.entities.TripMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TripMemberRepository extends JpaRepository<TripMember, UUID> {
    java.util.Optional<TripMember> findByTripIdAndUserId(UUID tripId, UUID userId);
}
