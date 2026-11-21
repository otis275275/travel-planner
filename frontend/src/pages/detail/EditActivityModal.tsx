import { useState } from "react";
import { Button } from "../../components/common/Button";
import { Icon } from "../../components/common/Icon";
import type { ActivityResponse, ActivityType } from "../../types/trip.types";
import { useUpdateActivityMutation } from "../../services/tripsApi";

interface EditActivityModalProps {
  tripId: string;
  activity: ActivityResponse;
  onClose: () => void;
}

export function EditActivityModal({ tripId, activity, onClose }: EditActivityModalProps) {
  const [updateActivity, { isLoading: isUpdatingActivity }] = useUpdateActivityMutation();
  const [editForm, setEditForm] = useState({
    title: activity.title || "",
    type: (activity.type || "VISIT") as ActivityType,
    startTime: activity.startTime ? activity.startTime.substring(0, 5) : "",
    endTime: activity.endTime ? activity.endTime.substring(0, 5) : "",
    estCost: activity.estCost != null ? String(activity.estCost) : "",
    notes: activity.notes || "",
  });

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanCost = editForm.estCost ? Number(editForm.estCost.replace(/\D/g, "")) : null;
      await updateActivity({
        tripId,
        activityId: activity.id,
        data: {
          title: editForm.title.trim() || undefined,
          type: editForm.type,
          startTime: editForm.startTime ? `${editForm.startTime}:00` : null,
          endTime: editForm.endTime ? `${editForm.endTime}:00` : null,
          estCost: cleanCost != null && !isNaN(cleanCost) ? cleanCost : null,
          notes: editForm.notes.trim() || null,
        },
      }).unwrap();

      onClose();
    } catch (err) {
      console.error("Failed to update activity:", err);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal activity-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">CHỈNH SỬA HOẠT ĐỘNG</span>
            <h3>{activity.place?.name || activity.title}</h3>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <form onSubmit={handleSaveEdit} className="activity-edit-form">
          <div className="form-group">
            <label>Tên hoạt động / Điểm đến</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Loại hoạt động</label>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value as ActivityType }))}
              >
                <option value="VISIT">Tham quan / Check-in</option>
                <option value="FOOD">Ẩm thực / Ăn uống</option>
                <option value="TRANSPORT">Di chuyển / Đi lại</option>
                <option value="FREE_TIME">Nghỉ ngơi / Tự do</option>
              </select>
            </div>
            <div className="form-group">
              <label>Chi phí ước tính (₫)</label>
              <input
                type="number"
                placeholder="VD: 150000"
                value={editForm.estCost}
                onChange={(e) => setEditForm((prev) => ({ ...prev, estCost: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giờ bắt đầu</label>
              <input
                type="time"
                value={editForm.startTime}
                onChange={(e) => setEditForm((prev) => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Giờ kết thúc</label>
              <input
                type="time"
                value={editForm.endTime}
                onChange={(e) => setEditForm((prev) => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Ghi chú & Lời khuyên</label>
            <textarea
              rows={3}
              placeholder="Ghi chú vé vào cửa, giờ đẹp nhất hoặc trang phục..."
              value={editForm.notes}
              onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="modal-actions">
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
              disabled={isUpdatingActivity}
            >
              {isUpdatingActivity ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
