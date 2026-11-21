package com.travelplanning.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "trip_days")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripDay {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    // 'date' is a reserved word in SQL — quoted to be safe
    @Column(name = "date")
    private LocalDate date;

    @Column
    private String notes;
}
