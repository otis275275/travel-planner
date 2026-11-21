import { useState } from "react";
import { Icon } from "../common/Icon";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";

interface AiPlannerPanelProps {
  onClose: () => void;
  onApplied: () => void;
  existing?: boolean;
}

export function AiPlannerPanel({
  onClose,
  onApplied,
  existing = false,
}: AiPlannerPanelProps) {
  const [phase, setPhase] = useState<"request" | "running" | "result">("request");

  return (
    <div className="drawer-overlay ai-overlay">
      <div className="ai-planner-panel">
        <div className="drawer-title">
          <div>
            <Badge tone="teal">
              <Icon name="spark" size={14} /> LẬP KẾ HOẠCH CÓ KIỂM SOÁT
            </Badge>
            <h2>{existing ? "Điều chỉnh lịch trình bằng AI" : "Tạo lịch trình bằng AI"}</h2>
            <p>Mọi kết quả là bản đề xuất riêng tư cho đến khi bạn áp dụng.</p>
          </div>
          <button onClick={onClose} aria-label="Đóng">
            <Icon name="close" />
          </button>
        </div>

        <div className="planner-steps">
          <span className={phase === "request" ? "active" : "done"}>1. Yêu cầu</span>
          <span className={phase === "running" ? "active" : phase === "result" ? "done" : ""}>
            2. Đang tạo
          </span>
          <span className={phase === "result" ? "active" : ""}>3. Xem trước</span>
        </div>

        {phase === "request" && (
          <div className="planner-body">
            <label className="prompt-label">
              Bạn muốn chuyến đi như thế nào?
              <textarea
                rows={5}
                defaultValue="Lên lịch 4 ngày ở Đà Nẵng và Hội An cho 4 người, ngân sách 12 triệu, thích đồ ăn địa phương, tránh nơi đông và có một người đi xe lăn."
              />
            </label>
            <div className="constraint-head">
              <div>
                <h3>Điều kiện Triply hiểu được</h3>
                <p>Chọn từng mục để chỉnh sửa.</p>
              </div>
              <Badge tone="success">Có thể tạo lịch trình</Badge>
            </div>
            <div className="constraint-grid">
              <Constraint label="Điểm đến" value="Đà Nẵng, Hội An" />
              <Constraint label="Ngày" value="12–16/10/2025" />
              <Constraint label="Số người" value="4 người" />
              <Constraint label="Ngân sách" value="12.000.000 ₫" />
              <Constraint label="Sở thích" value="Ẩm thực địa phương, ít đông" />
              <Constraint label="Tiếp cận" value="Lối đi phù hợp xe lăn" />
              <Constraint label="Ăn uống" value="Chưa có yêu cầu" missing />
              <Constraint label="Di chuyển" value="Taxi, đi bộ ngắn" />
            </div>
            <div className="clarify-box">
              <Icon name="spark" />
              <span>
                <strong>Cần làm rõ một điều</strong>
                <small>
                  Bạn có muốn tránh hoàn toàn các địa điểm có bậc thang, hay có thể sử dụng nếu có thang máy?
                </small>
              </span>
              <div>
                <Button variant="secondary">Tránh hoàn toàn</Button>
                <Button variant="secondary">Có thang máy là được</Button>
              </div>
            </div>
            <div className="panel-actions">
              <Button variant="secondary" onClick={onClose}>
                Lưu để sau
              </Button>
              <Button icon="spark" onClick={() => setPhase("running")}>
                Tạo lịch trình
              </Button>
            </div>
          </div>
        )}

        {phase === "running" && (
          <div className="planner-body generation-state">
            <span className="spinner" />
            <h3>Triply đang xây dựng đề xuất</h3>
            <p>Bạn có thể đóng panel và tiếp tục làm việc. Kết quả sẽ được lưu trong Trung tâm tác vụ.</p>
            <div className="generation-list">
              <StatusRow
                state="done"
                title="Đã nhận yêu cầu"
                detail="Điểm đến, ngân sách và nhu cầu tiếp cận"
              />
              <StatusRow
                state="done"
                title="Đang thu thập thông tin địa điểm"
                detail="Nguồn tham khảo công khai và nhà cung cấp ngoài"
              />
              <StatusRow
                state="active"
                title="Kiểm tra giờ mở cửa, thời gian di chuyển và thời tiết"
                detail="Một số giờ mở cửa chưa có dữ liệu"
              />
              <StatusRow
                state="waiting"
                title="Xây dựng lịch theo từng ngày"
                detail="Đang chờ bước trước hoàn tất"
              />
            </div>
            <div className="state-samples">
              <Badge tone="warning">Hoàn thành một phần: thiếu giờ mở cửa</Badge>
              <Badge tone="danger">Nếu thất bại: Thử lại yêu cầu</Badge>
            </div>
            <div className="panel-actions">
              <Button variant="secondary" onClick={onClose}>
                Tiếp tục làm việc
              </Button>
              <Button onClick={() => setPhase("result")}>Xem kết quả mẫu</Button>
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="planner-body result-preview">
            <div className="result-head">
              <div>
                <Badge tone="success">
                  <Icon name="check" size={13} /> ĐÃ TẠO XONG
                </Badge>
                <h3>Lịch trình 4 ngày · Đà Nẵng & Hội An</h3>
                <p>Chi phí dự kiến 10.840.000 ₫ / ngân sách 12.000.000 ₫</p>
              </div>
              <Button variant="secondary" onClick={() => setPhase("request")}>
                Chỉnh yêu cầu
              </Button>
            </div>
            {existing && (
              <div className="before-after">
                <div>
                  <small>TRƯỚC</small>
                  <strong>Ngày 2: Bà Nà Hills · 7 giờ</strong>
                  <span>Di chuyển xa, nhiều đoạn đông</span>
                </div>
                <Icon name="chevron" />
                <div>
                  <small>SAU ĐỀ XUẤT</small>
                  <strong>Ngày 2: Hội An ít di chuyển</strong>
                  <span>Giảm 62 phút di chuyển</span>
                </div>
              </div>
            )}
            <div className="preview-days">
              <PreviewDay
                day="Ngày 1 · Đà Nẵng"
                items={[
                  "09:30 Bảo tàng Điêu khắc Chăm · 1,5 giờ · 60.000 ₫",
                  "11:30 Mì Quảng Bà Mua · 1 giờ · 200.000 ₫",
                  "15:00 Biển Mỹ Khê · 2 giờ · miễn phí",
                ]}
              />
              <PreviewDay
                day="Ngày 2 · Hội An"
                items={[
                  "09:00 Làng rau Trà Quế · 2 giờ · 200.000 ₫",
                  "13:30 Phố cổ Hội An · 3 giờ · 480.000 ₫",
                ]}
              />
            </div>
            <div className="result-explain">
              <div>
                <h4>Vì sao lịch này phù hợp?</h4>
                <p>
                  Ưu tiên lối đi bằng phẳng, giờ ít đông và quán ăn địa phương. Mỗi chặng taxi dưới 35 phút.
                </p>
              </div>
              <div>
                <h4>Nguồn & dữ liệu còn thiếu</h4>
                <p>
                  Giờ mở cửa: trang địa điểm, cập nhật 08:40. Dự báo chỉ có đến 14/10; ngày sau hiển thị “Chưa có dự báo”. Giá là minh họa và có thể thay đổi.
                </p>
              </div>
            </div>
            <div className="partial-warning">
              <Icon name="warning" />
              <span>
                <strong>Hoàn thành một phần</strong>
                <small>
                  Chưa tìm thấy thông tin lối vào xe lăn của Làng rau Trà Quế. Hãy xác minh trước khi đi.
                </small>
              </span>
              <Button variant="ghost">Thử lại dữ liệu thiếu</Button>
            </div>
            <div className="panel-actions">
              <Button variant="secondary" onClick={() => setPhase("request")}>
                Chỉnh yêu cầu
              </Button>
              <Button onClick={onApplied}>Áp dụng vào lịch trình</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Constraint({
  label,
  value,
  missing,
}: {
  label: string;
  value: string;
  missing?: boolean;
}) {
  return (
    <button className={missing ? "constraint missing" : "constraint"}>
      <small>{label}</small>
      <strong>{value}</strong>
      <span>Chỉnh sửa</span>
    </button>
  );
}

function StatusRow({
  state,
  title,
  detail,
}: {
  state: string;
  title: string;
  detail: string;
}) {
  return (
    <div className={`status-row ${state}`}>
      <span>
        {state === "done" ? (
          <Icon name="check" />
        ) : state === "active" ? (
          <span className="spinner" />
        ) : (
          ""
        )}
      </span>
      <div>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function PreviewDay({ day, items }: { day: string; items: string[] }) {
  return (
    <div className="preview-day">
      <strong>{day}</strong>
      {items.map((item) => (
        <div key={item}>
          <span className="drag">⠿</span>
          <p>{item}</p>
          <button>Chỉnh</button>
        </div>
      ))}
    </div>
  );
}
