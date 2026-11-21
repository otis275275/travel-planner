import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Icon } from "../../components/common/Icon";
import { SettlementView } from "./SettlementView";
import {
  useGetFullTripDetailsQuery,
  useGetExpensesByTripQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} from "../../services/tripsApi";
import type { PaymentSource } from "../../types/trip.types";

export type FundTab = "expenses" | "settle";

interface FundsPageProps {
  tripId?: string;
  tripTitle?: string;
  destinationName?: string;
  initialTab?: FundTab;
}

export function FundsPage({
  tripId,
  tripTitle,
  destinationName,
  initialTab = "expenses",
}: FundsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as FundTab | null;
  const [tab, setTab] = useState<FundTab>(tabParam === "settle" ? "settle" : initialTab);
  const [addExpenseDrawer, setAddExpenseDrawer] = useState(false);

  // Form states for adding an expense
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseSource, setExpenseSource] = useState<PaymentSource>("GROUP_FUND");
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

  // RTK Query: fetch full trip details (for totalBudget and itinerary activities)
  const { data: tripRes } = useGetFullTripDetailsQuery(tripId || "", {
    skip: !tripId,
  });
  const trip = tripRes?.data;
  const totalBudget = trip?.totalBudget || 0;

  // RTK Query: fetch real expenses recorded for this trip
  const { data: expensesRes, isLoading: isExpensesLoading } = useGetExpensesByTripQuery(
    tripId || "",
    { skip: !tripId }
  );
  const expenses = expensesRes?.data || [];

  const [createExpense, { isLoading: isCreatingExpense }] = useCreateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();

  useEffect(() => {
    if (tabParam === "settle" || tabParam === "expenses") {
      setTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab: FundTab) => {
    setTab(newTab);
    setSearchParams(newTab === "expenses" ? {} : { tab: newTab });
  };

  // Flatten activities from all days for the dropdown
  const allActivities = (trip?.days || []).flatMap((day) =>
    (day.activities || []).map((act) => ({
      ...act,
      dayNumber: day.dayNumber,
    }))
  );

  // Compute real financial metrics
  const groupFundExpenses = expenses.filter((e) => e.source === "GROUP_FUND");
  const personalExpenses = expenses.filter((e) => e.source === "PERSONAL_POCKET");

  const totalFundSpent = groupFundExpenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );
  const totalPersonalSpent = personalExpenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );
  const totalSpent = totalFundSpent + totalPersonalSpent;

  const hasBudget = totalBudget > 0;
  const remainingBudget = hasBudget ? totalBudget - totalSpent : 0;
  const usagePercentage = hasBudget
    ? Math.min(100, Math.round((totalSpent / totalBudget) * 100))
    : 0;

  // Handle saving new expense
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;

    const rawNum = expenseAmount.replace(/[^0-9]/g, "");
    const num = parseFloat(rawNum);
    if (!num || num <= 0) {
      setErrorMsg("Vui lòng nhập số tiền hợp lệ (> 0 ₫)");
      return;
    }
    if (!expenseTitle.trim()) {
      setErrorMsg("Vui lòng nhập tên khoản chi");
      return;
    }

    try {
      await createExpense({
        tripId,
        data: {
          title: expenseTitle.trim(),
          amount: num,
          source: expenseSource,
          activityId: selectedActivityId || null,
        },
      }).unwrap();

      setAddExpenseDrawer(false);
      setExpenseTitle("");
      setExpenseAmount("");
      setSelectedActivityId("");
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Không thể lưu khoản chi. Vui lòng thử lại.");
    }
  };

  // Handle activity selection in drawer
  const handleActivityChange = (actId: string) => {
    setSelectedActivityId(actId);
    if (actId) {
      const act = allActivities.find((a) => a.id === actId);
      if (act) {
        if (!expenseTitle || allActivities.some((a) => a.title === expenseTitle)) {
          setExpenseTitle(act.title);
        }
        if (act.estCost && !expenseAmount) {
          setExpenseAmount(new Intl.NumberFormat("vi-VN").format(act.estCost));
        }
      }
    }
  };

  // Handle deleting an expense
  const handleDeleteExpense = async (expenseId: string, title: string) => {
    if (!tripId) return;
    if (window.confirm(`Bạn có chắc muốn xóa khoản chi "${title}"?`)) {
      try {
        await deleteExpense({ tripId, expenseId }).unwrap();
      } catch (err) {
        console.error("Xóa khoản chi thất bại:", err);
      }
    }
  };

  // If currently in Settlement view
  if (tab === "settle") {
    return (
      <SettlementView
        tripId={tripId}
        tripTitle={tripTitle}
        destinationName={destinationName}
        totalBudget={totalBudget}
        onBackToFunds={() => handleTabChange("expenses")}
      />
    );
  }

  return (
    <div className="page funds-page">
      <PageHeader
        eyebrow={`${tripTitle || "Chuyến đi"} / Chi tiêu & Quyết toán`}
        title="Quản lý chi tiêu chuyến đi"
        description="Theo dõi chi phí thực tế gắn với lịch trình và phân định nguồn thanh toán."
      >
        <div className="header-actions">
          <Button icon="plus" onClick={() => setAddExpenseDrawer(true)}>
            Ghi nhận chi phí
          </Button>
        </div>
      </PageHeader>

      {/* Expense & Treasury Hero Card */}
      <div className="treasury-hero">
        <div>
          <span className="eyebrow">
            {hasBudget
              ? remainingBudget >= 0
                ? "NGÂN SÁCH CÒN LẠI"
                : "VƯỢT NGÂN SÁCH"
              : "TỔNG CHI TIÊU THỰC TẾ"}
          </span>
          <strong>
            {hasBudget
              ? `${Math.abs(remainingBudget).toLocaleString("vi-VN")} ₫`
              : `${totalSpent.toLocaleString("vi-VN")} ₫`}
          </strong>
          <small>
            {hasBudget
              ? `Ngân sách dự kiến: ${totalBudget.toLocaleString("vi-VN")} ₫ · Đã chi: ${totalSpent.toLocaleString("vi-VN")} ₫`
              : `${expenses.length} khoản chi thực tế đã được ghi nhận`}
          </small>
        </div>
        <div className="treasury-metrics">
          <span>
            <small>Chi từ quỹ chung</small>
            <b>{totalFundSpent.toLocaleString("vi-VN")} ₫</b>
            <small style={{ fontSize: "10px", marginTop: "2px" }}>
              {groupFundExpenses.length} khoản chi
            </small>
          </span>
          <span>
            <small>Cá nhân tự trả</small>
            <b style={{ color: "var(--yellow)" }}>
              {totalPersonalSpent.toLocaleString("vi-VN")} ₫
            </b>
            <small style={{ fontSize: "10px", marginTop: "2px" }}>
              {personalExpenses.length} khoản chi
            </small>
          </span>
          <span>
            <small>{hasBudget ? "Tỷ lệ sử dụng" : "Tổng khoản chi"}</small>
            <b>{hasBudget ? `${usagePercentage}%` : `${expenses.length} khoản`}</b>
            <small style={{ fontSize: "10px", marginTop: "2px" }}>
              {hasBudget
                ? remainingBudget >= 0
                  ? "Trong hạn mức"
                  : "Vượt định mức"
                : "Đã cập nhật"}
            </small>
          </span>
        </div>
        <div className="fund-progress">
          <i
            style={{
              width: hasBudget ? `${usagePercentage}%` : "100%",
              background:
                hasBudget && remainingBudget < 0 ? "var(--danger)" : undefined,
            }}
          />
        </div>
      </div>

      {/* Switcher Navigation */}
      <div className="fund-switcher">
        <button
          className={tab === "expenses" ? "active" : ""}
          onClick={() => handleTabChange("expenses")}
        >
          Lịch trình & chi tiêu
        </button>
        <button
          className={tab === "settle" ? "active" : ""}
          onClick={() => handleTabChange("settle")}
        >
          Quyết toán
        </button>
      </div>

      {/* Tab: Expenses */}
      <div className="funds-layout">
        <section>
          <div className="card">
            <div className="card-title">
              <div>
                <h2>Chi phí gắn với lịch trình</h2>
                <p>Bao gồm cả chi từ quỹ chung và chi phí thành viên tự chi trả.</p>
              </div>
              <Button
                variant="secondary"
                icon="plus"
                onClick={() => setAddExpenseDrawer(true)}
              >
                Thêm chi phí
              </Button>
            </div>

            {isExpensesLoading ? (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                <span className="spinner" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: "13px" }}>Đang tải danh sách chi phí thực tế...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div
                style={{
                  padding: "48px 20px",
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    padding: "16px",
                    borderRadius: "50%",
                    background: "#f0f2ee",
                    marginBottom: "12px",
                  }}
                >
                  <Icon name="wallet" size={28} />
                </div>
                <h3
                  style={{
                    fontSize: "15px",
                    color: "var(--ink)",
                    fontWeight: 600,
                  }}
                >
                  Chưa có khoản chi nào
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    maxWidth: "380px",
                    margin: "6px auto 18px",
                    lineHeight: 1.5,
                  }}
                >
                  Ghi nhận chi phí thực tế trực tiếp từ từng hoạt động trên lịch
                  trình hoặc bấm nút thêm chi phí bên dưới.
                </p>
                <Button icon="plus" onClick={() => setAddExpenseDrawer(true)}>
                  Ghi nhận khoản chi mới
                </Button>
              </div>
            ) : (
              expenses.map((item) => (
                <ExpenseRow
                  key={item.id}
                  title={item.title || item.activityTitle || "Khoản chi"}
                  meta={
                    item.activityTitle
                      ? `Hoạt động: ${item.activityTitle}${
                          item.activityDayNumber
                            ? ` · Ngày ${item.activityDayNumber}`
                            : ""
                        }${
                          item.activityStartTime
                            ? `, ${item.activityStartTime.substring(0, 5)}`
                            : ""
                        }`
                      : `Chi phí chuyến đi · ${new Date(
                          item.createdAt
                        ).toLocaleDateString("vi-VN")}`
                  }
                  payer={
                    item.source === "PERSONAL_POCKET"
                      ? `${item.paidByName || "Thành viên"} đã tự trả`
                      : "Trích từ quỹ chung"
                  }
                  amount={`${Number(item.amount).toLocaleString("vi-VN")} ₫`}
                  source={item.source === "GROUP_FUND" ? "Quỹ chung" : "Cá nhân"}
                  onDelete={() => handleDeleteExpense(item.id, item.title)}
                />
              ))
            )}
          </div>
        </section>

        <aside>
          <div className="card">
            <div className="card-title">
              <h2>Cơ cấu nguồn chi</h2>
            </div>
            <div
              className="settlement-summary"
              style={{ gridTemplateColumns: "1fr", margin: 0 }}
            >
              <div style={{ marginBottom: "10px" }}>
                <small>Chi từ quỹ chung</small>
                <strong>{totalFundSpent.toLocaleString("vi-VN")} ₫</strong>
              </div>
              <div>
                <small>Cá nhân tự thanh toán</small>
                <strong style={{ color: "var(--warning)" }}>
                  {totalPersonalSpent.toLocaleString("vi-VN")} ₫
                </strong>
              </div>
            </div>
            <div className="settlement-note" style={{ marginTop: "15px" }}>
              <Icon name="wallet" />
              <span>
                <strong>Phân tách nguồn chi rõ ràng</strong>
                <small>
                  Khoản cá nhân tự trả sẽ được tập hợp trong phần Quyết toán để nhóm
                  minh bạch hoàn trả.
                </small>
              </span>
            </div>
            <Button
              variant="secondary"
              style={{
                width: "100%",
                marginTop: "16px",
                justifyContent: "center",
              }}
              onClick={() => handleTabChange("settle")}
            >
              Chuyển sang Quyết toán →
            </Button>
          </div>
        </aside>
      </div>

      {/* Add Expense Drawer */}
      {addExpenseDrawer && (
        <div
          className="drawer-overlay"
          onClick={() => setAddExpenseDrawer(false)}
        >
          <div className="side-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-title">
              <div>
                <h2>Thêm chi phí thực tế</h2>
                <p>Ghi lại khoản chi thực tế của nhóm hoặc cá nhân.</p>
              </div>
              <button
                type="button"
                onClick={() => setAddExpenseDrawer(false)}
                aria-label="Đóng"
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense}>
              {errorMsg && (
                <div
                  style={{
                    background: "#fde8e8",
                    color: "var(--danger)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    marginBottom: "14px",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <label>
                Gắn với hoạt động trong lịch trình (tùy chọn)
                <select
                  value={selectedActivityId}
                  onChange={(e) => handleActivityChange(e.target.value)}
                >
                  <option value="">-- Không gắn hoạt động nào --</option>
                  {allActivities.map((act) => (
                    <option key={act.id} value={act.id}>
                      Ngày {act.dayNumber}: {act.title}
                      {act.estCost
                        ? ` (Dự kiến: ${act.estCost.toLocaleString("vi-VN")} ₫)`
                        : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tên khoản chi
                <input
                  required
                  placeholder="Ví dụ: Bữa trưa tại Tả Van, Taxi, Vé cáp treo..."
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                />
              </label>

              <label>
                Số tiền thực tế
                <div className="input-suffix">
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={expenseAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setExpenseAmount(
                        val ? new Intl.NumberFormat("vi-VN").format(Number(val)) : ""
                      );
                    }}
                  />
                  <span>₫</span>
                </div>
              </label>

              <label>
                Nguồn thanh toán
                <select
                  value={expenseSource}
                  onChange={(e) =>
                    setExpenseSource(e.target.value as PaymentSource)
                  }
                >
                  <option value="GROUP_FUND">Quỹ chung (Trích từ quỹ)</option>
                  <option value="PERSONAL_POCKET">
                    Cá nhân tự thanh toán (Được ghi nhận để quyết toán)
                  </option>
                </select>
              </label>

              <div
                className="drawer-actions"
                style={{ marginTop: "24px" }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAddExpenseDrawer(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreatingExpense}>
                  {isCreatingExpense ? "Đang lưu..." : "Lưu chi phí"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpenseRow({
  title,
  meta,
  payer,
  amount,
  source,
  onDelete,
}: {
  title: string;
  meta: string;
  payer: string;
  amount: string;
  source: "Quỹ chung" | "Cá nhân";
  onDelete?: () => void;
}) {
  return (
    <div className="expense-row">
      <span className="expense-icon">
        <Icon name={source === "Quỹ chung" ? "wallet" : "compass"} />
      </span>
      <div>
        <strong>{title}</strong>
        <small>{meta}</small>
        <span>{payer}</span>
      </div>
      <strong>{amount}</strong>
      <Badge tone={source === "Quỹ chung" ? "teal" : "warning"}>
        {source}
      </Badge>
      {onDelete ? (
        <button
          type="button"
          className="icon-btn"
          aria-label="Xóa khoản chi"
          title="Xóa khoản chi"
          onClick={onDelete}
          style={{
            color: "var(--muted)",
            cursor: "pointer",
            background: "none",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="trash" size={14} />
        </button>
      ) : (
        <button className="icon-btn" aria-label="Tùy chọn">
          <Icon name="more" />
        </button>
      )}
    </div>
  );
}
