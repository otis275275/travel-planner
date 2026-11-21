package com.travelplanning.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * Entity representing a bookmarked / saved place for a specific trip
 * before being assigned to a concrete day/time in the itinerary.
 */
@Entity
@Table(name = "trip_saved_places")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripSavedPlace {

    @EmbeddedId
    private TripSavedPlaceId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("tripId")
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("placeId")
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @Column(columnDefinition = "text")
    private String notes;

    @CreationTimestamp
    @Column(name = "saved_at", nullable = false, updatable = false)
    private OffsetDateTime savedAt;
}
