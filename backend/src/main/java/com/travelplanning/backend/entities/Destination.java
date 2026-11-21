package com.travelplanning.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "destinations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "place_id", unique = true, nullable = false)
    private String placeId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    @Builder.Default
    private String country = "Việt Nam";

    @Column(columnDefinition = "text")
    private String summary;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> pros;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> cons;

    @Column(name = "best_time_to_visit", length = 100)
    private String bestTimeToVisit;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "specialty_dishes", columnDefinition = "text[]")
    private List<String> specialtyDishes;

    @Column(name = "estimated_budget", length = 100)
    private String estimatedBudget;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "theme_tags", columnDefinition = "text[]")
    private List<String> themeTags;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "photo_urls", columnDefinition = "text[]")
    private List<String> photoUrls;

    private Double latitude;

    private Double longitude;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
