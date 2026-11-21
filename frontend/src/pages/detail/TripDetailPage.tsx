import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { Icon } from "../../components/common/Icon";
import { images } from "../../data/mockData";
import { useGetFullTripDetailsQuery } from "../../services/tripsApi";
import { TripSpotExplorer } from "./TripSpotExplorer";
import { TripItineraryDetails } from "./TripItineraryDetails";
import { FundsPage } from "../funds/FundsPage";

export function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"itinerary" | "funds">(
    tabParam === "funds" || tabParam === "settle" || tabParam === "expenses" ? "funds" : "itinerary"
  );
  const [exporting, setExporting] = useState(false);

  const handleTabChange = (newTab: "itinerary" | "funds") => {
    setActiveTab(newTab);
    if (newTab === "funds") {
      setSearchParams({ tab: "funds" });
    } else {
      setSearchParams({});
    }
  };


  const {
    data: fullTripResponse,
    isLoading,
    isError,
  } = useGetFullTripDetailsQuery(tripId || "", {
    skip: !tripId,
  });

  const trip = fullTripResponse?.data;

  if (isLoading) {
    return (
      <div className="page detail-page" style={{ padding: "40px", textAlign: "center" }}>
        <span className="spinner" style={{ width: "36px", height: "36px", margin: "0 auto 16px" }} />
        <h2>Đang tải không gian làm việc chuyến đi...</h2>
        <p style={{ color: "var(--muted)" }}>Vui lòng đợi trong giây lát.</p>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="page detail-page" style={{ padding: "40px", textAlign: "center" }}>
        <Icon name="warning" size={36} />
        <h2 style={{ marginTop: "12px" }}>Không tìm thấy chuyến đi</h2>
        <p style={{ color: "var(--muted)", margin: "8px 0 18px" }}>
          Chuyến đi không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Button onClick={() => navigate("/trips")}>Quay lại danh sách chuyến đi</Button>
      </div>
    );
  }

  const destinationName = trip.destination?.name || "Điểm đến";
  const coverPhoto =
    (trip.destination?.photoUrls && trip.destination.photoUrls[0]) ||
    images.sapa;

  const formattedDate =
    trip.startDate && trip.endDate
      ? `${trip.startDate} – ${trip.endDate}`
      : "Chưa đặt ngày";

  return (
    <div className="page detail-page">
      {/* Cover Header */}
      <div
        className="cover"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(20,46,40,.82), rgba(20,46,40,.12)), url(${coverPhoto})`,
        }}
      >
        <div>
          <span className="breadcrumb light">Chuyến đi của tôi / Tổng quan</span>
          <h1>{trip.title}</h1>
          <p>
            {formattedDate} · {trip.days.length} ngày · {destinationName}
          </p>
          <div>
            <Button
              onClick={() => {
                const el = document.getElementById("trip-itinerary");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Lịch trình chi tiết
            </Button>
            <Button
              variant="secondary"
              icon="users"
              style={{ color: "#333", backgroundColor: "#f0f1ed" }}
            >
              Mời cộng tác
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Export Banner Simulation */}
      {exporting && (
        <div className="task-banner">
          <span className="spinner" />
          <span>
            <strong>Đang chuẩn bị bản PDF · 64%</strong>
            <small>
              Bạn vẫn có thể tiếp tục sử dụng Triply. Chúng tôi sẽ báo khi hoàn tất.
            </small>
          </span>
          <div className="progress">
            <i />
          </div>
        </div>
      )}

      {/* Trip Workspace Navigation Bar */}
      <div className="trip-nav-tabs">
        <button
          type="button"
          className={activeTab === "itinerary" ? "active" : ""}
          onClick={() => handleTabChange("itinerary")}
        >
          <Icon name="map" size={16} />
          <span>Lịch trình & Khám phá</span>
        </button>
        <button
          type="button"
          className={activeTab === "funds" ? "active" : ""}
          onClick={() => handleTabChange("funds")}
        >
          <Icon name="wallet" size={16} />
          <span>Chi tiêu & Quyết toán</span>
        </button>
      </div>

      {activeTab === "funds" ? (
        <FundsPage
          tripId={trip.id}
          tripTitle={trip.title}
          destinationName={destinationName}
          initialTab={tabParam === "settle" ? "settle" : "expenses"}
        />
      ) : (
        /* Workspace Grid */
        <div className="detail-grid">

        <section>
          {/* Overview Card */}
          <div className="card overview-card">
            <div className="card-title">
              <div>
                <span className="eyebrow">TỔNG QUAN LỊCH TRÌNH</span>
                <h2>
                  {trip.days.length} ngày tại {destinationName}
                </h2>
              </div>
              <Badge tone="success">
                {trip.totalActivitiesCount} mục đã lên lịch
              </Badge>
            </div>

            <div className="overview-days">
              {trip.days.map((day) => (
                <div key={day.id}>
                  <b>NGÀY</b>
                  <strong>{day.dayNumber}</strong>
                  <span>{day.activities.length} hoạt động</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Detailed Itinerary */}
          <div id="trip-itinerary">
            <TripItineraryDetails
              tripId={trip.id}
              days={trip.days}
              totalActivitiesCount={trip.totalActivitiesCount}
            />
          </div>

          {/* Smart Google Maps Spot Discovery with Gemini AI */}
          {trip.destination && (
            <TripSpotExplorer
              tripId={trip.id}
              destinationId={trip.destination.id}
              destinationName={destinationName}
              days={trip.days}
            />
          )}

          {/* Preparation Checklist */}
          <div className="card">
            <div className="card-title">
              <h2>Chuẩn bị trước chuyến đi</h2>
              <span>2 / 4 hoàn tất</span>
            </div>
            <div className="check-items">
              <label>
                <input type="checkbox" defaultChecked />
                Đặt vé di chuyển đến {destinationName}
                <Avatar label="AL" color="yellow" />
              </label>
              <label>
                <input type="checkbox" defaultChecked />
                Kiểm tra dự báo thời tiết
                <Avatar label="MH" />
              </label>
              <label>
                <input type="checkbox" />
                Xác nhận phòng khách sạn
                <Avatar label="LN" color="teal" />
              </label>
              <label>
                <input type="checkbox" />
                Chuẩn bị hành lý và đồ dùng cá nhân
                <Avatar label="AL" color="yellow" />
              </label>
            </div>
          </div>

          {/* General Notes */}
          <div className="card">
            <div className="card-title">
              <h2>Ghi chú chung</h2>
              <Button variant="ghost">Chỉnh sửa</Button>
            </div>
            <p>
              Chào mừng bạn đến với chuyến đi {destinationName}! Hãy sử dụng thanh tìm kiếm để khám phá các địa điểm nổi tiếng và thêm vào từng ngày.
            </p>
            <small>Cập nhật bởi Triply Concierge</small>
          </div>
        </section>

        {/* Sidebar */}
        <aside>
          {/* Budget Card */}
          <div className="card budget-summary">
            <div className="card-title">
              <h2>Ngân sách dự kiến</h2>
              <Button variant="ghost" onClick={() => handleTabChange("funds")}>
                Chi tiết
              </Button>
            </div>

            <strong>
              {trip.totalBudget
                ? `${new Intl.NumberFormat("vi-VN").format(trip.totalBudget)} ₫`
                : "Chưa đặt ngân sách"}
            </strong>
            <div className="budget-bar">
              <i style={{ width: "45%" }} />
            </div>
            <p>Được thiết lập cho cả chuyến đi</p>
          </div>

          {/* Members Card */}
          <div className="card">
            <div className="card-title">
              <h2>Thành viên</h2>
              <Button variant="ghost">Quản lý</Button>
            </div>
            <div className="member">
              <Avatar label="AL" color="yellow" />
              <span>
                <strong>Bạn</strong>
                <small>Chủ chuyến đi · Toàn quyền chỉnh sửa</small>
              </span>
            </div>
          </div>

          {/* Weather Overview */}
          <div className="card weather-overview">
            <div className="card-title">
              <h2>Thời tiết {destinationName}</h2>
              <Icon name="cloud" />
            </div>
            <strong>21°C · Có mây thoáng đãng</strong>
            <p>Thời tiết lý tưởng cho các hoạt động ngoài trời và chụp ảnh.</p>
          </div>

          {/* Saved Options / Bookmarks */}
          <div className="card">
            <div className="card-title">
              <h2>Lựa chọn đã lưu</h2>
              <Badge>{trip.totalSavedPlacesCount} mục</Badge>
            </div>
            {trip.savedPlaces && trip.savedPlaces.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                {trip.savedPlaces.map((item) => (
                  <div
                    key={item.placeId}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid #f2f3f0",
                    }}
                  >
                    <img
                      src={item.place.image || (item.place.photoUrls && item.place.photoUrls[0]) || "/default-spot.jpg"}
                      alt={item.place.name}
                      style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: "12px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.place.name}
                      </strong>
                      <small style={{ color: "var(--muted)", fontSize: "10px" }}>
                        ★ {item.place.rating} · {item.place.category}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "10px" }}>
                Chưa có địa điểm nào được lưu. Bấm biểu tượng bookmark trên thẻ địa điểm để lưu lại vào đây.
              </p>
            )}
            <small style={{ display: "block", marginTop: "12px", color: "var(--muted)", fontSize: "9px" }}>
              Danh sách lựa chọn được đồng bộ theo thời gian thực cho mọi thành viên.
            </small>
          </div>
        </aside>
      </div>
      )}
    </div>
  );
}

