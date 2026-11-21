import { useState } from "react";
import { Icon } from "../common/Icon";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";

export function HotelReviewSummary() {
  const [state, setState] = useState<"ready" | "loading" | "failed" | "insufficient">("ready");

  return (
    <div className="hotel-review-summary">
      <div className="review-title">
        <span>
          <Icon name="spark" />
          <strong>Tóm tắt đánh giá bằng AI</strong>
        </span>
        <Badge tone="neutral">Bản lưu lúc 09:40</Badge>
      </div>

      {state === "loading" && (
        <div className="review-loading">
          <span className="spinner" />
          Đang đọc các đánh giá có sẵn...
        </div>
      )}

      {state === "failed" && (
        <div className="review-error">
          <strong>Chưa thể tạo bản tóm tắt</strong>
          <Button variant="secondary" onClick={() => setState("loading")}>
            Thử lại
          </Button>
        </div>
      )}

      {state === "insufficient" && (
        <div className="review-error">
          <strong>Chưa đủ dữ liệu đánh giá để tóm tắt đáng tin cậy.</strong>
          <Button variant="secondary" onClick={() => setState("ready")}>
            Xem mẫu
          </Button>
        </div>
      )}

      {state === "ready" && (
        <>
          <p>
            Khách thường đánh giá cao hồ bơi nhìn ra núi và thái độ thân thiện của nhân viên. Một số đánh giá đề cập tiếng ồn buổi tối và Wi-Fi chưa ổn định.
          </p>
          <div className="pros-cons">
            <div>
              <b>Ưu điểm</b>
              <span>
                <Icon name="check" /> Hồ bơi đẹp
              </span>
              <span>
                <Icon name="check" /> Nhân viên thân thiện
              </span>
            </div>
            <div>
              <b>Nhược điểm</b>
              <span>– Hơi ồn vào buổi tối</span>
              <span>– Wi-Fi chưa ổn định</span>
            </div>
          </div>
          <div className="review-categories">
            <span>
              Sạch sẽ <b>Tích cực</b>
            </span>
            <span>
              Vị trí <b>Tích cực</b>
            </span>
            <span>
              Tiếng ồn <b>Trái chiều</b>
            </span>
            <span>
              Wi-Fi <b>Trái chiều</b>
            </span>
            <span>
              Hồ bơi <b>Tích cực</b>
            </span>
            <span>
              Tiếp cận <b>Thiếu dữ liệu</b>
            </span>
          </div>
          <div className="match-note">
            <Icon name="spark" />
            <span>
              <strong>Phù hợp với bạn vì…</strong>
              <small>
                Có hồ bơi và gần trung tâm. Chưa đủ thông tin để xác nhận lối đi phù hợp xe lăn.
              </small>
            </span>
          </div>
          <small>
            Nguồn: đánh giá công khai từ nhà cung cấp ngoài. Số đánh giá được phân tích không được nguồn công bố. Cập nhật 09:40 hôm nay. Đây là bản tóm tắt, không phải đánh giá đã được Triply kiểm chứng.
          </small>
          <div className="review-actions">
            <Button variant="ghost">
              Xem đánh giá gốc <Icon name="external" size={14} />
            </Button>
            <button onClick={() => setState("insufficient")}>
              Xem trạng thái thiếu dữ liệu
            </button>
            <button onClick={() => setState("failed")}>
              Xem trạng thái lỗi
            </button>
          </div>
        </>
      )}
    </div>
  );
}
