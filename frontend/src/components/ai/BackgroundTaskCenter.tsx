import { Icon } from "../common/Icon";
import { Badge } from "../common/Badge";

export function BackgroundTaskCenter() {
  return (
    <div className="task-center">
      <div className="task-center-head">
        <span>
          <Icon name="spark" />
          <strong>Tác vụ nền</strong>
        </span>
        <Badge tone="teal">2 đang xử lý</Badge>
      </div>
      <div>
        <span className="spinner" />
        <span>
          <strong>Đang kiểm tra giờ mở cửa</strong>
          <small>Lịch Đà Nẵng & Hội An · có thể mở lại kết quả sau</small>
        </span>
        <button>Mở</button>
      </div>
      <div>
        <Icon name="check" />
        <span>
          <strong>Plan B đã sẵn sàng để xem</strong>
          <small>Ngày 2 · Trekking Lao Chải</small>
        </span>
        <button>Xem</button>
      </div>
      <hr />
      <small>Xuất PDF là tác vụ riêng · không dùng AI</small>
    </div>
  );
}
