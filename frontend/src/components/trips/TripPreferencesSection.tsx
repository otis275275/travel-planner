import React from 'react';

const PREFERENCE_TAGS = [
  'Ẩm thực',
  'Thiên nhiên',
  'Văn hóa',
  'Tránh nơi đông',
  'Thư giãn',
  'Nhiếp ảnh',
];

export interface TripPreferencesSectionProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  transport?: string;
  onChangeTransport?: (val: string) => void;
  dietary?: string;
  onChangeDietary?: (val: string) => void;
  accessibility?: string;
  onChangeAccessibility?: (val: string) => void;
  sectionNumber?: string | number;
}

export function TripPreferencesSection({
  selectedTags,
  onToggleTag,
  transport = 'Taxi, đi bộ ngắn',
  onChangeTransport,
  dietary = 'Không yêu cầu đặc biệt',
  onChangeDietary,
  accessibility = '',
  onChangeAccessibility,
  sectionNumber = 2,
}: TripPreferencesSectionProps) {
  return (
    <section>
      <div className="form-section-title">
        <b>{sectionNumber}</b>
        <div>
          <h2>Sở thích & nhu cầu</h2>
          <p>Giúp gợi ý phù hợp hơn với cả nhóm.</p>
        </div>
      </div>

      <div className="chip-select">
        {PREFERENCE_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            className={selectedTags.includes(tag) ? 'selected' : ''}
            onClick={() => onToggleTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="field-grid top-gap">
        <label>
          Di chuyển ưu tiên
          <select
            value={transport}
            onChange={(e) => onChangeTransport?.(e.target.value)}
          >
            <option value="Taxi, đi bộ ngắn">Taxi, đi bộ ngắn</option>
            <option value="Thuê xe máy tự lái">Thuê xe máy tự lái</option>
            <option value="Xe khách / Tàu hỏa">Xe khách / Tàu hỏa</option>
          </select>
        </label>

        <label>
          Chế độ ăn
          <select
            value={dietary}
            onChange={(e) => onChangeDietary?.(e.target.value)}
          >
            <option value="Không yêu cầu đặc biệt">Không yêu cầu đặc biệt</option>
            <option value="Ăn chay / Thuần chay">Ăn chay / Thuần chay</option>
            <option value="Không cay / Ít dầu mỡ">Không cay / Ít dầu mỡ</option>
          </select>
        </label>

        <label className="wide">
          Hỗ trợ tiếp cận
          <input
            placeholder="VD: Một người sử dụng xe lăn; ưu tiên lối vào không bậc"
            value={accessibility}
            onChange={(e) => onChangeAccessibility?.(e.target.value)}
          />
        </label>
      </div>
    </section>
  );
}
