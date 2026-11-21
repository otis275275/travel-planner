import React from 'react';
import { DestinationAutocomplete } from '../common/DestinationAutocomplete';
import type { AutocompleteItem } from '../../types/destination.types';
import type { TripStatus } from '../../types/trip.types';

export interface TripBasicInfoSectionProps {
  title: string;
  onChangeTitle: (val: string) => void;
  destinationInput: string;
  onChangeDestinationInput: (val: string) => void;
  selectedDestination: AutocompleteItem | null;
  onSelectDestination: (item: AutocompleteItem) => void;
  onClearDestination: () => void;
  startDate: string;
  onChangeStartDate: (val: string) => void;
  endDate: string;
  onChangeEndDate: (val: string) => void;
  people: string;
  onChangePeople: (val: string) => void;
  budget: string;
  onChangeBudget: (val: string) => void;
  status?: TripStatus;
  onChangeStatus?: (status: TripStatus) => void;
  showStatusSelect?: boolean;
  sectionNumber?: string | number;
}

export function TripBasicInfoSection({
  title,
  onChangeTitle,
  destinationInput,
  onChangeDestinationInput,
  selectedDestination,
  onSelectDestination,
  onClearDestination,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  people,
  onChangePeople,
  budget,
  onChangeBudget,
  status = 'PLANNED',
  onChangeStatus,
  showStatusSelect = false,
  sectionNumber = 1,
}: TripBasicInfoSectionProps) {
  return (
    <section>
      <div className="form-section-title">
        <b>{sectionNumber}</b>
        <div>
          <h2>Thông tin chuyến đi</h2>
          <p>Đặt nền móng cho hành trình của bạn.</p>
        </div>
      </div>

      <div className="field-grid">
        <label className="wide">
          Tên chuyến đi *
          <input
            placeholder="VD: Đà Nẵng cùng gia đình"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            required
          />
        </label>

        {/* Reusable Destination Autocomplete */}
        <label className="wide">
          Điểm đến *
          <DestinationAutocomplete
            variant="form"
            placeholder="Tìm tỉnh thành, thị trấn, danh thắng (VD: Đà Nẵng, Sa Pa, Hội An...)"
            value={destinationInput}
            selectedItem={selectedDestination}
            onChangeText={(text) => {
              onChangeDestinationInput(text);
              if (selectedDestination && selectedDestination.displayName !== text) {
                onClearDestination();
              }
            }}
            onSelect={onSelectDestination}
            onClear={onClearDestination}
          />
        </label>

        <label>
          Ngày khởi hành
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChangeStartDate(e.target.value)}
          />
        </label>

        <label>
          Ngày trở về
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChangeEndDate(e.target.value)}
          />
        </label>

        <label>
          Số người đi
          <select
            value={people}
            onChange={(e) => onChangePeople(e.target.value)}
          >
            <option value="1">1 người (Đi một mình)</option>
            <option value="2">2 người (Cặp đôi/Bạn thân)</option>
            <option value="4">4 người (Nhóm bạn nhỏ)</option>
            <option value="6">6+ người (Gia đình/Đoàn đông)</option>
          </select>
        </label>

        <label>
          Ngân sách dự kiến
          <div className="input-suffix">
            <input
              placeholder="VD: 15000000"
              value={budget}
              onChange={(e) => onChangeBudget(e.target.value)}
            />
            <span>₫</span>
          </div>
        </label>

        {showStatusSelect && onChangeStatus && (
          <label className="wide">
            Trạng thái chuyến đi
            <select
              value={status}
              onChange={(e) => onChangeStatus(e.target.value as TripStatus)}
            >
              <option value="DRAFT">Bản nháp (DRAFT)</option>
              <option value="PLANNED">Sắp tới (PLANNED)</option>
              <option value="ONGOING">Đang đi (ONGOING)</option>
              <option value="COMPLETED">Đã qua (COMPLETED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            </select>
          </label>
        )}
      </div>
    </section>
  );
}
