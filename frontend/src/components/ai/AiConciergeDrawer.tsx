import { useState } from "react";
import { Icon } from "../common/Icon";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { images } from "../../data/mockData";

export function AiConciergeDrawer({ onClose }: { onClose: () => void }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  return (
    <div className="drawer-overlay ai-overlay">
      <div className="concierge-drawer">
        <div className="drawer-title">
          <div>
            <span className="ai-title">
              <span className="feature-icon">
                <Icon name="spark" />
              </span>
              <span>
                <h2>AI Concierge</h2>
                <small>Chỉ bạn nhìn thấy cuộc trò chuyện này</small>
              </span>
            </span>
          </div>
          <button onClick={onClose} aria-label="Đóng">
            <Icon name="close" />
          </button>
        </div>

        <div className="context-chip">
          <Icon name="map" /> Sa Pa cùng hội bạn · 12–16/10
        </div>

        <div className="suggestion-prompts">
          <button>Tìm quán ăn dưới 50.000 ₫</button>
          <button>Gợi ý khách sạn có hồ bơi</button>
          <button>Tìm hoạt động trong nhà gần đây</button>
          <button>Tối ưu lịch trình để ít di chuyển hơn</button>
        </div>

        <div className="chat-history">
          <div className="message mine">
            Tìm một hoạt động trong nhà gần Bản Cát Cát cho chiều mưa.
          </div>
          <div className="message assistant">
            <span>
              <Icon name="spark" /> Tôi tìm thấy một lựa chọn phù hợp với khung 14:00–16:30.
            </span>
            <article className="ai-place-card">
              <img src={images.sapa} alt="Bảo tàng Văn hóa Sa Pa" />
              <div>
                <Badge tone="teal">PHÙ HỢP NHẤT</Badge>
                <h3>Bảo tàng Văn hóa Sa Pa</h3>
                <p>Trung tâm Sa Pa · Grab khoảng 8 phút</p>
                <strong>Khoảng 60.000 ₫ / người</strong>
                <small>
                  Phù hợp vì ở trong nhà, lối vào bằng phẳng và không làm trễ bữa tối. Nguồn: thông tin địa điểm công khai · 09:40 hôm nay.
                </small>
                <div>
                  <Button variant="secondary">Xem chi tiết</Button>
                  <Button onClick={() => setAdding(true)}>Thêm vào lịch trình</Button>
                </div>
              </div>
            </article>
          </div>

          {added && (
            <div className="added-message">
              <Icon name="check" />
              <span>
                <strong>Đã thêm vào Ngày 2 · 14:30</strong>
                <small>Bảng chung chỉ hiển thị hoạt động đã thêm, không hiển thị cuộc trò chuyện.</small>
              </span>
            </div>
          )}

          <div className="stream-state">
            <span className="stream-dots">•••</span>
            <span>Đang soạn câu trả lời từ các nguồn có sẵn</span>
            <button>Dừng trả lời</button>
          </div>
        </div>

        <div className="assistant-states">
          <span>Không có kết quả: thử nới bộ lọc</span>
          <span>
            Lỗi tải nguồn: <b>Thử lại</b>
          </span>
        </div>

        <div className="composer">
          <input placeholder="Hỏi về chuyến đi này..." />
          <Button>Gửi</Button>
        </div>

        {adding && (
          <div className="add-confirm">
            <div className="drawer-title">
              <div>
                <Badge tone="yellow">ĐỀ XUẤT RIÊNG TƯ</Badge>
                <h3>Thêm vào lịch trình chung?</h3>
              </div>
              <button onClick={() => setAdding(false)} aria-label="Đóng">
                <Icon name="close" />
              </button>
            </div>
            <div className="field-grid">
              <label>
                Ngày
                <select>
                  <option>Ngày 2 · Chủ Nhật, 13/10</option>
                </select>
              </label>
              <label>
                Thời gian
                <input defaultValue="14:30" />
              </label>
            </div>
            <div className="proposed-add">
              <small>XEM TRƯỚC THAY ĐỔI</small>
              <strong>14:30 · Bảo tàng Văn hóa Sa Pa</strong>
              <span>1,5 giờ · Grab 8 phút · khoảng 60.000 ₫ / người</span>
            </div>
            <div className="panel-actions">
              <Button variant="secondary" onClick={() => setAdding(false)}>
                Hủy
              </Button>
              <Button
                onClick={() => {
                  setAdding(false);
                  setAdded(true);
                }}
              >
                Xác nhận và chia sẻ
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
