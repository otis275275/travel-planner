package com.travelplanning.backend.controllers;

import com.travelplanning.backend.dtos.ApiResponse;
import com.travelplanning.backend.dtos.trip.CreateExpenseRequest;
import com.travelplanning.backend.dtos.trip.ExpenseResponseDto;
import com.travelplanning.backend.security.CustomUserDetails;
import com.travelplanning.backend.services.trip.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    /**
     * Record a new expense for a trip (or specific activity).
     */
    @PostMapping({"/api/trips/{tripId}/expenses", "/api/v1/trips/{tripId}/expenses"})
    public ResponseEntity<ApiResponse<ExpenseResponseDto>> createExpense(
            @PathVariable("tripId") UUID tripId,
            @Valid @RequestBody CreateExpenseRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        ExpenseResponseDto expense = expenseService.createExpense(tripId, request, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense recorded successfully", expense));
    }

    /**
     * Get all recorded expenses for a trip with activity and payer metadata.
     */
    @GetMapping({"/api/trips/{tripId}/expenses", "/api/v1/trips/{tripId}/expenses"})
    public ResponseEntity<ApiResponse<List<ExpenseResponseDto>>> getExpensesByTrip(
            @PathVariable("tripId") UUID tripId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        List<ExpenseResponseDto> expenses = expenseService.getExpensesByTrip(tripId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved successfully", expenses));
    }

    /**
     * Delete an expense by ID.
     */
    @DeleteMapping({"/api/trips/{tripId}/expenses/{expenseId}", "/api/v1/trips/{tripId}/expenses/{expenseId}"})
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @PathVariable("tripId") UUID tripId,
            @PathVariable("expenseId") UUID expenseId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        expenseService.deleteExpense(tripId, expenseId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully", null));
    }
}
