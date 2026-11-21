import { useState, useEffect } from "react";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Icon } from "../../components/common/Icon";
import type { TripSpot, TripDayDetails } from "../../types/trip.types";
import {
  useLazyGetSpotsByDestinationQuery,
  useLazySearchSpotsQuery,
  useAddActivityMutation,
  useBookmarkSpotMutation,
  useRemoveBookmarkedSpotMutation,
} from "../../services/tripsApi";

interface TripSpotExplorerProps {
  destinationId: string;
  destinationName: string;
  tripId: string;
  days: TripDayDetails[];
  onSpotAdded?: (spot: TripSpot, dayNumber: number) => void;
}

export function TripSpotExplorer({
  destinationId,
  destinationName,
  tripId,
  days,
  onSpotAdded,
}: TripSpotExplorerProps) {
  const categories = [
    { label: "Tất cả", value: "ALL" },
    { label: "Quán cà phê", value: "CAFE" },
    { label: "Nhà hàng", value: "RESTAURANT" },
    { label: "Tham quan", value: "ATTRACTION" },
    { label: "Khách sạn", value: "HOTEL" },
    { label: "Trải nghiệm", value: "ACTIVITY" },
  ];

  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [spots, setSpots] = useState<TripSpot[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedSpot, setSelectedSpot] = useState<TripSpot | null>(null);
  const [addingSpot, setAddingSpot] = useState<TripSpot | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [activityTime, setActivityTime] = useState("09:30");
  const [estCost, setEstCost] = useState("");
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [fetchSpots, { isFetching: isFetchingSpots }] = useLazyGetSpotsByDestinationQuery();
  const [searchSpotsApi, { isFetching: isSearching }] = useLazySearchSpotsQuery();
  const [addActivity, { isLoading: isAddingActivity }] = useAddActivityMutation();
  const [bookmarkSpot] = useBookmarkSpotMutation();
  const [removeBookmark] = useRemoveBookmarkedSpotMutation();

  const isLoading = isFetchingSpots || isSearching;

  // Load spots when destination, category changes
  useEffect(() => {
    if (!destinationId) return;

    if (searchQuery.trim()) {
      handleSearch(searchQuery, 0, false);
    } else {
      handleFetchCategory(activeCategory, 0, false);
    }
  }, [destinationId, activeCategory]);

  // Set default selected day when days update
  useEffect(() => {
    if (days && days.length > 0 && !selectedDayId) {
      setSelectedDayId(days[0].id);
    }
  }, [days, selectedDayId]);

  const handleFetchCategory = async (
    cat: string,
    page: number,
    append: boolean,
    forceRefetch = false
  ) => {
    try {
      const res = await fetchSpots(
        {
          destinationId,
          category: cat,
          tripId,
          page,
          size: 20,
        },
        !forceRefetch
      ).unwrap();

      if (res.data) {
        setSpots((prev) => (append ? [...prev, ...res.data.content] : res.data.content));
        setCurrentPage(res.data.number);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err) {
      console.error("Failed to fetch spots:", err);
    }
  };

  const handleSearch = async (
    query: string,
    page: number,
    append: boolean,
    forceRefetch = false
  ) => {
    setSearchError(null);
    if (!query.trim()) {
      handleFetchCategory(activeCategory, 0, false, forceRefetch);
      return;
    }
    try {
      const res = await searchSpotsApi(
        {
          destinationId,
          q: query.trim(),
          tripId,
          page,
          size: 20,
        },
        !forceRefetch
      ).unwrap();

      if (res.data) {
        setSpots((prev) => (append ? [...prev, ...res.data.content] : res.data.content));
        setCurrentPage(res.data.number);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: any) {
      console.error("Failed to search spots:", err);
      setSearchError(err?.data?.message || "Không thể tìm kiếm địa điểm lúc này. Vui lòng thử lại!");
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    handleSearch(searchQuery, 0, false, true);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    if (searchQuery.trim()) {
      handleSearch(searchQuery, nextPage, true, false);
    } else {
      handleFetchCategory(activeCategory, nextPage, true, false);
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent, spot: TripSpot) => {
    e.stopPropagation();
    try {
      if (spot.isSaved) {
        await removeBookmark({ tripId, placeId: spot.id }).unwrap();
        setSpots((prev) =>
          prev.map((s) => (s.id === spot.id ? { ...s, isSaved: false } : s))
        );
        if (selectedSpot?.id === spot.id) {
          setSelectedSpot((prev) => (prev ? { ...prev, isSaved: false } : null));
        }
      } else {
        await bookmarkSpot({ tripId, placeId: spot.id }).unwrap();
        setSpots((prev) =>
          prev.map((s) => (s.id === spot.id ? { ...s, isSaved: true } : s))
        );
        if (selectedSpot?.id === spot.id) {
          setSelectedSpot((prev) => (prev ? { ...prev, isSaved: true } : null));
        }
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  };

  const handleConfirmAdd = async () => {
    if (!addingSpot || !selectedDayId) return;

    try {
      const costNum = estCost ? parseFloat(estCost.replace(/[^0-9]/g, "")) : undefined;

      await addActivity({
        tripId,
        dayId: selectedDayId,
        data: {
          placeId: addingSpot.id,
          title: addingSpot.name,
          startTime: activityTime ? `${activityTime}:00` : undefined,
          estCost: costNum && costNum > 0 ? costNum : undefined,
          notes: addingSpot.description,
        },
      }).unwrap();

      setSpots((prev) =>
        prev.map((s) => (s.id === addingSpot.id ? { ...s, isAdded: true } : s))
      );

      setLastAddedName(addingSpot.name);
      const targetDay = days.find((d) => d.id === selectedDayId);
      if (onSpotAdded && targetDay) {
        onSpotAdded(addingSpot, targetDay.dayNumber);
      }

      setAddingSpot(null);
      setSelectedSpot(null);
      setEstCost("");
    } catch (err) {
      console.error("Failed to add activity:", err);
    }
  };

  return (
    <div className="card trip-spot-explorer">
      {/* Header */}
      <div className="spot-explorer-head">
        <div>
          <span className="eyebrow">KHÁM PHÁ {destinationName.toUpperCase()}</span>
          <h2>Thêm một điểm dừng đáng nhớ</h2>
          <p>Tìm địa điểm nổi bật, xem ảnh và đánh giá trước khi thêm vào lịch trình hiện tại.</p>
        </div>
        <Badge tone="yellow">
          <Icon name="map" size={14} /> {destinationName}
        </Badge>
      </div>

      {/* Search Input */}
      <form className="spot-search" onSubmit={handleSearchSubmit}>
        <div className="search">
          <Icon name="search" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm hồ, quán cà phê, điểm check-in..."
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchError(null);
                handleFetchCategory(activeCategory, 0, false);
              }}
              aria-label="Xóa tìm kiếm"
            >
              <Icon name="close" size={15} />
            </button>
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          icon={isSearching ? undefined : "search"}
        >
          {isSearching ? "Đang tìm..." : "Tìm địa điểm"}
        </Button>
      </form>

      {/* Search Error Alert */}
      {searchError && (
        <div style={{ padding: "4px 22px 10px", color: "var(--danger)", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Icon name="warning" size={14} />
          <span>{searchError}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="spot-categories">
        {categories.map((item) => (
          <button
            key={item.value}
            className={activeCategory === item.value ? "active" : ""}
            onClick={() => {
              setActiveCategory(item.value);
              setSearchQuery("");
            }}
          >
            {item.label}
          </button>
        ))}
        <span>
          {isLoading ? "Đang tìm kiếm..." : `${totalElements || spots.length} địa điểm phù hợp`}
        </span>
      </div>

      {/* Success Notification Banner */}
      {lastAddedName && (
        <div className="spot-added-note">
          <Icon name="check" />
          <span>
            <strong>Đã thêm {lastAddedName} vào lịch trình</strong>
            <small>Bạn có thể đổi ngày, giờ hoặc kéo thả trong workspace lịch trình.</small>
          </span>
          <Button variant="ghost" onClick={() => setLastAddedName(null)}>
            Đóng
          </Button>
        </div>
      )}

      {/* Spot Cards Grid */}
      <div className="trip-spot-grid">
        {spots.map((spot) => (
          <article className="trip-spot-card" key={spot.id || spot.name}>
            <button
              type="button"
              className="spot-photo"
              onClick={() => setSelectedSpot(spot)}
              aria-label={`Xem ảnh và đánh giá ${spot.name}`}
            >
              <img
                src={spot.image || (spot.photoUrls && spot.photoUrls[0]) || "/default-spot.jpg"}
                alt={spot.name}
                loading="lazy"
              />
              <span className="photo-count">
                <Icon name="eye" size={14} /> Xem ảnh
              </span>
              <span
                className={`spot-save ${spot.isSaved ? "active" : ""}`}
                onClick={(e) => handleToggleBookmark(e, spot)}
                title={spot.isSaved ? "Bỏ lưu địa điểm" : "Lưu địa điểm"}
              >
                <Icon name="bookmark" size={16} />
              </span>
            </button>

            <div className="spot-card-body">
              <span className="spot-type">{spot.category}</span>
              <button
                type="button"
                className="spot-title"
                onClick={() => setSelectedSpot(spot)}
              >
                {spot.name}
              </button>
              <p title={spot.address || `${spot.area} · ${spot.distance}`} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Icon name="map" size={12} />
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {spot.address || `${spot.area} · ${spot.distance}`}
                </span>
              </p>
              <div className="spot-rating">
                <b>★ {spot.rating}</b>
                <span>{spot.reviews} đánh giá</span>
                <small>Google Maps</small>
              </div>
              <div className="spot-card-foot">
                <strong>{spot.price || "Giá hợp lý"}</strong>
                {spot.isAdded ? (
                  <Badge tone="success">
                    <Icon name="check" size={13} /> Đã thêm
                  </Badge>
                ) : (
                  <Button
                    variant="secondary"
                    icon="plus"
                    onClick={() => setAddingSpot(spot)}
                  >
                    Thêm vào lịch trình
                  </Button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && spots.length === 0 && (
        <div className="spot-empty">
          <Icon name="search" size={28} />
          <strong>Chưa tìm thấy địa điểm phù hợp</strong>
          <p>Thử từ khóa khác hoặc chọn "Tất cả" để xem thêm gợi ý.</p>
          <Button
            variant="secondary"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("ALL");
            }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="spot-empty" style={{ padding: "20px" }}>
          <span className="spinner" style={{ width: "24px", height: "24px" }} />
          <p style={{ marginTop: "10px", fontSize: "12px", color: "var(--muted)" }}>
            Đợi một chút, đang tải thêm địa điểm từ {destinationName}...
          </p>
        </div>
      )}

      {/* Load More Button */}
      {!isLoading && currentPage + 1 < totalPages && spots.length > 0 && (
        <div className="spot-load-more">
          <Button variant="secondary" onClick={handleLoadMore}>
            Xem thêm địa điểm (+20)
          </Button>
        </div>
      )}

      {/* Spot Detail Drawer */}
      {selectedSpot && (
        <div className="drawer-overlay spot-overlay" onClick={() => setSelectedSpot(null)}>
          <div className="spot-detail-drawer" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="drawer-close"
              onClick={() => setSelectedSpot(null)}
              aria-label="Đóng"
            >
              <Icon name="close" />
            </button>

            <div className="spot-gallery">
              <img
                src={selectedSpot.image || (selectedSpot.photoUrls && selectedSpot.photoUrls[0])}
                alt={selectedSpot.name}
              />
              <span>
                <img
                  src={
                    (selectedSpot.photoUrls && selectedSpot.photoUrls[1]) ||
                    selectedSpot.image
                  }
                  alt={selectedSpot.name}
                />
                <img
                  src={
                    (selectedSpot.photoUrls && selectedSpot.photoUrls[2]) ||
                    selectedSpot.image
                  }
                  alt={selectedSpot.name}
                />
              </span>
            </div>

            <div className="drawer-body">
              <Badge tone="teal">
                {selectedSpot.category.toUpperCase()} · {destinationName.toUpperCase()}
              </Badge>
              <h2>{selectedSpot.name}</h2>
              <div className="detail-rating">
                <strong>★ {selectedSpot.rating}</strong>
                <span>{selectedSpot.reviews} bài đánh giá</span>
                <Badge tone="neutral">Google Maps</Badge>
              </div>

              <p>{selectedSpot.description}</p>

              <div className="spot-facts">
                {selectedSpot.address && (
                  <div className="info-line">
                    <span>Địa chỉ</span>
                    <strong style={{ maxWidth: "68%", textAlign: "right", wordBreak: "break-word" }}>
                      {selectedSpot.address}
                    </strong>
                  </div>
                )}
                <div className="info-line">
                  <span>Khu vực</span>
                  <strong>{selectedSpot.area}</strong>
                </div>
                <div className="info-line">
                  <span>Giờ mở cửa</span>
                  <strong>{selectedSpot.hours || "Mở cửa cả ngày"}</strong>
                </div>
                <div className="info-line">
                  <span>Chi phí dự kiến</span>
                  <strong>{selectedSpot.price || "Giá hợp lý"}</strong>
                </div>
                <div className="info-line">
                  <span>Di chuyển</span>
                  <strong>{selectedSpot.distance}</strong>
                </div>
              </div>

              {/* Gemini Synthesized Review Snapshot */}
              <div className="review-snapshot">
                <span>
                  <strong>{selectedSpot.rating}</strong>
                  <small>Rất tốt</small>
                </span>
                <div>
                  <b>Khách du lịch nói gì?</b>
                  <p>
                    {selectedSpot.reviewSummary
                      ? `"${selectedSpot.reviewSummary}"`
                      : "“Khung cảnh đẹp, dễ di chuyển và rất thích hợp để trải nghiệm cùng bạn bè hoặc gia đình.”"}
                  </p>
                  <small>Tóm tắt thông minh từ đánh giá du khách thực tế</small>
                </div>
              </div>

              <div className="drawer-actions">
                <Button
                  variant="secondary"
                  icon="bookmark"
                  onClick={(e) => handleToggleBookmark(e, selectedSpot)}
                >
                  {selectedSpot.isSaved ? "Đã lưu" : "Lưu địa điểm"}
                </Button>
                <Button
                  icon="plus"
                  onClick={() => {
                    setAddingSpot(selectedSpot);
                  }}
                >
                  Thêm vào lịch trình
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Spot to Day Modal */}
      {addingSpot && (
        <div className="modal-backdrop" onClick={() => setAddingSpot(null)}>
          <div className="spot-add-modal" onClick={(e) => e.stopPropagation()}>
            <span className="feature-icon">
              <Icon name="calendar" />
            </span>
            <Badge tone="yellow">THÊM VÀO LỊCH HIỆN TẠI</Badge>
            <h3>{addingSpot.name}</h3>
            {addingSpot.address && (
              <p style={{ fontSize: "11px", color: "var(--muted)", margin: "2px 0 6px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Icon name="map" size={12} /> {addingSpot.address}
              </p>
            )}
            <p>Chọn thời điểm phù hợp. Bạn vẫn có thể kéo thả hoặc chỉnh sửa sau.</p>

            <div className="field-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "14px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", fontWeight: "600" }}>
                Ngày
                <select
                  value={selectedDayId}
                  onChange={(e) => setSelectedDayId(e.target.value)}
                  style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff" }}
                >
                  {days.map((day) => (
                    <option key={day.id} value={day.id}>
                      Ngày {day.dayNumber} {day.date ? `· ${day.date}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", fontWeight: "600" }}>
                Thời gian
                <input
                  type="time"
                  value={activityTime}
                  onChange={(e) => setActivityTime(e.target.value)}
                  style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--line)" }}
                />
              </label>
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", fontWeight: "600", marginTop: "12px" }}>
              Chi phí dự kiến (tùy chọn)
              <div className="input-suffix">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ví dụ: 150.000"
                  value={estCost}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setEstCost(val ? new Intl.NumberFormat("vi-VN").format(Number(val)) : "");
                  }}
                  style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--line)", width: "100%" }}
                />
                <span>₫</span>
              </div>
            </label>

            <div className="add-preview">
              <small>XEM TRƯỚC</small>
              <strong>
                {activityTime} · {addingSpot.name}
              </strong>
              <span>
                {addingSpot.category} · {estCost ? `Dự kiến: ${estCost} ₫` : (addingSpot.price || "Chưa đặt chi phí")} · {addingSpot.address || addingSpot.distance}
              </span>
            </div>

            <div className="modal-actions">
              <Button variant="secondary" onClick={() => { setAddingSpot(null); setEstCost(""); }}>
                Hủy
              </Button>
              <Button onClick={handleConfirmAdd} disabled={isAddingActivity}>
                {isAddingActivity ? "Đang thêm..." : "Xác nhận thêm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
