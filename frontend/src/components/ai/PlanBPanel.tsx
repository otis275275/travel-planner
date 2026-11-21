import { useState } from "react";
import { Icon } from "../common/Icon";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";

export function PlanBPanel({ onClose }: { onClose: () => void }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="drawer-overlay ai-overlay">
      <div className="planb-panel">
        <div className="drawer-title">
          <div>
            <Badge tone="warning">
              <Icon name="rain" size={14} /> PLAN B THEO THỜI TIẾT
            </Badge>
            <h2>So sánh phương án cho sáng Chủ Nhật</h2>
            <p>Đề xuất chưa thay đổi lịch trình chung.</p>
          </div>
          <button onClick={onClose} aria-label="Đóng">
            <Icon name="close" />
          </button>
        </div>

        <div className="forecast-context">
          <Icon name="rain" />
          <div>
            <strong>Mưa 70% · 16° / 11°</strong>
            <small>Dự báo minh họa cho 13/10 · cập nhật 10:20 hôm nay</small>
          </div>
          <Button variant="ghost">Làm mới</Button>
        </div>

        <div className="conflict-alert">
          <Icon name="users" />
          <span>
            <strong>Minh vừa đổi giờ hoạt động này sang 09:00</strong>
            <small>
              Đề xuất được tạo từ phiên bản cũ. Làm mới để không ghi đè thay đổi của Minh.
            </small>
          </span>
          <Button variant="secondary">Làm mới đề xuất</Button>
        </div>

        <div className="comparison-grid">
          <article className="original-option">
            <small>LỊCH HIỆN TẠI</small>
            <h3>Trekking Lao Chải – Tả Van</h3>
            <p>3 giờ · ngoài trời · 450.000 ₫</p>
            <Badge tone="warning">Đường trơn, mưa có thể giảm tầm nhìn</Badge>
          </article>
          <article className="alternative-option selected">
            <small>PHƯƠNG ÁN ĐỀ XUẤT</small>
            <h3>Bảo tàng Văn hóa Sa Pa</h3>
            <p>1,5 giờ · Grab 8 phút · 60.000 ₫ / người</p>
            <span>Mở cửa 08:00–17:00 · thông tin cập nhật 2 ngày trước</span>
            <strong>
              Phù hợp vì ở trong nhà, có lối đi bằng phẳng và vừa khung giờ hiện có.
            </strong>
          </article>
        </div>

        <div className="impact-box">
          <h3>Ảnh hưởng nếu thay</h3>
          <div>
            <span>Thời gian di chuyển</span>
            <b>Giảm 35 phút</b>
          </div>
          <div>
            <span>Ngân sách nhóm</span>
            <b>-210.000 ₫</b>
          </div>
          <div>
            <span>Lịch còn lại</span>
            <b>Không thay đổi</b>
          </div>
        </div>

        <div className="alternative-strip">
          <span>
            <Badge tone="neutral">LỰA CHỌN KHÁC</Badge>
            <strong>Workshop thêu thổ cẩm · 2 giờ</strong>
            <small>120.000 ₫ / người · cách 12 phút</small>
          </span>
          <Button variant="secondary">Xem</Button>
        </div>

        <div className="edge-states">
          <span>Đang tạo gợi ý…</span>
          <span>Sẵn sàng để xem</span>
          <span>Không có lựa chọn phù hợp</span>
          <span>Không có dữ liệu thời tiết</span>
          <span>Ngoài phạm vi dự báo</span>
          <span>Dự báo đã cũ · Thử lại</span>
        </div>

        {accepted && (
          <div className="added-message">
            <Icon name="check" />
            <span>
              <strong>Đề xuất đã sẵn sàng để An xác nhận</strong>
              <small>
                Sau khi chấp nhận, bảng hoạt động sẽ ghi “An đã áp dụng Plan B”.
              </small>
            </span>
          </div>
        )}

        <div className="panel-actions">
          <Button variant="ghost" onClick={onClose}>
            Giữ lịch trình hiện tại
          </Button>
          <Button variant="secondary" onClick={() => setAccepted(true)}>
            Thêm làm phương án dự phòng
          </Button>
          <Button onClick={() => setAccepted(true)}>Thay hoạt động này</Button>
        </div>
      </div>
    </div>
  );
}
