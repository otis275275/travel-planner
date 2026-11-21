package com.travelplanning.backend.services.trip;

import com.travelplanning.backend.dtos.trip.CreateDraftTripFromDestinationRequest;
import com.travelplanning.backend.dtos.trip.CreateTripRequest;
import com.travelplanning.backend.dtos.trip.DraftTripResponse;
import com.travelplanning.backend.dtos.trip.TripResponse;
import com.travelplanning.backend.dtos.trip.UpdateTripRequest;
import com.travelplanning.backend.entities.Destination;
import com.travelplanning.backend.entities.Trip;
import com.travelplanning.backend.entities.TripMember;
import com.travelplanning.backend.entities.User;
import com.travelplanning.backend.enums.TripRole;
import com.travelplanning.backend.enums.TripStatus;
import com.travelplanning.backend.exceptions.ForbiddenException;
import com.travelplanning.backend.exceptions.ResourceNotFoundException;
import com.travelplanning.backend.mappers.TripMapper;
import com.travelplanning.backend.repositories.DestinationRepository;
import com.travelplanning.backend.repositories.TripMemberRepository;
import com.travelplanning.backend.repositories.TripRepository;
import com.travelplanning.backend.repositories.UserRepository;
import com.travelplanning.backend.services.destination.DestinationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripService {

    private final TripRepository tripRepository;
    private final TripMemberRepository tripMemberRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final DestinationService destinationService;
    private final TripMapper tripMapper;

    @Transactional
    public TripResponse createTrip(UUID userId, CreateTripRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Find or hydrate Destination
        Destination destination = findOrHydrateDestination(request.getPlaceId(), request.getDestinationName());

        Trip trip = Trip.builder()
                .owner(user)
                .title(request.getTitle())
                .destination(destination)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalBudget(request.getTotalBudget())
                .status(request.getStatus() != null ? request.getStatus() : TripStatus.PLANNED)
                .build();

        Trip savedTrip = tripRepository.save(trip);

        TripMember member = TripMember.builder()
                .trip(savedTrip)
                .user(user)
                .role(TripRole.OWNER)
                .joinedAt(java.time.OffsetDateTime.now())
                .build();

        tripMemberRepository.save(member);

        return tripMapper.toDto(savedTrip);
    }

    @Transactional
    public TripResponse updateTrip(UUID tripId, UUID userId, UpdateTripRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        // Check if user has permission
        if (!trip.getOwner().getId().equals(userId)) {
            TripMember member = tripMemberRepository.findByTripIdAndUserId(tripId, userId)
                    .orElseThrow(() -> new ForbiddenException("You do not have permission to modify this trip"));
            if (member.getRole() != TripRole.OWNER && member.getRole() != TripRole.EDITOR) {
                throw new ForbiddenException("You do not have permission to modify this trip");
            }
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            trip.setTitle(request.getTitle().trim());
        }

        if (request.getPlaceId() != null && !request.getPlaceId().isBlank()) {
            Destination destination = findOrHydrateDestination(request.getPlaceId(), request.getDestinationName());
            if (destination != null) {
                trip.setDestination(destination);
            }
        }

        if (request.getStartDate() != null) {
            trip.setStartDate(request.getStartDate());
        }

        if (request.getEndDate() != null) {
            trip.setEndDate(request.getEndDate());
        }

        if (request.getTotalBudget() != null) {
            trip.setTotalBudget(request.getTotalBudget());
        }

        if (request.getStatus() != null) {
            trip.setStatus(request.getStatus());
        }

        Trip updated = tripRepository.save(trip);
        return tripMapper.toDto(updated);
    }

    @Transactional
    public void deleteTrip(UUID tripId, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

        // Only trip owner can delete
        if (!trip.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("Only the trip owner can delete this trip");
        }

        tripRepository.delete(trip);
    }

    @Transactional
    public DraftTripResponse createDraftFromDestination(UUID userId, CreateDraftTripFromDestinationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Destination destination = findOrHydrateDestination(request.getPlaceId(), request.getDestinationName());

        String tripTitle = "Chuyến đi " + request.getDestinationName();

        Trip trip = Trip.builder()
                .owner(user)
                .title(tripTitle)
                .destination(destination)
                .status(TripStatus.DRAFT)
                .build();

        Trip savedTrip = tripRepository.save(trip);

        TripMember member = TripMember.builder()
                .trip(savedTrip)
                .user(user)
                .role(TripRole.OWNER)
                .joinedAt(java.time.OffsetDateTime.now())
                .build();

        tripMemberRepository.save(member);

        String destName = savedTrip.getDestination() != null
                ? savedTrip.getDestination().getName()
                : request.getDestinationName();

        String destCoverPhoto = (savedTrip.getDestination() != null
                && savedTrip.getDestination().getPhotoUrls() != null
                && !savedTrip.getDestination().getPhotoUrls().isEmpty())
                ? savedTrip.getDestination().getPhotoUrls().get(0)
                : null;

        return DraftTripResponse.builder()
                .tripId(savedTrip.getId())
                .title(savedTrip.getTitle())
                .destination(destName)
                .destinationId(savedTrip.getDestination() != null ? savedTrip.getDestination().getId() : null)
                .placeId(savedTrip.getDestination() != null ? savedTrip.getDestination().getPlaceId() : request.getPlaceId())
                .destinationCoverUrl(destCoverPhoto)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getUserTrips(UUID userId) {
        List<Trip> trips = tripRepository.findByOwnerIdOrderByCreatedAtDesc(userId);
        return tripMapper.toDtoList(trips);
    }

    @Transactional(readOnly = true)
    public TripResponse getTripById(UUID tripId, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        return tripMapper.toDto(trip);
    }

    private Destination findOrHydrateDestination(String placeId, String destinationName) {
        if (placeId == null || placeId.isBlank()) {
            return null;
        }

        return destinationRepository.findByPlaceId(placeId)
                .orElseGet(() -> {
                    try {
                        destinationService.getOrHydrate(placeId, destinationName);
                        return destinationRepository.findByPlaceId(placeId).orElse(null);
                    } catch (Exception e) {
                        log.warn("Could not hydrate destination '{}': {}", placeId, e.getMessage());
                        return null;
                    }
                });
    }
}
