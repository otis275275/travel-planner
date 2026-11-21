package com.travelplanning.backend.dtos.trip;

import com.travelplanning.backend.enums.PaymentSource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateExpenseRequest {

    private UUID activityId;

    @NotBlank(message = "Expense title is required")
    private String title;

    @NotNull(message = "Expense amount is required")
    @Positive(message = "Expense amount must be positive")
    private BigDecimal amount;

    @Builder.Default
    private PaymentSource source = PaymentSource.GROUP_FUND;

    private UUID paidByUserId;
}
