import { useNavigate, Link } from "react-router-dom";
import { Logo } from "../../components/common/Logo";
import { Icon } from "../../components/common/Icon";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { images, destinationsMock } from "../../data/mockData";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <nav className="landing-nav">
        <Logo />
        <div className="landing-links">
          <a href="#features">Tính năng</a>
          <a href="#how">Cách hoạt động</a>
          <a href="#ideas">Cảm hứng</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-actions">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Đăng nhập
          </Button>
          <Button onClick={() => navigate("/register")}>
            Đăng ký
          </Button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <Badge tone="yellow">
            <Icon name="spark" size={14} /> Trợ lý du lịch dành cho người Việt
          </Badge>
          <h1>
            Mỗi chuyến đi hay
            <br />
            bắt đầu từ một kế hoạch <em>thật nhẹ nhàng.</em>
          </h1>
          <p>
            Triply giúp bạn khám phá điểm đến, tạo lịch trình bằng AI và cùng bạn bè sắp xếp mọi chi tiết — tất cả trong một nơi.
          </p>
          <div className="hero-actions">
            <Button onClick={() => navigate("/trips/create")} icon="spark">
              Tạo chuyến đi
            </Button>
            <Button variant="secondary" onClick={() => navigate("/trips")}>
              Xem chuyến đi <Icon name="chevron" />
            </Button>
          </div>
          <div className="trust-line">
            <span className="avatar-stack">
              <Avatar label="M" />
              <Avatar label="H" color="teal" />
              <Avatar label="A" color="yellow" />
            </span>
            <span>Lên kế hoạch cùng nhau, quyết định vẫn thuộc về bạn.</span>
          </div>
        </div>
        <div className="hero-visual">
          <img src={images.hero} alt="Ruộng bậc thang Mù Cang Chải lúc bình minh" />
          <div className="hero-overlay-card trip-preview">
            <span className="tiny-label">CHUYẾN ĐI SẮP TỚI</span>
            <strong>Sa Pa cùng hội bạn</strong>
            <span>12–16 tháng 10 · 4 người</span>
            <div className="mini-progress">
              <i />
            </div>
          </div>
          <div className="hero-overlay-card weather-float">
            <Icon name="cloud" />
            <span>
              <strong>18°C</strong>
              <small>Sa Pa · Có mây</small>
            </span>
          </div>
        </div>
      </section>

      <section className="product-reveal">
        <div className="section-heading center">
          <span className="eyebrow">MỘT KHÔNG GIAN CHUNG</span>
          <h2>Từ ý tưởng rời rạc đến lịch trình rõ ràng</h2>
          <p>Không còn hàng chục tab, ảnh chụp màn hình và tin nhắn bị trôi.</p>
        </div>
        <WorkspacePreview />
      </section>

      <section className="benefits" id="features">
        <article>
          <span className="feature-icon">
            <Icon name="spark" />
          </span>
          <h3>Bớt thời gian tìm kiếm</h3>
          <p>Mô tả điều bạn muốn, Triply gợi ý lịch trình phù hợp với ngân sách và nhịp đi của nhóm.</p>
        </article>
        <article>
          <span className="feature-icon">
            <Icon name="users" />
          </span>
          <h3>Mọi người cùng tham gia</h3>
          <p>Kéo thả, ghi chú và biểu quyết trong một không gian chung, không làm mất ý tưởng của nhau.</p>
        </article>
        <article>
          <span className="feature-icon">
            <Icon name="compass" />
          </span>
          <h3>Gợi ý dành riêng cho bạn</h3>
          <p>Khám phá món ngon, văn hóa và thiên nhiên dựa trên sở thích bạn chủ động chia sẻ.</p>
        </article>
      </section>

      <section className="feature-split ai-demo">
        <div>
          <span className="eyebrow">TẠO LỊCH TRÌNH BẰNG AI</span>
          <h2>Chỉ cần nói bạn muốn đi như thế nào</h2>
          <p>
            “Lên lịch 4 ngày ở Sa Pa cho nhóm 4 người, ưu tiên thiên nhiên, đồ ăn địa phương và không khởi hành quá sớm.”
          </p>
          <ul className="check-list">
            <li>
              <Icon name="check" />
              Điều chỉnh theo ngân sách và sở thích
            </li>
            <li>
              <Icon name="check" />
              Xem đề xuất trước khi thêm vào lịch chung
            </li>
            <li>
              <Icon name="check" />
              Bạn luôn có quyền sửa hoặc từ chối
            </li>
          </ul>
          <Button onClick={() => navigate("/trips/create")}>Thử tạo bằng AI</Button>
        </div>
        <div className="prompt-card">
          <div className="prompt-top">
            <Badge tone="teal">
              <Icon name="spark" size={14} /> AI đang soạn
            </Badge>
            <span>72%</span>
          </div>
          <div className="progress">
            <i />
          </div>
          <div className="generated-day">
            <span>Ngày 2 · Thứ Hai</span>
            <strong>Ruộng bậc thang & bản làng</strong>
            <small>3 hoạt động · 680.000 ₫ dự kiến</small>
          </div>
          <div className="generated-item">
            <span className="time">08:30</span>
            <div>
              <strong>Trekking Lao Chải – Tả Van</strong>
              <small>3 giờ · Thiên nhiên</small>
            </div>
          </div>
          <div className="privacy-note">
            Đề xuất này chỉ hiển thị với bạn cho đến khi bạn chọn “Thêm vào lịch trình”.
          </div>
        </div>
      </section>

      <section className="collab-section">
        <div className="collab-board">
          <div className="day-label">NGÀY 1 · THỨ BẢY</div>
          <div className="drag-card">
            <span className="drag">⠿</span>
            <span className="card-icon teal">P</span>
            <div>
              <small>09:00 · 2 giờ</small>
              <strong>Đỉnh Fansipan</strong>
              <span>Cáp treo · 850.000 ₫</span>
            </div>
            <Avatar label="ML" />
          </div>
          <div className="drag-card selected">
            <span className="drag">⠿</span>
            <span className="card-icon yellow">A</span>
            <div>
              <small>14:30 · 1,5 giờ</small>
              <strong>Check-in bản Cát Cát</strong>
              <span>Đi bộ · 150.000 ₫</span>
            </div>
            <Avatar label="AL" color="yellow" />
          </div>
        </div>
        <div>
          <span className="eyebrow">CÙNG NHAU LÊN KẾ HOẠCH</span>
          <h2>Kéo, thả và thống nhất trong vài phút</h2>
          <p>
            Mỗi thay đổi đều rõ ràng. Bạn biết ai đang xem, ai vừa cập nhật và ý tưởng nào vẫn đang chờ cả nhóm duyệt.
          </p>
          <div className="activity-pill">
            <span className="pulse" />
            <b>Minh</b> vừa chuyển “Bản Cát Cát” sang 14:30
          </div>
        </div>
      </section>

      <section className="weather-plan">
        <div>
          <span className="eyebrow">THỜI TIẾT & PLAN B</span>
          <h2>Kế hoạch linh hoạt, kể cả khi trời đổi ý</h2>
          <p>
            Cảnh báo mưa trên từng hoạt động ngoài trời và nhận phương án thay thế. Triply chỉ đề xuất — lịch chung chỉ thay đổi khi bạn xác nhận.
          </p>
          <Button variant="dark" onClick={() => navigate("/trips")}>
            Xem cách Plan B hoạt động
          </Button>
        </div>
        <div className="forecast-card">
          <div className="rain-alert">
            <Icon name="rain" />
            <span>
              <strong>Mưa lớn có thể xảy ra</strong>
              <small>Thứ Hai, 14 tháng 10 · 70%</small>
            </span>
          </div>
          <div className="planb">
            <Badge tone="teal">PLAN B</Badge>
            <strong>Đổi trekking sang Bảo tàng Văn hóa</strong>
            <small>Trong nhà · Cách khách sạn 8 phút</small>
            <div>
              <Button variant="secondary">Để sau</Button>
              <Button onClick={() => navigate("/trips")}>Chấp nhận thay đổi</Button>
            </div>
          </div>
          <small className="source">Dữ liệu minh họa · cập nhật 10 phút trước</small>
        </div>
      </section>

      <section className="expense-feature">
        <div className="budget-card">
          <div className="budget-head">
            <span>
              <small>NGÂN SÁCH NHÓM</small>
              <strong>12.000.000 ₫</strong>
            </span>
            <Badge tone="success">Trong ngân sách</Badge>
          </div>
          <div className="budget-bar">
            <i />
          </div>
          <div className="budget-cols">
            <span>
              <small>Đã ghi nhận</small>
              <b>6.480.000 ₫</b>
            </span>
            <span>
              <small>Còn lại</small>
              <b>5.520.000 ₫</b>
            </span>
          </div>
          <hr />
          <div className="settle-row">
            <Avatar label="AL" color="yellow" />
            <span>
              <strong>An đã trả khách sạn</strong>
              <small>Minh cần trả An</small>
            </span>
            <b>1.240.000 ₫</b>
          </div>
        </div>
        <div>
          <span className="eyebrow">CHI PHÍ MINH BẠCH</span>
          <h2>Tiền nhóm không còn là bài toán khó</h2>
          <p>
            Phân chia theo người tham gia, theo dõi ai đã trả và tạo liên kết thanh toán VietQR khi cả nhóm sẵn sàng.
          </p>
          <Button variant="secondary" onClick={() => navigate("/funds")}>
            Khám phá Quỹ nhóm <Icon name="chevron" />
          </Button>
        </div>
      </section>

      <section className="destinations" id="ideas">
        <div className="section-heading">
          <span className="eyebrow">ĐI ĐÂU TIẾP THEO?</span>
          <h2>Việt Nam luôn có điều mới để khám phá</h2>
        </div>
        <div className="destination-grid">
          {destinationsMock.map((dest) => (
            <article key={dest.name} className="destination-card" onClick={() => navigate("/explore")}>
              <img src={dest.image} alt={dest.name} />
              <div>
                <h3>{dest.name}</h3>
                <p>{dest.meta}</p>
              </div>
              <button aria-label={`Xem ${dest.name}`}>
                <Icon name="chevron" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="how" id="how">
        <div className="section-heading center">
          <span className="eyebrow">BẮT ĐẦU THẬT DỄ</span>
          <h2>Ba bước cho một chuyến đi đáng nhớ</h2>
        </div>
        <div className="steps">
          <article>
            <b>01</b>
            <h3>Chia sẻ mong muốn</h3>
            <p>Chọn điểm đến, thời gian, ngân sách và phong cách du lịch.</p>
          </article>
          <article>
            <b>02</b>
            <h3>Tinh chỉnh cùng Triply</h3>
            <p>Tạo lịch trình bằng AI hoặc tự tay sắp xếp từng hoạt động.</p>
          </article>
          <article>
            <b>03</b>
            <h3>Mời nhóm và lên đường</h3>
            <p>Cùng quản lý lịch trình, chi phí và tham khảo lựa chọn từ đối tác.</p>
          </article>
        </div>
      </section>

      <section className="faq" id="faq">
        <div>
          <span className="eyebrow">CÂU HỎI THƯỜNG GẶP</span>
          <h2>Bạn đang thắc mắc?</h2>
          <p>Triply minh bạch về cách hoạt động và dữ liệu của bạn.</p>
        </div>
        <div className="faq-list">
          <details open>
            <summary>
              Triply có trực tiếp bán vé hay đặt phòng không?
              <Icon name="chevron" />
            </summary>
            <p>
              Không. Triply tổng hợp lựa chọn và chuyển bạn đến nhà cung cấp bên ngoài. Việc mua và xác nhận đặt chỗ diễn ra trên trang của họ.
            </p>
          </details>
          <details>
            <summary>
              AI có tự thay đổi lịch trình của nhóm không?
              <Icon name="chevron" />
            </summary>
            <p>
              Không bao giờ. Mọi đề xuất AI tạo ra đều là riêng tư cho bạn xem xét. Lịch chung chỉ thay đổi khi bạn bấm nút xác nhận.
            </p>
          </details>
          <details>
            <summary>
              Cuộc trò chuyện với AI Concierge có riêng tư không?
              <Icon name="chevron" />
            </summary>
            <p>
              Hoàn toàn riêng tư. Chỉ bạn mới thấy lịch sử trò chuyện. Các thành viên khác chỉ thấy hoạt động bạn chủ động thêm vào lịch trình.
            </p>
          </details>
          <details>
            <summary>
              Tôi có thể dùng Triply khi chưa biết điểm đến không?
              <Icon name="chevron" />
            </summary>
            <p>
              Có chứ! Hãy ghé mục Khám phá để xem các gợi ý địa điểm nổi bật tại Việt Nam và yêu cầu AI hỗ trợ lên kế hoạch.
            </p>
          </details>
        </div>
      </section>

      <section className="final-cta">
        <div>
          <h2>Sẵn sàng cho chuyến đi tiếp theo?</h2>
          <p>Bắt đầu từ một ý tưởng. Triply sẽ giúp bạn biến nó thành kế hoạch.</p>
        </div>
        <Button onClick={() => navigate("/trips/create")}>
          Tạo chuyến đi miễn phí <Icon name="chevron" />
        </Button>
      </section>

      <footer>
        <div>
          <Logo light />
          <p>Lên kế hoạch nhẹ nhàng. Đi cùng nhau.</p>
        </div>
        <div>
          <strong>Sản phẩm</strong>
          <Link to="/explore">Khám phá</Link>
          <Link to="/trips">Lịch trình chuyến đi</Link>
          <Link to="/funds">Quỹ nhóm</Link>
        </div>
        <div>
          <strong>Thông tin</strong>
          <a href="#faq">Điều khoản</a>
          <a href="#faq">Quyền riêng tư</a>
          <a href="#faq">Trợ giúp</a>
        </div>
        <div>
          <strong>Lưu ý</strong>
          <p>Triply là nền tảng tổng hợp. Giao dịch được thực hiện trực tiếp với nhà cung cấp bên ngoài.</p>
        </div>
        <small>© 2025 Triply. Thiết kế cho những hành trình tại Việt Nam.</small>
      </footer>
    </div>
  );
}

function WorkspacePreview() {
  return (
    <div className="workspace-preview">
      <div className="fake-side">
        <Logo />
        <span className="active">
          <Icon name="map" /> Lịch trình
        </span>
        <span>
          <Icon name="bookmark" /> Đặt chỗ
        </span>
        <span>
          <Icon name="wallet" /> Quỹ nhóm
        </span>
      </div>
      <div className="fake-main">
        <div className="fake-title">
          <div>
            <small>CHUYẾN ĐI CỦA TÔI / SA PA</small>
            <h3>Sa Pa cùng hội bạn</h3>
          </div>
          <div className="avatar-stack">
            <Avatar label="AL" color="yellow" />
            <Avatar label="ML" />
            <Avatar label="+2" color="teal" />
          </div>
        </div>
        <div className="fake-day">
          <b>Ngày 1</b>
          <span>Thứ Bảy, 12 tháng 10</span>
          <Badge tone="teal">18° · Có mây</Badge>
        </div>
        <div className="timeline-row">
          <span>08:30</span>
          <div>
            <strong>Ăn sáng tại Cốn Sủi Ông Há</strong>
            <small>45 phút · 160.000 ₫</small>
          </div>
        </div>
        <div className="timeline-row">
          <span>10:00</span>
          <div>
            <strong>Tàu hỏa leo núi Mường Hoa</strong>
            <small>2 giờ · Đã lưu lựa chọn</small>
          </div>
        </div>
      </div>
      <div className="fake-weather">
        <strong>Dự báo chuyến đi</strong>
        <div className="temp">18°</div>
        <span>Sa Pa · Có mây</span>
        <hr />
        <small>Khả năng mưa</small>
        <b>30%</b>
        <div className="tip">Nên mang theo áo khoác nhẹ và giày chống trượt.</div>
      </div>
    </div>
  );
}
