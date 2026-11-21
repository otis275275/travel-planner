package com.travelplanning.backend.entities;

import com.travelplanning.backend.enums.ActivityType;
import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "activities")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_day_id", nullable = false)
    private TripDay tripDay;

    // nullable — e.g. free time has no fixed place
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "place_id", nullable = true)
    private Place place;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "activity_type")
    @Builder.Default
    private ActivityType type = ActivityType.VISIT;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "est_cost", precision = 14, scale = 0)
    private BigDecimal estCost;

    @Column(nullable = false)
    @Builder.Default
    private Integer position = 0;

    @Column
    private String notes;
}
