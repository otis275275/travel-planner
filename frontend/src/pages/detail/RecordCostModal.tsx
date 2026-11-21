import { useState } from "react";
import { Button } from "../../components/common/Button";
import { Icon } from "../../components/common/Icon";
import type { ActivityResponse, Expense, PaymentSource } from "../../types/trip.types";
import { useCreateExpenseMutation } from "../../services/tripsApi";

interface RecordCostModalProps {
  tripId: string;
  activity: ActivityResponse;
  dayNumber?: number;
  existingExpense?: Expense;
  onClose: () => void;
}

export function RecordCostModal({
  tripId,
  activity,
  dayNumber,
  existingExpense,
  onClose,
}: RecordCostModalProps) {
  const [createExpense, { isLoading: isRecordingExpense }] = useCreateExpenseMutation();
  const [costAmount, setCostAmount] = useState(
    existingExpense
      ? String(existingExpense.amount)
      : activity.estCost != null
      ? String(activity.estCost)
      : ""
  );
  const [costSource, setCostSource] = useState<PaymentSource>(
    existingExpense ? existingExpense.source : "GROUP_FUND"
  );
  const [costError, setCostError] = useState<string | null>(null);

  const handleSaveCost = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = Number(costAmount.replace(/\D/g, ""));
    if (!cleanAmount || cleanAmount <= 0) {
      setCostError("Vui lòng nhập số tiền hợp lệ (> 0 ₫)");
      return;
    }

    try {
      setCostError(null);
      await createExpense({
        tripId,
        data: {
          activityId: activity.id,
          title: activity.title,
          amount: cleanAmount,
          source: costSource,
        },
      }).unwrap();

      onClose();
    } catch (err: any) {
      console.error("Failed to record expense:", err);
      setCostError(err?.data?.message || "Không thể lưu chi phí. Vui lòng thử lại.");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal activity-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">CHI PHÍ THỰC TẾ</span>
            <h3>{activity.title}</h3>
            <small style={{ color: "var(--muted)", fontSize: "11px" }}>
              {dayNumber ? `Ngày ${dayNumber}` : "Lịch trình"}
              {activity.startTime ? ` · ${activity.startTime.substring(0, 5)}` : ""}
              {activity.estCost != null
                ? ` · Chi phí dự kiến: ${Number(activity.estCost).toLocaleString("vi-VN")} ₫`
                : " · Chưa có dự kiến chi phí"}
            </small>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <form onSubmit={handleSaveCost} className="activity-edit-form">
          {costError && (
            <div
              style={{
                color: "var(--danger)",
                fontSize: "12px",
                background: "#fef2f2",
                padding: "8px 12px",
                borderRadius: "8px",
              }}
            >
              {costError}
            </div>
          )}

          <div className="form-group">
            <label>Số tiền thực tế đã chi (₫)</label>
            <input
              type="number"
              placeholder="VD: 250000"
              value={costAmount}
              onChange={(e) => setCostAmount(e.target.value)}
              min="1"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Nguồn thanh toán</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 12px",
                  border: `1.5px solid ${costSource === "GROUP_FUND" ? "var(--teal)" : "var(--line)"}`,
                  borderRadius: "10px",
                  background: costSource === "GROUP_FUND" ? "#eef5f2" : "#fff",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <input
                  type="radio"
                  name="paymentSource"
                  value="GROUP_FUND"
                  checked={costSource === "GROUP_FUND"}
                  onChange={() => setCostSource("GROUP_FUND")}
                  style={{ width: "auto" }}
                />
                🏦 Quỹ chung
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 12px",
                  border: `1.5px solid ${costSource === "PERSONAL_POCKET" ? "var(--teal)" : "var(--line)"}`,
                  borderRadius: "10px",
                  background: costSource === "PERSONAL_POCKET" ? "#eef5f2" : "#fff",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <input
                  type="radio"
                  name="paymentSource"
                  value="PERSONAL_POCKET"
                  checked={costSource === "PERSONAL_POCKET"}
                  onChange={() => setCostSource("PERSONAL_POCKET")}
                  style={{ width: "auto" }}
                />
                👤 Cá nhân trả
              </label>
            </div>
            <small style={{ color: "var(--muted)", fontSize: "11px", marginTop: "4px" }}>
              {costSource === "GROUP_FUND"
                ? "Khoản này được trừ trực tiếp vào số dư quỹ chung của chuyến đi."
                : "Thành viên tự thanh toán bằng tiền túi, sẽ xuất hiện ở bảng quyết toán."}
            </small>
          </div>

          <div className="modal-actions" style={{ marginTop: "12px" }}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isRecordingExpense}
            >
              {isRecordingExpense ? "Đang lưu..." : "Xác nhận ghi chi phí"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
