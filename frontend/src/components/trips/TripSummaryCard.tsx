import React from 'react';
import { Icon } from '../common/Icon';
import type { AutocompleteItem } from '../../types/destination.types';

export interface TripSummaryCardProps {
  destination?: AutocompleteItem | null;
  destinationFallback?: string;
  startDate?: string;
  endDate?: string;
  people?: string;
  budget?: string;
}

export function TripSummaryCard({
  destination,
  destinationFallback,
  startDate,
  endDate,
  people = '2',
  budget,
}: TripSummaryCardProps) {
  const formatDateRange = () => {
    if (!startDate && !endDate) return 'Chưa chọn ngày';
    if (startDate && !endDate) return `Từ ${startDate}`;
    if (!startDate && endDate) return `Đến ${endDate}`;
    return `${startDate} → ${endDate}`;
  };

  const destinationDisplay =
    destination?.displayName || destinationFallback || 'Chưa chọn';

  const budgetDisplay = budget ? `${Number(budget.replace(/\D/g, '') || 0).toLocaleString('vi-VN')} ₫` : 'Chưa nhập';

  return (
    <aside className="summary-card">
      <h3>Tóm tắt lựa chọn</h3>
      <div className="summary-row">
        <Icon name="map" />
        <span>
          <small>Điểm đến</small>
          <strong>{destinationDisplay}</strong>
        </span>
      </div>
      <div className="summary-row">
        <Icon name="calendar" />
        <span>
          <small>Thời gian</small>
          <strong>{formatDateRange()}</strong>
        </span>
      </div>
      <div className="summary-row">
        <Icon name="users" />
        <span>
          <small>Nhóm</small>
          <strong>{people} người</strong>
        </span>
      </div>
      <div className="summary-row">
        <Icon name="wallet" />
        <span>
          <small>Ngân sách</small>
          <strong>{budgetDisplay}</strong>
        </span>
      </div>
      <hr />
      <div className="info-box">
        <Icon name="spark" />
        <span>
          <strong>Lập kế hoạch thông minh</strong>
          <small>
            Mọi thông tin bạn chọn đều có thể cập nhật sau trong trang lịch trình.
          </small>
        </span>
      </div>
    </aside>
  );
}
