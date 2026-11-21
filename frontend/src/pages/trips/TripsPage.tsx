import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { Skeleton } from '../../components/common/Skeleton';
import { TripCard } from './components/TripCard';
import { EditTripModal } from './components/EditTripModal';
import { DeleteTripModal } from './components/DeleteTripModal';
import { useAppSelector } from '../../store/hooks';
import { useGetUserTripsQuery } from '../../services/tripsApi';
import type { Trip } from '../../types/trip.types';

type TripTab = 'upcoming' | 'draft' | 'past';

function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TripsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TripTab>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);

  // Retrieve authenticated user from Redux store
  const user = useAppSelector((state) => state.auth.user);
  const userInitials = getInitials(user?.fullName);
  const authorTag = user?.fullName
    ? `${user.fullName.toUpperCase()} · CHỦ CHUYẾN ĐI`
    : 'BẠN · CHỦ CHUYẾN ĐI';

  // Fetch trips from backend
  const { data: response, isLoading, isError } = useGetUserTripsQuery();
  const allTrips: Trip[] = response?.data || [];

  // Categorize trips
  const upcomingTrips = allTrips.filter((t) => t.status === 'PLANNED' || t.status === 'ONGOING');
  const draftTrips = allTrips.filter((t) => t.status === 'DRAFT');
  const pastTrips = allTrips.filter((t) => t.status === 'COMPLETED' || t.status === 'CANCELLED');

  // Select list based on active tab
  const currentTabTrips = tab === 'upcoming' ? upcomingTrips : tab === 'draft' ? draftTrips : pastTrips;

  // Filter by search query
  const filteredTrips = currentTabTrips.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = t.title?.toLowerCase().includes(q);
    const destMatch = t.destination?.name?.toLowerCase().includes(q) || t.destination?.state?.toLowerCase().includes(q);
    return titleMatch || destMatch;
  });

  return (
    <div className="page">
      <PageHeader
        title={user?.fullName ? `Chuyến đi của ${user.fullName}` : 'Chuyến đi của tôi'}
        description={
          user?.email
            ? `Tài khoản: ${user.email} · Tất cả hành trình của bạn trên Triply.`
            : 'Tất cả hành trình, từ ý tưởng đầu tiên đến những kỷ niệm đã qua.'
        }
      >
        <Button icon="plus" onClick={() => navigate('/trips/create')}>
          Tạo chuyến đi
        </Button>
      </PageHeader>

      <div className="toolbar">
        <div className="tabs">
          <button
            className={tab === 'upcoming' ? 'active' : ''}
            onClick={() => setTab('upcoming')}
          >
            Sắp tới <b>{upcomingTrips.length}</b>
          </button>
          <button
            className={tab === 'draft' ? 'active' : ''}
            onClick={() => setTab('draft')}
          >
            Bản nháp <b>{draftTrips.length}</b>
          </button>
          <button
            className={tab === 'past' ? 'active' : ''}
            onClick={() => setTab('past')}
          >
            Đã qua <b>{pastTrips.length}</b>
          </button>
        </div>

        <div className="toolbar-right">
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Tìm chuyến đi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="trip-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="trip-card" style={{ padding: '0 0 16px 0' }}>
              <Skeleton height={175} />
              <div style={{ padding: '16px' }}>
                <Skeleton height={20} width="70%" borderRadius={6} />
                <Skeleton height={14} width="40%" borderRadius={4} style={{ marginTop: 10 }} />
                <Skeleton height={14} width="50%" borderRadius={4} style={{ marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trips Grid */}
      {!isLoading && filteredTrips.length > 0 && (
        <div className="trip-grid">
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              authorName={authorTag}
              userInitials={userInitials}
              userAvatarUrl={user?.avatarUrl}
              onView={() => navigate(`/trips/${trip.id}`)}
              onEdit={() => setEditingTrip(trip)}
              onDelete={() => setDeletingTrip(trip)}
            />
          ))}
        </div>
      )}

      {/* Empty State for current tab */}
      {!isLoading && filteredTrips.length === 0 && (
        <div className="empty-guidance">
          <span className="feature-icon">
            <Icon name="compass" />
          </span>
          <div>
            <strong>
              {tab === 'upcoming'
                ? 'Bạn chưa có chuyến đi sắp tới nào'
                : tab === 'draft'
                ? 'Không có bản nháp nào'
                : 'Chưa có chuyến đi nào đã qua'}
            </strong>
            <p>
              {searchQuery
                ? `Không tìm thấy chuyến đi nào với từ khóa "${searchQuery}".`
                : 'Bắt đầu lên kế hoạch cho một hành trình mới ngay hôm nay.'}
            </p>
          </div>
          <Button variant="primary" icon="plus" onClick={() => navigate('/trips/create')}>
            Tạo chuyến đi mới
          </Button>
        </div>
      )}

      {/* Section: Bản nháp cần tiếp tục (when on upcoming tab and drafts exist) */}
      {!isLoading && tab === 'upcoming' && draftTrips.length > 0 && (
        <>
          <div className="section-title">
            <div>
              <h2>Bản nháp cần tiếp tục</h2>
              <p>Các chuyến đi chưa hoàn tất lịch trình.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {draftTrips.map((draft) => (
              <div key={draft.id} className="draft-row">
                <span className="draft-icon">
                  <Icon name="map" />
                </span>
                <div>
                  <strong>{draft.title}</strong>
                  <small>
                    {draft.destination?.name ? `Điểm đến: ${draft.destination.name}` : 'Chưa có điểm đến'} ·{' '}
                    {draft.startDate ? `Khởi hành: ${draft.startDate}` : 'Chưa có ngày'}
                  </small>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/trips/${draft.id}`)}
                >
                  Tiếp tục
                </Button>
                <button
                  className="icon-btn"
                  onClick={() => setDeletingTrip(draft)}
                  aria-label="Xóa bản nháp"
                  title="Xóa bản nháp"
                >
                  <Icon name="more" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Trip Modal */}
      {editingTrip && (
        <EditTripModal
          trip={editingTrip}
          onClose={() => setEditingTrip(null)}
        />
      )}

      {/* Delete Trip Modal */}
      {deletingTrip && (
        <DeleteTripModal
          trip={deletingTrip}
          onClose={() => setDeletingTrip(null)}
        />
      )}
    </div>
  );
}
