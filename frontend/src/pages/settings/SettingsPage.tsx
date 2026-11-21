import { useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { Icon } from "../../components/common/Icon";

export function SettingsPage() {
  const [aiPrefs, setAiPrefs] = useState(true);
  const [activeNav, setActiveNav] = useState("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page settings-page">
      <PageHeader
        title="Hồ sơ & Cài đặt"
        description="Quản lý thông tin cá nhân và cách Triply cá nhân hóa trải nghiệm."
      >
        <Badge tone={saved ? "success" : "neutral"}>
          {saved ? "Đã lưu thay đổi!" : "Đã lưu 2 phút trước"}
        </Badge>
      </PageHeader>

      <div className="settings-layout">
        <aside className="settings-nav">
          <button
            className={activeNav === "profile" ? "active" : ""}
            onClick={() => setActiveNav("profile")}
          >
            Thông tin cá nhân
          </button>
          <button
            className={activeNav === "preferences" ? "active" : ""}
            onClick={() => setActiveNav("preferences")}
          >
            Sở thích du lịch
          </button>
          <button
            className={activeNav === "notifications" ? "active" : ""}
            onClick={() => setActiveNav("notifications")}
          >
            Ngôn ngữ & thông báo
          </button>
          <button
            className={activeNav === "privacy" ? "active" : ""}
            onClick={() => setActiveNav("privacy")}
          >
            Quyền riêng tư & AI
          </button>
        </aside>

        <section>
          {/* Profile Card */}
          <div className="card settings-card">
            <div className="settings-title">
              <div>
                <h2>Thông tin cá nhân</h2>
                <p>Thông tin hiển thị với người cùng chuyến đi.</p>
              </div>
              <Avatar label="AL" color="yellow" />
            </div>
            <div className="field-grid">
              <label>
                Họ và tên
                <input defaultValue="An Lê" />
              </label>
              <label>
                Email
                <input defaultValue="an.le@gmail.com" />
              </label>
              <label>
                Thành phố hiện tại
                <input defaultValue="Hà Nội" />
              </label>
              <label>
                Số điện thoại
                <input defaultValue="+84 912 345 678" />
              </label>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="card settings-card">
            <div className="settings-title">
              <div>
                <h2>Sở thích du lịch</h2>
                <p>Chọn những trải nghiệm bạn thường yêu thích.</p>
              </div>
            </div>
            <div className="chip-select">
              {["Ẩm thực", "Thiên nhiên", "Văn hóa", "Nhiếp ảnh", "Thư giãn", "Phiêu lưu"].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      ["Ẩm thực", "Thiên nhiên", "Nhiếp ảnh"].includes(item)
                        ? "selected"
                        : ""
                    }
                  >
                    {item}
                  </button>
                )
              )}
            </div>
            <div className="field-grid top-gap">
              <label>
                Ngân sách thường dùng / người / ngày
                <select defaultValue="1.000.000 – 2.000.000 ₫">
                  <option>Dưới 1.000.000 ₫ (Tiết kiệm)</option>
                  <option>1.000.000 – 2.000.000 ₫ (Tiêu chuẩn)</option>
                  <option>Trên 2.000.000 ₫ (Cao cấp)</option>
                </select>
              </label>
              <label>
                Phương tiện ưu tiên
                <select defaultValue="Xe khách, tàu hỏa, đi bộ">
                  <option>Xe khách, tàu hỏa, đi bộ</option>
                  <option>Máy bay, taxi</option>
                  <option>Xe máy tự lái</option>
                </select>
              </label>
              <label>
                Chế độ ăn
                <select defaultValue="Không yêu cầu đặc biệt">
                  <option>Không yêu cầu đặc biệt</option>
                  <option>Ăn chay / Thuần chay</option>
                </select>
              </label>
              <label>
                Nhu cầu tiếp cận
                <input placeholder="Chưa có thông tin" />
              </label>
            </div>
          </div>

          {/* Language & Notifications */}
          <div className="card settings-card">
            <div className="settings-title">
              <div>
                <h2>Ngôn ngữ & thông báo</h2>
                <p>Điều chỉnh cách Triply liên lạc với bạn.</p>
              </div>
            </div>
            <InfoToggle
              title="Ngôn ngữ giao diện"
              description="Tiếng Việt (Việt Nam)"
              checked
            />
            <InfoToggle
              title="Thay đổi trong lịch trình"
              description="Email và thông báo trong ứng dụng"
              checked
            />
            <InfoToggle
              title="Nhắc việc trước chuyến đi"
              description="Gửi trước 3 ngày và 1 ngày"
              checked
            />
            <InfoToggle
              title="Gợi ý khám phá"
              description="Nhận cảm hứng điểm đến mỗi tháng"
            />
          </div>

          {/* Privacy & AI */}
          <div className="card settings-card ai-privacy">
            <div className="settings-title">
              <div>
                <Badge tone="teal">
                  <Icon name="spark" size={14} /> QUYỀN RIÊNG TƯ & AI
                </Badge>
                <h2>Dùng sở thích để cá nhân hóa gợi ý</h2>
                <p>
                  Khi bật, Triply có thể dùng các sở thích bạn đã chọn để đề xuất điểm đến và lịch trình phù hợp hơn.
                </p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={aiPrefs}
                  onChange={() => setAiPrefs(!aiPrefs)}
                />
                <span />
              </label>
            </div>
            <div className="privacy-grid">
              <div>
                <Icon name="eye" />
                <span>
                  <strong>Bạn kiểm soát dữ liệu</strong>
                  <small>Có thể tắt hoặc xóa sở thích bất cứ lúc nào.</small>
                </span>
              </div>
              <div>
                <Icon name="users" />
                <span>
                  <strong>Trò chuyện AI là riêng tư</strong>
                  <small>Không chia sẻ nội dung AI Concierge với thành viên khác.</small>
                </span>
              </div>
              <div>
                <Icon name="check" />
                <span>
                  <strong>Không tự sửa lịch chung</strong>
                  <small>Đề xuất chỉ được áp dụng khi bạn xác nhận.</small>
                </span>
              </div>
            </div>
          </div>

          <div className="save-row">
            <Button onClick={handleSave}>Lưu thay đổi</Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoToggle({
  title,
  description,
  checked,
}: {
  title: string;
  description: string;
  checked?: boolean;
}) {
  return (
    <div className="toggle-row">
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <label className="switch">
        <input type="checkbox" defaultChecked={checked} />
        <span />
      </label>
    </div>
  );
}
