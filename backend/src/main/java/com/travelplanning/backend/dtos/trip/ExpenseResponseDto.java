package com.travelplanning.backend.dtos.trip;

import com.travelplanning.backend.enums.PaymentSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponseDto {

    private UUID id;
    private UUID tripId;
    private UUID activityId;
    private String activityTitle;
    private Integer activityDayNumber;
    private LocalTime activityStartTime;
    private String title;
    private BigDecimal amount;
    private PaymentSource source;
    private UUID paidByUserId;
    private String paidByName;
    private String paidByAvatar;
    private OffsetDateTime createdAt;
}
