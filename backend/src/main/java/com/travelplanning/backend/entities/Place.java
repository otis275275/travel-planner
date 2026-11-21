package com.travelplanning.backend.entities;

import com.travelplanning.backend.enums.PlaceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "places")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @Column(nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "place_type")
    private PlaceType type;

    @Column(columnDefinition = "text")
    private String address;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column
    private Float rating;

    @Column(name = "thumbnail_url", columnDefinition = "text")
    private String thumbnailUrl;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "photo_urls", columnDefinition = "text[]")
    private List<String> photoUrls;

    @Column(name = "reviews_count")
    @Builder.Default
    private Integer reviewsCount = 0;

    @Column(name = "price_level", length = 100)
    private String priceLevel;

    @Column(name = "open_hours", length = 100)
    private String openHours;

    @Column(length = 200)
    private String area;

    @Column(name = "distance_info", length = 100)
    private String distanceInfo;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "review_summary", columnDefinition = "text")
    private String reviewSummary;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "tags", columnDefinition = "text[]")
    private List<String> tags;

    @Column(name = "google_place_id", length = 255)
    private String googlePlaceId;

    @Column(name = "data_id", length = 255)
    private String dataId;

    @Column(name = "external_id", unique = true, length = 255)
    private String externalId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
