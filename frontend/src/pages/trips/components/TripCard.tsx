import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { Avatar } from '../../../components/common/Avatar';
import { images } from '../../../data/mockData';
import type { Trip } from '../../../types/trip.types';

interface TripCardProps {
  trip: Trip;
  userInitials?: string;
  userAvatarUrl?: string | null;
  authorName?: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TripCard({
  trip,
  userInitials = 'ME',
  userAvatarUrl,
  authorName = 'BẠN · CHỦ CHUYẾN ĐI',
  onView,
  onEdit,
  onDelete,
}: TripCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Image fallback
  const coverImage =
    trip.destination?.photoUrls && trip.destination.photoUrls.length > 0
      ? trip.destination.photoUrls[0]
      : images.sapa;

  // Format date range
  const formatDateRange = () => {
    if (!trip.startDate && !trip.endDate) return 'Chưa đặt ngày';
    if (trip.startDate && !trip.endDate) return `Khởi hành ${trip.startDate}`;
    if (!trip.startDate && trip.endDate) return `Đến ${trip.endDate}`;
    return `${trip.startDate} → ${trip.endDate}`;
  };

  // Format Budget
  const formatBudget = () => {
    if (!trip.totalBudget) return 'Chưa nhập';
    return Number(trip.totalBudget).toLocaleString('vi-VN') + ' ₫';
  };

  // Status Badge
  const getStatusBadge = () => {
    switch (trip.status) {
      case 'DRAFT':
        return <Badge tone="warning">Bản nháp</Badge>;
      case 'PLANNED':
        return <Badge tone="success">Sắp tới</Badge>;
      case 'ONGOING':
        return <Badge tone="teal">Đang đi</Badge>;
      case 'COMPLETED':
        return <Badge tone="neutral">Đã qua</Badge>;
      case 'CANCELLED':
        return <Badge tone="danger">Đã hủy</Badge>;
      default:
        return <Badge tone="neutral">{trip.status}</Badge>;
    }
  };

  const isDraft = trip.status === 'DRAFT';

  return (
    <article className="trip-card">
      <div className="trip-image" style={{ cursor: 'pointer' }} onClick={onView}>
        <img src={coverImage} alt={trip.title} />
        {getStatusBadge()}

        {/* More Actions Menu Button */}
        <div ref={menuRef} style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
          <button
            type="button"
            className="more-btn"
            aria-label="Tùy chọn"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
          >
            <Icon name="more" />
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                boxShadow: 'var(--shadow)',
                padding: '6px 0',
                minWidth: '150px',
                zIndex: 20,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 14px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal-soft)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span>✏️</span>
                <span>Chỉnh sửa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 14px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span>🗑️</span>
                <span>Xóa chuyến đi</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="trip-content">
        <small>{authorName}</small>
        <h3
          title={trip.title}
          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
          onClick={onView}
        >
          {trip.title}
        </h3>

        <p>
          <Icon name="calendar" /> {formatDateRange()}
        </p>
        <p>
          <Icon name="map" /> {trip.destination?.name || 'Chưa có điểm đến'} <span>•</span> Ngân sách {formatBudget()}
        </p>

        <div className="trip-footer">
          <div className="avatar-stack">
            <Avatar label={userInitials} src={userAvatarUrl} color="yellow" />
          </div>

          <Button variant="ghost" onClick={onView}>
            {isDraft ? 'Tiếp tục' : 'Xem chuyến đi'} <Icon name="chevron" />
          </Button>
        </div>
      </div>
    </article>
  );
}
