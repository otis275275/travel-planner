package com.travelplanning.backend.services.trip;

import com.travelplanning.backend.dtos.trip.CreateExpenseRequest;
import com.travelplanning.backend.dtos.trip.ExpenseResponseDto;
import com.travelplanning.backend.entities.Activity;
import com.travelplanning.backend.entities.Expense;
import com.travelplanning.backend.entities.Trip;
import com.travelplanning.backend.entities.TripMember;
import com.travelplanning.backend.entities.User;
import com.travelplanning.backend.enums.PaymentSource;
import com.travelplanning.backend.enums.TripRole;
import com.travelplanning.backend.exceptions.ForbiddenException;
import com.travelplanning.backend.exceptions.ResourceNotFoundException;
import com.travelplanning.backend.repositories.ActivityRepository;
import com.travelplanning.backend.repositories.ExpenseRepository;
import com.travelplanning.backend.repositories.TripMemberRepository;
import com.travelplanning.backend.repositories.TripRepository;
import com.travelplanning.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final ActivityRepository activityRepository;
    private final TripMemberRepository tripMemberRepository;
    private final UserRepository userRepository;

    /**
     * Record a new expense for a trip, optionally associated with a specific itinerary activity.
     */
    @Transactional
    public ExpenseResponseDto createExpense(UUID tripId, CreateExpenseRequest request, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        checkWritePermission(trip, userId);

        Activity activity = null;
        if (request.getActivityId() != null) {
            activity = activityRepository.findById(request.getActivityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Activity", "id", request.getActivityId()));

            if (activity.getTripDay() == null || !activity.getTripDay().getTrip().getId().equals(tripId)) {
                throw new IllegalArgumentException("Activity does not belong to the specified Trip");
            }
        }

        //Default group fund
        PaymentSource source = request.getSource() != null ? request.getSource() : PaymentSource.GROUP_FUND;
        User paidByUser = null;

        if (source == PaymentSource.PERSONAL_POCKET) {
            UUID payerId = request.getPaidByUserId() != null ? request.getPaidByUserId() : userId;
            paidByUser = userRepository.findById(payerId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", payerId));
        }

        Expense expense = Expense.builder()
                .trip(trip)
                .activity(activity)
                .title(request.getTitle().trim())
                .amount(request.getAmount())
                .source(source)
                .paidByUser(paidByUser) //nullable if source is group fund
                .build();

        Expense saved = expenseRepository.save(expense);
        log.info("Recorded expense '{}' ({}) for Trip '{}'", saved.getTitle(), saved.getAmount(), trip.getTitle());

        return mapToDto(saved);
    }

    /**
     * Retrieve all expenses for a trip with activity and payer details.
     */
    @Transactional(readOnly = true)
    public List<ExpenseResponseDto> getExpensesByTrip(UUID tripId, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        checkReadPermission(trip, userId);

        List<Expense> expenses = expenseRepository.findAllByTripIdWithDetails(tripId);
        return expenses.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Delete an expense record.
     */
    @Transactional
    public void deleteExpense(UUID tripId, UUID expenseId, UUID userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", "id", tripId));

        checkWritePermission(trip, userId);

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        if (!expense.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("Expense does not belong to the specified Trip");
        }

        expenseRepository.delete(expense);
        log.info("Deleted expense '{}' from Trip '{}'", expense.getTitle(), trip.getTitle());
    }

    // ── Internal Helpers ────────────────────────────────────────────────────────

    private void checkReadPermission(Trip trip, UUID userId) {
        if (userId == null) {
            return;
        }
        if (trip.getOwner().getId().equals(userId)) {
            return;
        }
        tripMemberRepository.findByTripIdAndUserId(trip.getId(), userId)
                .orElseThrow(() -> new ForbiddenException("You do not have permission to view expenses for this trip"));
    }

    private void checkWritePermission(Trip trip, UUID userId) {
        if (userId == null) {
            throw new ForbiddenException("Authentication required to modify trip expenses");
        }
        if (trip.getOwner().getId().equals(userId)) {
            return;
        }
        TripMember member = tripMemberRepository.findByTripIdAndUserId(trip.getId(), userId)
                .orElseThrow(() -> new ForbiddenException("You do not have permission to modify this trip"));
        if (member.getRole() != TripRole.OWNER && member.getRole() != TripRole.EDITOR) {
            throw new ForbiddenException("You do not have permission to modify expenses for this trip");
        }
    }

    private ExpenseResponseDto mapToDto(Expense expense) {
        Activity act = expense.getActivity();
        User payer = expense.getPaidByUser();

        return ExpenseResponseDto.builder()
                .id(expense.getId())
                .tripId(expense.getTrip().getId())
                .activityId(act != null ? act.getId() : null)
                .activityTitle(act != null ? act.getTitle() : null)
                .activityDayNumber(act != null && act.getTripDay() != null ? act.getTripDay().getDayNumber() : null)
                .activityStartTime(act != null ? act.getStartTime() : null)
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .source(expense.getSource())
                .paidByUserId(payer != null ? payer.getId() : null)
                .paidByName(payer != null ? payer.getFullName() : null)
                .paidByAvatar(payer != null ? payer.getAvatarUrl() : null)
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
