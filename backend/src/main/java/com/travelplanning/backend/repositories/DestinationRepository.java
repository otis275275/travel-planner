package com.travelplanning.backend.repositories;

import com.travelplanning.backend.entities.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, UUID> {

    Optional<Destination> findByPlaceId(String placeId);

    List<Destination> findTop12ByOrderByCreatedAtAsc();
}
