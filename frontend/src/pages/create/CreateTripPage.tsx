import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { Icon } from "../../components/common/Icon";
import { Badge } from "../../components/common/Badge";
import {
  TripBasicInfoSection,
  TripPreferencesSection,
  TripSummaryCard,
} from "../../components/trips";
import { AiPlannerPanel } from "../../components/ai/AiPlannerPanel";
import { useCreateTripMutation } from "../../services/tripsApi";
import type { AutocompleteItem } from "../../types/destination.types";
import type { TripStatus } from "../../types/trip.types";

export function CreateTripPage() {
  const navigate = useNavigate();
  const [ai, setAi] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [tripName, setTripName] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<AutocompleteItem | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [people, setPeople] = useState("2");
  const [budget, setBudget] = useState("");

  const [createTrip, { isLoading: isCreating }] = useCreateTripMutation();

  // Preferences states
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Ẩm thực",
    "Thiên nhiên",
    "Tránh nơi đông",
  ]);
  const [transport, setTransport] = useState("Taxi, đi bộ ngắn");
  const [dietary, setDietary] = useState("Không yêu cầu đặc biệt");
  const [accessibility, setAccessibility] = useState("");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectDestination = (item: AutocompleteItem) => {
    setSelectedDestination(item);
    setDestinationInput(item.displayName);
    setErrorMessage(null);

    // Auto-fill a friendly trip name if empty or previous auto-name
    if (!tripName.trim() || tripName.startsWith("Chuyến đi ")) {
      setTripName(`Chuyến đi ${item.displayName}`);
    }
  };

  const handleClearDestination = () => {
    setSelectedDestination(null);
    setDestinationInput("");
  };

  // Submit Handler for Draft & Planned
  const handleSubmit = async (status: TripStatus) => {
    setErrorMessage(null);

    if (!selectedDestination) {
      setErrorMessage("Vui lòng tìm và chọn điểm đến từ danh sách gợi ý.");
      return;
    }

    const titleToUse = tripName.trim() || `Chuyến đi ${selectedDestination.displayName}`;
    const cleanBudget = budget ? Number(budget.replace(/\D/g, "")) : undefined;

    try {
      const res = await createTrip({
        title: titleToUse,
        placeId: selectedDestination.placeId,
        destinationName: selectedDestination.displayName,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        totalBudget: cleanBudget && !isNaN(cleanBudget) ? cleanBudget : undefined,
        status,
      }).unwrap();

      if (res.data?.id) {
        if (status === "DRAFT") {
          navigate("/trips");
        } else {
          navigate(`/trips/${res.data.id}`);
        }
      }
    } catch (err: any) {
      console.error("Failed to create trip:", err);
      if (err?.status === 401) {
        navigate("/login");
      } else {
        setErrorMessage(
          err?.data?.message || "Không thể tạo chuyến đi. Vui lòng thử lại sau."
        );
      }
    }
  };

  const handleApplied = () => {
    setPlannerOpen(false);
    navigate("/trips");
  };

  return (
    <div className="page create-page">
      <PageHeader
        eyebrow="Chuyến đi của tôi / Tạo mới"
        title="Tạo chuyến đi mới"
        description="Chia sẻ vài điều cơ bản. Bạn có thể thay đổi mọi thứ sau này."
      >
        <Badge tone="neutral">Bước 2 / 3</Badge>
      </PageHeader>

      {errorMessage && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="creation-layout">
        <div className="form-card">
          {/* Section 1: Thông tin cơ bản */}
          <TripBasicInfoSection
            title={tripName}
            onChangeTitle={setTripName}
            destinationInput={destinationInput}
            onChangeDestinationInput={setDestinationInput}
            selectedDestination={selectedDestination}
            onSelectDestination={handleSelectDestination}
            onClearDestination={handleClearDestination}
            startDate={startDate}
            onChangeStartDate={setStartDate}
            endDate={endDate}
            onChangeEndDate={setEndDate}
            people={people}
            onChangePeople={setPeople}
            budget={budget}
            onChangeBudget={setBudget}
            sectionNumber={1}
          />

          {/* Section 2: Sở thích & Nhu cầu */}
          <TripPreferencesSection
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            transport={transport}
            onChangeTransport={setTransport}
            dietary={dietary}
            onChangeDietary={setDietary}
            accessibility={accessibility}
            onChangeAccessibility={setAccessibility}
            sectionNumber={2}
          />

          {/* Section 3: Lựa chọn bắt đầu */}
          <section>
            <div className="form-section-title">
              <b>3</b>
              <div>
                <h2>Bạn muốn bắt đầu thế nào?</h2>
                <p>Chọn cách xây dựng lịch trình đầu tiên.</p>
              </div>
            </div>
            <div className="choice-grid">
              <button
                type="button"
                className={!ai ? "selected" : ""}
                onClick={() => setAi(false)}
              >
                <span className="feature-icon">
                  <Icon name="map" />
                </span>
                <strong>Tự lên kế hoạch</strong>
                <small>Bắt đầu với lịch trống.</small>
              </button>
              <button
                type="button"
                className={ai ? "selected" : ""}
                onClick={() => {
                  setAi(true);
                  setPlannerOpen(true);
                }}
              >
                <span className="feature-icon">
                  <Icon name="spark" />
                </span>
                <strong>Tạo bằng AI</strong>
                <small>Mở không gian lập kế hoạch có kiểm soát.</small>
                <Badge tone="yellow">Gợi ý</Badge>
              </button>
            </div>

            {ai && (
              <label className="top-gap">
                Mô tả chuyến đi bạn mong muốn
                <textarea
                  rows={4}
                  defaultValue="Lên lịch khám phá ẩm thực và cảnh đẹp địa phương, ngân sách hợp lý, lịch trình thong thả."
                />
                <small>
                  Triply sẽ trích xuất điều kiện để bạn kiểm tra trước khi tạo.
                </small>
              </label>
            )}
          </section>

          <div className="form-actions">
            <Button
              variant="secondary"
              disabled={isCreating}
              onClick={() => handleSubmit("DRAFT")}
            >
              {isCreating ? "Đang lưu..." : "Lưu bản nháp"}
            </Button>
            <Button
              icon={ai ? "spark" : "chevron"}
              disabled={isCreating}
              onClick={() => handleSubmit("PLANNED")}
            >
              {isCreating ? "Đang tạo chuyến đi..." : "Mở lịch trình"}
            </Button>
          </div>
        </div>

        {/* Reusable Trip Summary Card */}
        <TripSummaryCard
          destination={selectedDestination}
          destinationFallback={destinationInput}
          startDate={startDate}
          endDate={endDate}
          people={people}
          budget={budget}
        />
      </div>

      {plannerOpen && (
        <AiPlannerPanel
          onClose={() => setPlannerOpen(false)}
          onApplied={handleApplied}
        />
      )}
    </div>
  );
}
