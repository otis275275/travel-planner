import { useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { Icon } from "../../components/common/Icon";
import { useGetExpensesByTripQuery } from "../../services/tripsApi";

export interface SettlementViewProps {
  tripId?: string;
  tripTitle?: string;
  destinationName?: string;
  totalBudget?: number | null;
  onBackToFunds?: () => void;
}

export function SettlementView({
  tripId,
  tripTitle,
  destinationName,
  totalBudget,
  onBackToFunds,
}: SettlementViewProps) {
  const [confirmed, setConfirmed] = useState(false);

  const { data: expensesRes, isLoading } = useGetExpensesByTripQuery(tripId || "", {
    skip: !tripId,
  });

  const allExpenses = expensesRes?.data || [];
  const personalExpenses = allExpenses.filter((e) => e.source === "PERSONAL_POCKET");
  const fundExpenses = allExpenses.filter((e) => e.source === "GROUP_FUND");

  const totalPersonalPaid = personalExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalFundSpent = fundExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalTripSpent = totalPersonalPaid + totalFundSpent;

  const hasBudget = typeof totalBudget === "number" && totalBudget > 0;
  const budgetSurplus = hasBudget ? totalBudget - totalFundSpent : 0;

  return (
    <div className="page settlement-page">
      <PageHeader
        eyebrow={`${tripTitle || "Chuyến đi"} / Quyết toán`}
        title="Quyết toán chuyến đi"
        description="Tổng hợp ngân sách, chi phí quỹ chung và các hoạt động do thành viên tự thanh toán."
      >
        {onBackToFunds && (
          <Button variant="secondary" onClick={onBackToFunds}>
            ← Quay lại danh sách chi tiêu
          </Button>
        )}
      </PageHeader>

      <div className="settlement-status">
        <span className="feature-icon">
          <Icon name="check" />
        </span>
        <div>
          <strong>Sẵn sàng quyết toán</strong>
          <p>
            {tripId
              ? `${allExpenses.length} khoản chi thực tế đã ghi nhận · không còn khoản đang tranh luận`
              : "12 khoản chi đã xác nhận · không còn khoản đang tranh luận"}
          </p>
        </div>
        <Badge tone="success">Dữ liệu đã khóa</Badge>
      </div>

      <div className="settlement-summary">
        <div>
          <small>{hasBudget ? "Ngân sách chuyến đi" : "Tổng chi thực tế"}</small>
          <strong>
            {hasBudget
              ? `${totalBudget.toLocaleString("vi-VN")} ₫`
              : `${totalTripSpent.toLocaleString("vi-VN")} ₫`}
          </strong>
        </div>
        <div>
          <small>Tổng chi từ quỹ</small>
          <strong>{`${totalFundSpent.toLocaleString("vi-VN")} ₫`}</strong>
        </div>
        <div className="highlight">
          <small>{hasBudget ? "Ngân sách còn lại" : "Khoản chi cá nhân"}</small>
          <strong>
            {hasBudget
              ? `${budgetSurplus >= 0 ? budgetSurplus.toLocaleString("vi-VN") : `-${Math.abs(budgetSurplus).toLocaleString("vi-VN")}`} ₫`
              : `${personalExpenses.length} khoản`}
          </strong>
        </div>
        <div>
          <small>Cá nhân đã trả</small>
          <strong>{`${totalPersonalPaid.toLocaleString("vi-VN")} ₫`}</strong>
        </div>
      </div>

      <div className="settle-grid">
        {/* Section 1: Group Fund Summary & Surplus Status */}
        <section className="card refund-card">
          <span className="step-number">1</span>
          <span className="eyebrow">TỔNG KẾT NGUỒN QUỸ</span>
          <h2>{hasBudget ? "Tình trạng ngân sách quỹ" : "Tổng kết chi từ quỹ chung"}</h2>
          <p>
            {hasBudget
              ? "So sánh ngân sách dự kiến và tổng các khoản đã chi từ quỹ chung."
              : "Tổng hợp các chi phí đã được trích thanh toán từ quỹ chung chuyến đi."}
          </p>

          <div className="fund-surplus-hero">
            <div className="surplus-label">
              <small>{hasBudget ? "NGÂN SÁCH QUỸ CÒN DƯ" : "TỔNG ĐÃ CHI TỪ QUỸ"}</small>
              <strong>
                {hasBudget
                  ? `${Math.abs(budgetSurplus).toLocaleString("vi-VN")} ₫`
                  : `${totalFundSpent.toLocaleString("vi-VN")} ₫`}
              </strong>
            </div>
            <Badge tone={hasBudget && budgetSurplus < 0 ? "warning" : "success"}>
              {hasBudget ? (budgetSurplus >= 0 ? "Trong hạn mức" : "Vượt ngân sách") : `${fundExpenses.length} khoản chi`}
            </Badge>
          </div>

          <div className="fund-metrics-panel">
            <div className="metric-row">
              <span>
                <small>{hasBudget ? "Ngân sách thiết lập" : "Tổng chi phí chuyến đi"}</small>
                <b>
                  {hasBudget
                    ? `${totalBudget.toLocaleString("vi-VN")} ₫`
                    : `${totalTripSpent.toLocaleString("vi-VN")} ₫`}
                </b>
              </span>
              <span>
                <small>Tổng tiền đã chi từ quỹ</small>
                <b>{`${totalFundSpent.toLocaleString("vi-VN")} ₫`}</b>
              </span>
            </div>
          </div>

          <div className="settlement-note">
            <Icon name="wallet" />
            <span>
              <strong>Xử lý ngân sách</strong>
              <small>
                {hasBudget && budgetSurplus > 0
                  ? `Ngân sách quỹ còn dư ${budgetSurplus.toLocaleString("vi-VN")} ₫ có thể được hoàn trả hoặc giữ lại cho chuyến đi tiếp theo.`
                  : "Mọi khoản chi thực tế đã được hạch toán minh bạch giữa các thành viên."}
              </small>
            </span>
          </div>
        </section>

        {/* Section 2: Personal expenses paid (changes.diff applied) */}
        <section className="card debt-card">
          <span className="step-number">2</span>
          <span className="eyebrow">CHI PHÍ CÁ NHÂN ĐÃ TRẢ</span>
          <h2>Ai đã thanh toán cho hoạt động nào?</h2>
          <p>Danh sách tham khảo các khoản thành viên đã tự thanh toán trong chuyến đi.</p>

          {isLoading ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
              Đang tải danh sách thanh toán...
            </div>
          ) : personalExpenses.length > 0 ? (
            personalExpenses.map((item) => (
              <div key={item.id} className="personal-payment">
                <Avatar
                  label={(item.paidByName || "U").substring(0, 2).toUpperCase()}
                  src={item.paidByAvatar || undefined}
                />
                <span>
                  <strong>{item.paidByName ? `${item.paidByName} đã trả` : "Cá nhân đã trả"}</strong>
                  <small>
                    {item.activityTitle || item.title}
                    {item.activityDayNumber ? ` · Ngày ${item.activityDayNumber}` : ""}
                    {item.activityStartTime ? `, ${item.activityStartTime.substring(0, 5)}` : ""}
                  </small>
                </span>
                <b>{Number(item.amount).toLocaleString("vi-VN")} ₫</b>
                <Badge tone="warning">Cá nhân</Badge>
              </div>
            ))
          ) : tripId ? (
            <div style={{ padding: "28px 0", textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
              Chưa có khoản chi cá nhân nào được ghi nhận cho chuyến đi này.
            </div>
          ) : (
            <>
              <div className="personal-payment">
                <Avatar label="B" />
                <span>
                  <strong>Bình đã trả</strong>
                  <small>Ăn tối Lẩu cá hồi · Ngày 1, 19:30</small>
                </span>
                <b>1.500.000 ₫</b>
                <Badge tone="warning">Cá nhân</Badge>
              </div>

              <div className="personal-payment">
                <Avatar label="AL" color="yellow" />
                <span>
                  <strong>An đã trả</strong>
                  <small>Pao's Sapa Leisure · 2 đêm</small>
                </span>
                <b>2.480.000 ₫</b>
                <Badge tone="warning">Cá nhân</Badge>
              </div>

              <div className="personal-payment">
                <Avatar label="C" color="teal" />
                <span>
                  <strong>Chi đã trả</strong>
                  <small>Bữa trưa tại Tả Van · Ngày 2, 13:00</small>
                </span>
                <b>860.000 ₫</b>
                <Badge tone="warning">Cá nhân</Badge>
              </div>
            </>
          )}

          <div className="settlement-note">
            <Icon name="wallet" />
            <span>
              <strong>Chỉ hiển thị lịch sử thanh toán</strong>
              <small>Triply không tự động tạo nghĩa vụ chuyển tiền giữa các thành viên.</small>
            </span>
          </div>
        </section>

      </div>

      <div className="settlement-footer">
        <span>
          <strong>Sau quyết toán</strong>
          <small>Quỹ chung về 0 ₫ và toàn bộ lịch sử đóng góp, chi quỹ, chi cá nhân được lưu lại.</small>
        </span>
        {confirmed ? (
          <Badge tone="success">
            <Icon name="check" /> Đã xác nhận quyết toán
          </Badge>
        ) : (
          <Button onClick={() => setConfirmed(true)}>
            Xác nhận hoàn tất quyết toán
          </Button>
        )}
      </div>
    </div>
  );
}

