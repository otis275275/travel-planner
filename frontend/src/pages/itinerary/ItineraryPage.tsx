import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/common/Icon";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Avatar } from "../../components/common/Avatar";
import { BackgroundTaskCenter } from "../../components/ai/BackgroundTaskCenter";
import { AiPlannerPanel } from "../../components/ai/AiPlannerPanel";
import { AiConciergeDrawer } from "../../components/ai/AiConciergeDrawer";
import { PlanBPanel } from "../../components/ai/PlanBPanel";

export function ItineraryPage() {
  const navigate = useNavigate();
  const [concierge, setConcierge] = useState(false);
  const [planner, setPlanner] = useState(false);
  const [planB, setPlanB] = useState(false);
  const [tasks, setTasks] = useState(true);

  return (
    <div className="itinerary-page">
      <div className="itinerary-top">
        <div>
          <span className="breadcrumb">Chuyến đi của tôi / Sa Pa cùng hội bạn</span>
          <div className="title-line">
            <h1>Sa Pa cùng hội bạn</h1>
            <Badge tone="success">
              <span className="pulse" /> Auto-save · vừa xong
            </Badge>
          </div>
          <p>12–16 tháng 10, 2025 · 5 ngày</p>
        </div>
        <div className="header-actions">
          <div className="avatar-stack">
            <Avatar label="AL" color="yellow" />
            <Avatar label="MH" />
            <Avatar label="LN" color="teal" />
          </div>
          <Button variant="secondary" icon="spark" onClick={() => setPlanner(true)}>
            Điều chỉnh bằng AI
          </Button>
          <Button variant="secondary" icon="users">
            Chia sẻ
          </Button>
          <Button variant="dark" onClick={() => navigate("/trips/sapa-friends")}>
            Tổng quan
          </Button>
        </div>
      </div>

      <div className="ai-task-bar" onClick={() => setTasks(!tasks)}>
        <span className="spinner" />
        <span>
          <strong>AI đang kiểm tra dữ liệu cho một đề xuất</strong>
          <small>Bạn có thể tiếp tục chỉnh lịch trình · bấm để xem tác vụ</small>
        </span>
        <Badge tone="teal">Đang chạy nền</Badge>
      </div>

      <div className="itinerary-columns">
        <section className="board">
          <div className="collab-live">
            <span>
              <span className="pulse" /> Minh và Lan đang xem
            </span>
            <span>
              <b>An</b> đã áp dụng đề xuất AI vào Ngày 1 · 4 phút trước
            </span>
          </div>

          <Day
            day="Ngày 1"
            date="Thứ Bảy, 12 tháng 10"
            weather="Có mây · 18° / 12° · mưa 30%"
          >
            <ScheduleCard
              time="08:30"
              type="Ăn uống"
              title="Cốn Sủi Ông Há"
              details="45 phút · Đi bộ 6 phút"
              price="160.000 ₫"
              tag="Đi bộ"
            />
            <ScheduleCard
              time="10:00"
              type="Tham quan"
              title="Tàu hỏa leo núi Mường Hoa"
              details="2 giờ · Cách 1,2 km"
              price="650.000 ₫"
              tag="Grab"
              external="Đặt qua Traveloka"
            />
          </Day>

          <Day
            day="Ngày 2"
            date="Chủ Nhật, 13 tháng 10"
            weather="Mưa · 16° / 11° · mưa 70%"
            warning
          >
            <ScheduleCard
              time="09:00"
              type="Ngoài trời"
              title="Trekking Lao Chải – Tả Van"
              details="3 giờ · Đường có thể trơn và tầm nhìn giảm"
              price="450.000 ₫"
              tag="Xe giường nằm"
              rain
              onPlanB={() => setPlanB(true)}
            />
            <ScheduleCard
              time="14:30"
              type="Văn hóa"
              title="Bản Cát Cát"
              details="1,5 giờ · mang giày chống trượt"
              price="150.000 ₫"
              tag="Đi bộ"
            />
          </Day>

          <Day
            day="Ngày 5"
            date="Thứ Tư, 16 tháng 10"
            weather="Chưa có dự báo cho ngày này"
          >
            <div className="weather-missing">
              <Icon name="cloud" />
              <span>
                <strong>Ngoài phạm vi dự báo hiện có</strong>
                <small>Triply sẽ cập nhật khi dữ liệu khả dụng.</small>
              </span>
              <Button variant="ghost">Thử lại sau</Button>
            </div>
          </Day>

          <button className="add-day">
            <Icon name="plus" /> Thêm ngày
          </button>

          <div className="unscheduled">
            <div>
              <h3>Chưa xếp lịch</h3>
              <p>Đề xuất và địa điểm đang chờ cả nhóm sắp xếp.</p>
            </div>
            <div className="unscheduled-items">
              <ScheduleCard
                time="--:--"
                type="Khách sạn"
                title="Pao's Sapa Leisure"
                details="2 đêm · Miễn phí hủy đến 10/10"
                price="2.480.000 ₫"
                tag="Đã lưu"
                external="Đặt qua Agoda"
              />
            </div>
          </div>
        </section>

        <aside className="weather-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">SA PA · CHUYẾN ĐI NÀY</span>
              <h2>Dự báo thời tiết</h2>
            </div>
            <Icon name="cloud" />
          </div>
          <p className="data-meta">Dữ liệu minh họa · cập nhật 10:20 hôm nay</p>

          <div className="weather-days">
            <WeatherDay
              day="T7, 12/10"
              icon="cloud"
              temp="18° / 12°"
              rain="Mưa 30%"
            />
            <WeatherDay
              day="CN, 13/10"
              icon="rain"
              temp="16° / 11°"
              rain="Mưa 70%"
              active
            />
            <WeatherDay
              day="T2, 14/10"
              icon="cloud"
              temp="17° / 10°"
              rain="Mưa 45%"
            />
            <WeatherDay
              day="T4, 16/10"
              icon="cloud"
              temp="—"
              rain="Chưa có dự báo"
            />
          </div>

          <div className="weather-tip">
            <Icon name="rain" />
            <span>
              <strong>Dự báo có thể đã cũ</strong>
              <small>Cập nhật 2 giờ trước. Làm mới trước khi áp dụng Plan B.</small>
            </span>
            <Button variant="ghost">Làm mới</Button>
          </div>

          <button className="ai-entry" onClick={() => setConcierge(true)}>
            <span className="feature-icon">
              <Icon name="spark" />
            </span>
            <span>
              <strong>AI Concierge</strong>
              <small>Trò chuyện riêng tư · chỉ bạn nhìn thấy</small>
            </span>
            <Icon name="chevron" />
          </button>
        </aside>
      </div>

      {tasks && <BackgroundTaskCenter />}
      {planner && (
        <AiPlannerPanel
          existing
          onClose={() => setPlanner(false)}
          onApplied={() => setPlanner(false)}
        />
      )}
      {concierge && <AiConciergeDrawer onClose={() => setConcierge(false)} />}
      {planB && <PlanBPanel onClose={() => setPlanB(false)} />}
    </div>
  );
}

function Day({
  day,
  date,
  weather,
  warning,
  children,
}: {
  day: string;
  date: string;
  weather: string;
  warning?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="day-block">
      <div className="day-header">
        <div>
          <strong>{day}</strong>
          <span>{date}</span>
        </div>
        <Badge tone={warning ? "warning" : "teal"}>
          {warning && <Icon name="rain" size={14} />} {weather}
        </Badge>
        <button className="icon-btn" aria-label="Tùy chọn ngày">
          <Icon name="more" />
        </button>
      </div>
      {children}
    </div>
  );
}

function ScheduleCard({
  time,
  type,
  title,
  details,
  price,
  tag,
  external,
  rain,
  onPlanB,
}: {
  time: string;
  type: string;
  title: string;
  details: string;
  price: string;
  tag: string;
  external?: string;
  rain?: boolean;
  onPlanB?: () => void;
}) {
  return (
    <div className={`schedule-card ${rain ? "rain-card" : ""}`}>
      <span className="drag">⠿</span>
      <div className="schedule-time">{time}</div>
      <span
        className={`card-icon ${
          type === "Khách sạn" ? "yellow" : "teal"
        }`}
      >
        {type.charAt(0)}
      </span>
      <div className="schedule-info">
        <small>{type}</small>
        <strong>{title}</strong>
        <span>{details}</span>
        {rain && (
          <div className="rain-actions">
            <Badge tone="warning">
              <Icon name="rain" size={13} /> Mưa 70% có thể ảnh hưởng hoạt động
            </Badge>
            <button onClick={onPlanB}>
              Gợi ý Plan B <Icon name="chevron" size={13} />
            </button>
          </div>
        )}
      </div>
      <div className="schedule-meta">
        <strong>{price}</strong>
        <Badge>{tag}</Badge>
        {external && (
          <button>
            {external} <Icon name="external" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function WeatherDay({
  day,
  icon,
  temp,
  rain,
  active,
}: {
  day: string;
  icon: string;
  temp: string;
  rain: string;
  active?: boolean;
}) {
  return (
    <div className={active ? "active" : ""}>
      <span>
        <Icon name={icon} />
        <strong>{day}</strong>
      </span>
      <span>
        <b>{temp}</b>
        <small>{rain}</small>
      </span>
    </div>
  );
}
