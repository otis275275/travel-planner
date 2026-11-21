import { useState } from "react";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Icon } from "../../components/common/Icon";
import type { TripDayDetails, ActivityResponse } from "../../types/trip.types";
import {
  useAddDayMutation,
  useDeleteActivityMutation,
  useGetExpensesByTripQuery,
} from "../../services/tripsApi";
import { EditActivityModal } from "./EditActivityModal";
import { RecordCostModal } from "./RecordCostModal";

interface TripItineraryDetailsProps {
  tripId: string;
  days: TripDayDetails[];
  totalActivitiesCount: number;
}

export function TripItineraryDetails({
  tripId,
  days,
  totalActivitiesCount,
}: TripItineraryDetailsProps) {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | "all">("all");
  const [addDay, { isLoading: isAddingDay }] = useAddDayMutation();
  const [deleteActivity] = useDeleteActivityMutation();

  // Expenses data
  const { data: expensesRes } = useGetExpensesByTripQuery(tripId);
  const expenses = expensesRes?.data || [];

  // Modal active targets
  //To shows exact in4 of clicked activities
  const [editingActivity, setEditingActivity] = useState<ActivityResponse | null>(null);
  const [recordingCostActivity, setRecordingCostActivity] = useState<ActivityResponse | null>(null);

  const activeDay =
    selectedDayNumber === "all"
      ? null
      : days.find((d) => d.dayNumber === selectedDayNumber);

  /**
   * Sort activities in ascending start time order.
   * Activities with a specified startTime appear first (earliest to latest),
   * followed by activities without a set time (ordered by position).
   */
  const sortActivities = (activities: ActivityResponse[]): ActivityResponse[] => {
    return [...activities].sort((a, b) => {
      const timeA = a.startTime ? a.startTime.substring(0, 5) : "";
      const timeB = b.startTime ? b.startTime.substring(0, 5) : "";
      if (timeA && timeB) {
        return timeA.localeCompare(timeB);
      }
      if (timeA) return -1;
      if (timeB) return 1;
      return (a.position ?? 0) - (b.position ?? 0);
    });
  };

  const handleAddDay = async () => {
    try {
      await addDay(tripId).unwrap();
    } catch (err) {
      console.error("Failed to add day:", err);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hoạt động này khỏi lịch trình?")) {
      return;
    }
    try {
      await deleteActivity({ tripId, activityId }).unwrap();
    } catch (err) {
      console.error("Failed to delete activity:", err);
    }
  };

  return (


    <div className="card trip-itinerary-detail">
      {/* Header */}
      <div className="itinerary-detail-head">
        <div>
          <span className="eyebrow">LỊCH TRÌNH CHI TIẾT</span>
          <h2>
            {activeDay
              ? `Ngày ${activeDay.dayNumber}: ${activeDay.notes || "Lịch trình ngày"}`
              : "Toàn bộ chuyến đi"}
          </h2>
          <p>
            {activeDay
              ? activeDay.date || `Ngày ${activeDay.dayNumber}`
              : `${days.length} ngày · ${totalActivitiesCount} hoạt động`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {activeDay ? (
            <Button variant="ghost" onClick={() => setSelectedDayNumber("all")}>
              ← Xem toàn bộ chuyến đi
            </Button>
          ) : (
            <Button
              variant="secondary"
              icon="plus"
              onClick={handleAddDay}
              disabled={isAddingDay}
            >
              {isAddingDay ? "Đang thêm..." : "+ Thêm ngày"}
            </Button>
          )}
        </div>
      </div>

      {/* Full Trip View (Timeline of Days) */}
      {!activeDay && (
        <div className="full-trip-timeline">
          {days.map((day) => {
            const sortedDayActivities = sortActivities(day.activities);
            return (
              <button
                type="button"
                key={day.id}
                onClick={() => setSelectedDayNumber(day.dayNumber)}
              >
                <span className="trip-day-number">
                  <small>NGÀY</small>
                  <b>{day.dayNumber}</b>
                </span>

                <span className="trip-day-copy">
                  <small>{day.date || `Ngày ${day.dayNumber}`}</small>
                  <strong>{day.notes || `Khám phá ngày ${day.dayNumber}`}</strong>
                  <span>{day.activities.length} hoạt động</span>
                </span>

                <span className="trip-day-weather">
                  <Icon name={day.dayNumber % 2 === 0 ? "rain" : "cloud"} />
                  <small>{day.dayNumber % 2 === 0 ? "Mưa nhẹ 20°C" : "Nắng đẹp 22°C"}</small>
                </span>

                <span className="trip-day-preview">
                  {sortedDayActivities.slice(0, 2).map((item) => (
                    <small key={item.id}>
                      {item.startTime ? item.startTime.substring(0, 5) : "--:--"} · {item.title}
                    </small>
                  ))}
                  {sortedDayActivities.length === 0 && (
                    <small style={{ color: "#aaa" }}>Chưa có hoạt động</small>
                  )}
                </span>

                <Icon name="chevron" />
              </button>
            );
          })}
        </div>
      )}

      {/* Single Day Detail View */}
      {activeDay && (
        <div className="single-day-detail">
          <div className="single-day-meta">
            <Badge tone={activeDay.dayNumber % 2 === 0 ? "warning" : "teal"}>
              <Icon
                name={activeDay.dayNumber % 2 === 0 ? "rain" : "cloud"}
                size={14}
              />
              {activeDay.dayNumber % 2 === 0 ? "Có mây · 19°C" : "Nắng ráo · 23°C"}
            </Badge>
            <span>
              <Icon name="clock" />
              {activeDay.activities.length} hoạt động
            </span>
          </div>

          <div className="single-day-timeline">
            {sortActivities(activeDay.activities).map((item, idx) => {
              const existingExpense = expenses.find((e) => e.activityId === item.id);
              return (
                <div key={item.id}>
                  <span className="timeline-dot" />
                  <time>{item.startTime ? item.startTime.substring(0, 5) : `Chặng ${idx + 1}`}</time>
                  <div>
                    <strong>{item.title}</strong>
                    <small>
                      {item.place?.category || "Hoạt động trải nghiệm"}
                      {item.estCost ? ` · Dự kiến: ${Number(item.estCost).toLocaleString("vi-VN")} ₫` : ""}
                      {existingExpense ? (
                        <span style={{ color: "var(--teal)", fontWeight: 700 }}>
                          {` · Thực tế: ${existingExpense.amount.toLocaleString("vi-VN")} ₫ (${existingExpense.source === "PERSONAL_POCKET" ? "Cá nhân" : "Quỹ"})`}
                        </span>
                      ) : ""}
                      {item.notes ? ` · ${item.notes}` : ""}
                    </small>
                  </div>
                  <div className="activity-actions">
                    <button
                      type="button"
                      className={`btn-expense ${existingExpense ? "has-expense" : ""}`}
                      title={existingExpense ? "Cập nhật chi phí thực tế" : "Ghi nhận chi phí thực tế"}
                      onClick={() => setRecordingCostActivity(item)}
                    >
                      <Icon name="wallet" size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn-edit"
                      title="Chỉnh sửa hoạt động"
                      onClick={() => setEditingActivity(item)}
                    >
                      <Icon name="edit" size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn-delete"
                      title="Xóa khỏi ngày này"
                      onClick={() => handleDeleteActivity(item.id)}
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>

                </div>
              );
            })}


            {activeDay.activities.length === 0 && (
              <div style={{ padding: "25px 0", color: "var(--muted)", fontSize: "12px" }}>
                Chưa có hoạt động nào trong ngày này. Hãy khám phá và thêm các địa điểm bên dưới!
              </div>
            )}
          </div>

          <div className="single-day-footer">
            <span>Dữ liệu thời tiết chỉ mang tính minh họa.</span>
            <Button
              variant="secondary"
              onClick={() => setSelectedDayNumber("all")}
            >
              ← Quay lại danh sách ngày
            </Button>
          </div>
        </div>
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <EditActivityModal
          tripId={tripId}
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
        />
      )}

      {/* Record Real Cost Modal */}
      {recordingCostActivity && (
        <RecordCostModal
          tripId={tripId}
          activity={recordingCostActivity}
          dayNumber={activeDay?.dayNumber}
          existingExpense={expenses.find((e) => e.activityId === recordingCostActivity.id)}
          onClose={() => setRecordingCostActivity(null)}
        />
      )}
    </div>
  );
}


