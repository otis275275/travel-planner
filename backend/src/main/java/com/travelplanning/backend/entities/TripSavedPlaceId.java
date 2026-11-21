package com.travelplanning.backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/**
 * Composite Primary Key for TripSavedPlace (Bookmark entity).
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripSavedPlaceId implements Serializable {

    @Column(name = "trip_id")
    private UUID tripId;

    @Column(name = "place_id")
    private UUID placeId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TripSavedPlaceId that = (TripSavedPlaceId) o;
        return Objects.equals(tripId, that.tripId) && Objects.equals(placeId, that.placeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tripId, placeId);
    }
}
