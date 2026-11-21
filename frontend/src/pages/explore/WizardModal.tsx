import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import { Skeleton } from '../../components/common/Skeleton';
import { DestinationCard } from './DestinationCard';
import { useSuggestDestinationsMutation } from '../../services/destinationsApi';
import type {
  RegionOption,
  VibeOption,
  CompanionOption,
  Destination,
} from '../../types/destination.types';

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REGION_OPTIONS: { value: RegionOption; label: string; desc: string; icon: string }[] = [
  { value: 'NORTH', label: 'Miền Bắc', desc: 'Núi non hùng vĩ, 4 mùa rõ rệt, thủ đô cổ kính', icon: '🏔️' },
  { value: 'CENTRAL', label: 'Miền Trung', desc: 'Biển xanh cát trắng, di sản văn hóa, phố cổ', icon: '🏖️' },
  { value: 'SOUTH', label: 'Miền Nam', desc: 'Đảo ngọc thiên đường, sông nước trù phú, nắng ấm', icon: '🌴' },
  { value: 'ANY', label: 'Bất kỳ đâu', desc: 'Mở rộng lựa chọn toàn Việt Nam tuyệt đẹp', icon: '✨' },
];

const VIBE_OPTIONS: { value: VibeOption; label: string; desc: string; icon: string }[] = [
  { value: 'NATURE', label: 'Thiên nhiên & Núi non', desc: 'Trekking, cắm trại, săn mây, hòa mình vào thiên nhiên', icon: '🌲' },
  { value: 'BEACH', label: 'Biển đảo & Nghỉ dưỡng', desc: 'Lặn ngắm san hô, tắm biển, resort view biển', icon: '🌊' },
  { value: 'HISTORY', label: 'Văn hóa & Lịch sử', desc: 'Phố cổ, chùa chiền, di sản thế giới UNESCO', icon: '🏛️' },
  { value: 'FOOD', label: 'Thiên đường Ẩm thực', desc: 'Street food, đặc sản địa phương nức tiếng', icon: '🍲' },
  { value: 'PHOTO', label: 'Chụp ảnh & Check-in', desc: 'Cảnh đẹp sống ảo, góc chụp nghệ thuật độc đáo', icon: '📸' },
];

const COMPANION_OPTIONS: { value: CompanionOption; label: string; desc: string; icon: string }[] = [
  { value: 'SOLO', label: 'Đi một mình (Solo)', desc: 'Tự do trải nghiệm, khám phá bản thân', icon: '🎒' },
  { value: 'COUPLE', label: 'Cặp đôi / Hẹn hò', desc: 'Lãng mạn, riêng tư, khoảnh khắc ngọt ngào', icon: '💑' },
  { value: 'FRIENDS', label: 'Nhóm bạn bè', desc: 'Sôi nổi, quẩy hết mình, hoạt động trải nghiệm', icon: '👥' },
  { value: 'FAMILY', label: 'Gia đình', desc: 'Thư giãn, tiện nghi, phù hợp mọi lứa tuổi', icon: '👨‍👩‍👧‍👦' },
];

export const WizardModal: React.FC<WizardModalProps> = ({ isOpen, onClose }) => {
  const currentMonth = new Date().getMonth() + 1;

  const [step, setStep] = useState<number>(0);
  const [region, setRegion] = useState<RegionOption>('ANY');
  const [vibe, setVibe] = useState<VibeOption>('NATURE');
  const [companion, setCompanion] = useState<CompanionOption>('FRIENDS');
  const [travelMonth, setTravelMonth] = useState<number>(currentMonth);
  const [results, setResults] = useState<Destination[] | null>(null);

  const [suggestDestinations, { isLoading, error }] = useSuggestDestinationsMutation();

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(0);
    setResults(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFinish = async () => {
    try {
      const res = await suggestDestinations({
        region,
        vibe,
        companion,
        travelMonth,
      }).unwrap();
      if (res.data?.destinations) {
        setResults(res.data.destinations);
      }
    } catch (e) {
      console.error('Suggest error:', e);
    }
  };

  return (
    <div className="wizard-backdrop" onClick={handleClose}>
      <div className="wizard-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="wizard-header">
          <div className="wizard-title-wrap">
            <div className="wizard-title-icon">
              <Icon name="spark" size={20} />
            </div>
            <div>
              <h2 className="wizard-title">Gợi ý chuyến đi hoàn hảo cùng AI</h2>
              <p className="wizard-subtitle">
                {results
                  ? '3 điểm đến lý tưởng được may đo cho bạn'
                  : `Bước ${step + 1}/4: Chọn tiêu chí bạn mong muốn`}
              </p>
            </div>
          </div>
          <button className="wizard-close-btn" onClick={handleClose} aria-label="Đóng modal">
            ✕
          </button>
        </div>

        {/* Step Progress Pills */}
        {!results && !isLoading && (
          <div className="wizard-progress-bar">
            {[0, 1, 2, 3].map((s) => (
              <div
                key={s}
                className={`wizard-progress-step ${s === step ? 'active' : ''} ${s < step ? 'completed' : ''}`}
                onClick={() => s < step && setStep(s)}
              />
            ))}
          </div>
        )}

        <div className="wizard-content">
          {isLoading ? (
            <div className="wizard-loading-state">
              <div className="wizard-loading-spinner" />
              <h3 className="wizard-loading-title">AI đang phân tích và tìm kiếm điểm đến...</h3>
              <p className="wizard-loading-desc">
                Đang đối chiếu thời tiết tháng {travelMonth}, vùng miền và sở thích của bạn
              </p>
              <div className="wizard-skeleton-grid">
                <div className="wizard-skeleton-card">
                  <Skeleton height={140} borderRadius={12} />
                  <Skeleton height={20} width="60%" style={{ marginTop: 12 }} />
                  <Skeleton height={14} width="90%" style={{ marginTop: 8 }} />
                  <Skeleton height={14} width="80%" style={{ marginTop: 6 }} />
                </div>
                <div className="wizard-skeleton-card">
                  <Skeleton height={140} borderRadius={12} />
                  <Skeleton height={20} width="60%" style={{ marginTop: 12 }} />
                  <Skeleton height={14} width="90%" style={{ marginTop: 8 }} />
                  <Skeleton height={14} width="80%" style={{ marginTop: 6 }} />
                </div>
                <div className="wizard-skeleton-card">
                  <Skeleton height={140} borderRadius={12} />
                  <Skeleton height={20} width="60%" style={{ marginTop: 12 }} />
                  <Skeleton height={14} width="90%" style={{ marginTop: 8 }} />
                  <Skeleton height={14} width="80%" style={{ marginTop: 6 }} />
                </div>
              </div>
            </div>
          ) : results ? (
            <div className="wizard-results-wrap">
              {results.length === 0 ? (
                <div className="wizard-empty">
                  <p>Không tìm thấy điểm đến phù hợp. Vui lòng thử lại với các tiêu chí khác.</p>
                  <button className="btn btn-primary" onClick={handleReset} style={{ marginTop: 16 }}>
                    Thử lại
                  </button>
                </div>
              ) : (
                <>
                  <div className="wizard-results-grid">
                    {results.map((dest) => (
                      <DestinationCard key={dest.placeId} destination={dest} />
                    ))}
                  </div>
                  <div className="wizard-results-footer">
                    <button className="btn btn-ghost" onClick={handleReset}>
                      <Icon name="spark" size={16} />
                      <span>Thử gợi ý khác</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Step 0: Vùng miền */}
              {step === 0 && (
                <div className="wizard-step-panel">
                  <h3 className="wizard-step-question">Bạn muốn khám phá khu vực nào?</h3>
                  <div className="wizard-options-grid">
                    {REGION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`wizard-opt-card ${region === opt.value ? 'selected' : ''}`}
                        onClick={() => setRegion(opt.value)}
                      >
                        <span className="wizard-opt-icon">{opt.icon}</span>
                        <div className="wizard-opt-info">
                          <span className="wizard-opt-title">{opt.label}</span>
                          <span className="wizard-opt-desc">{opt.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Vibe / Chủ đề */}
              {step === 1 && (
                <div className="wizard-step-panel">
                  <h3 className="wizard-step-question">Phong cách chuyến đi bạn yêu thích?</h3>
                  <div className="wizard-options-grid">
                    {VIBE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`wizard-opt-card ${vibe === opt.value ? 'selected' : ''}`}
                        onClick={() => setVibe(opt.value)}
                      >
                        <span className="wizard-opt-icon">{opt.icon}</span>
                        <div className="wizard-opt-info">
                          <span className="wizard-opt-title">{opt.label}</span>
                          <span className="wizard-opt-desc">{opt.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Bạn đồng hành */}
              {step === 2 && (
                <div className="wizard-step-panel">
                  <h3 className="wizard-step-question">Chuyến đi này có những ai tham gia?</h3>
                  <div className="wizard-options-grid">
                    {COMPANION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`wizard-opt-card ${companion === opt.value ? 'selected' : ''}`}
                        onClick={() => setCompanion(opt.value)}
                      >
                        <span className="wizard-opt-icon">{opt.icon}</span>
                        <div className="wizard-opt-info">
                          <span className="wizard-opt-title">{opt.label}</span>
                          <span className="wizard-opt-desc">{opt.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Tháng đi */}
              {step === 3 && (
                <div className="wizard-step-panel">
                  <h3 className="wizard-step-question">Dự kiến bạn sẽ đi vào tháng mấy?</h3>
                  <div className="wizard-months-grid">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`wizard-month-btn ${travelMonth === m ? 'selected' : ''}`}
                        onClick={() => setTravelMonth(m)}
                      >
                        <span className="wizard-month-num">Tháng {m}</span>
                        {m === currentMonth && <span className="wizard-month-current">(Hiện tại)</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="wizard-error-banner">
                  <span>Có lỗi xảy ra khi gọi AI gợi ý. Vui lòng thử lại.</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        {!results && !isLoading && (
          <div className="wizard-actions">
            {step > 0 ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep((s) => s - 1)}
              >
                Quay lại
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep((s) => s + 1)}
              >
                Tiếp tục
                <Icon name="chevron" size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary wizard-submit-btn"
                onClick={handleFinish}
              >
                <Icon name="spark" size={16} />
                <span>Gợi ý ngay với AI</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
