import { useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Icon } from "../../components/common/Icon";

export function BookingsPage() {
  const [addRef, setAddRef] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="page bookings-page">
      <PageHeader
        title="Lựa chọn đã lưu"
        description="Theo dõi lựa chọn từ các nhà cung cấp bên ngoài và thông tin bạn tự xác nhận."
      >
        <Button icon="plus" onClick={() => setAddRef(true)}>
          Thêm mã xác nhận
        </Button>
      </PageHeader>

      <div className="notice">
        <Icon name="external" />
        <span>
          <strong>Triply không xử lý đặt chỗ hoặc thanh toán</strong>
          <small>
            Bạn sẽ hoàn tất giao dịch trên trang nhà cung cấp. Mở liên kết không có nghĩa là đã đặt.
          </small>
        </span>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          Tất cả <b>6</b>
        </button>
        <button
          className={activeTab === "hotel" ? "active" : ""}
          onClick={() => setActiveTab("hotel")}
        >
          Khách sạn
        </button>
        <button
          className={activeTab === "transport" ? "active" : ""}
          onClick={() => setActiveTab("transport")}
        >
          Di chuyển
        </button>
        <button
          className={activeTab === "flight" ? "active" : ""}
          onClick={() => setActiveTab("flight")}
        >
          Chuyến bay
        </button>
        <button
          className={activeTab === "activity" ? "active" : ""}
          onClick={() => setActiveTab("activity")}
        >
          Hoạt động
        </button>
      </div>

      <div className="booking-list">
        <Booking
          type="Khách sạn"
          provider="Agoda"
          title="Pao's Sapa Leisure Hotel"
          details="12–14 tháng 10 · 2 phòng · 4 khách"
          price="2.480.000 ₫"
          status="Đã lưu"
          tone="neutral"
        />
        <Booking
          type="Xe khách"
          provider="Traveloka"
          title="Sao Việt · Hà Nội → Sa Pa"
          details="11 tháng 10, 22:00 · 4 hành khách"
          price="1.520.000 ₫"
          status="Đã mở nhà cung cấp"
          tone="warning"
        />
        <Booking
          type="Hoạt động"
          provider="Klook"
          title="Cáp treo Fansipan khứ hồi"
          details="14 tháng 10 · 4 người lớn"
          price="3.400.000 ₫"
          status="Người dùng xác nhận đã đặt"
          tone="success"
          confirmed
        />
        <Booking
          type="Chuyến bay"
          provider="Vietnam Airlines"
          title="Hà Nội → Đà Nẵng"
          details="Chuyến đi Đà Nẵng · Giá cập nhật 3 giờ trước"
          price="Từ 1.860.000 ₫"
          status="Giá có thể đã cũ"
          tone="danger"
        />
      </div>

      {addRef && (
        <div className="drawer-overlay">
          <div className="side-drawer">
            <div className="drawer-title">
              <div>
                <h2>Thêm thông tin đặt chỗ</h2>
                <p>Chỉ nhập thông tin bạn nhận được từ nhà cung cấp.</p>
              </div>
              <button onClick={() => setAddRef(false)} aria-label="Đóng">
                <Icon name="close" />
              </button>
            </div>

            <label>
              Loại đặt chỗ
              <select defaultValue="Khách sạn">
                <option>Khách sạn</option>
                <option>Xe khách / Tàu hỏa</option>
                <option>Vé tham quan / Tour</option>
                <option>Chuyến bay</option>
              </select>
            </label>

            <label>
              Nhà cung cấp
              <input defaultValue="Agoda" />
            </label>

            <label>
              Mã xác nhận
              <input placeholder="Ví dụ: 987654321" />
            </label>

            <label>
              Tệp tham chiếu
              <div className="upload">
                Kéo tệp PDF hoặc ảnh vào đây
                <small>Tối đa 10 MB</small>
              </div>
            </label>

            <label className="checkbox">
              <input type="checkbox" defaultChecked />
              <span>
                Tôi xác nhận đã hoàn tất đặt chỗ trực tiếp với nhà cung cấp.
              </span>
            </label>

            <div className="info-box">
              <Icon name="check" />
              <span>
                <strong>Trạng thái sẽ do bạn xác nhận</strong>
                <small>
                  Triply không thể kiểm chứng nếu chưa có dữ liệu xác nhận từ nhà cung cấp.
                </small>
              </span>
            </div>

            <div className="drawer-actions">
              <Button variant="secondary" onClick={() => setAddRef(false)}>
                Hủy
              </Button>
              <Button onClick={() => setAddRef(false)}>Lưu thông tin</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Booking({
  type,
  provider,
  title,
  details,
  price,
  status,
  tone,
  confirmed,
}: {
  type: string;
  provider: string;
  title: string;
  details: string;
  price: string;
  status: string;
  tone: "neutral" | "warning" | "success" | "danger";
  confirmed?: boolean;
}) {
  return (
    <article className="booking-row">
      <span className="booking-icon">
        <Icon
          name={
            type === "Khách sạn"
              ? "home"
              : type === "Hoạt động"
              ? "compass"
              : "map"
          }
        />
      </span>
      <div className="booking-main">
        <span>
          {type} · <b>{provider}</b>
        </span>
        <h3>{title}</h3>
        <p>{details}</p>
        {confirmed && (
          <small>Mã tham chiếu: KL-38••91 · do An thêm 20 phút trước</small>
        )}
      </div>
      <div className="booking-status">
        <Badge tone={tone}>{status}</Badge>
        <strong>{price}</strong>
        <button>
          Mở {provider} <Icon name="external" size={14} />
        </button>
      </div>
      <button className="icon-btn" aria-label="Tùy chọn">
        <Icon name="more" />
      </button>
    </article>
  );
}
