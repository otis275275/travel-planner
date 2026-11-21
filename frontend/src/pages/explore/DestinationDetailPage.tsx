import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useGetDestinationQuery, useCreateDraftTripMutation } from '../../services/destinationsApi';
import { Icon } from '../../components/common/Icon';
import { Skeleton } from '../../components/common/Skeleton';

export const DestinationDetailPage: React.FC = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const nameParam = searchParams.get('name') || undefined;

  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  const { data: response, isLoading, isError, error } = useGetDestinationQuery(
    { placeId: placeId || '', name: nameParam },
    { skip: !placeId }
  );

  const [createDraftTrip, { isLoading: isCreatingTrip }] = useCreateDraftTripMutation();

  const destination = response?.data;

  const handleCreateTrip = async () => {
    if (!destination) return;
    try {
      const res = await createDraftTrip({
        placeId: destination.placeId,
        destinationName: destination.name,
      }).unwrap();

      if (res.data?.tripId) {
        navigate(`/trips/${res.data.tripId}`);
      }
    } catch (err: any) {
      console.error('Failed to create trip:', err);
      // If unauthorized, redirect to login
      if (err?.status === 401) {
        navigate('/login');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="dest-detail-page">
        <div className="dest-detail-container">
          <div className="dest-detail-back">
            <Skeleton width={120} height={36} borderRadius={8} />
          </div>

          <div className="dest-detail-carousel-skeleton">
            <Skeleton height={420} borderRadius={20} />
          </div>

          <div className="dest-detail-layout">
            <div className="dest-detail-main">
              <Skeleton height={36} width="60%" borderRadius={8} />
              <Skeleton height={80} borderRadius={12} style={{ marginTop: 16 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
                <Skeleton height={140} borderRadius={12} />
                <Skeleton height={140} borderRadius={12} />
              </div>
            </div>
            <div className="dest-detail-sidebar">
              <Skeleton height={240} borderRadius={16} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !destination) {
    return (
      <div className="dest-detail-page">
        <div className="dest-detail-container">
          <div className="dest-detail-empty">
            <div className="dest-detail-empty-icon">📍</div>
            <h2>Không tìm thấy thông tin điểm đến</h2>
            <p>Điểm đến này chưa có dữ liệu hoặc có lỗi xảy ra khi tạo dữ liệu tự động.</p>
            <button className="btn btn-primary" onClick={() => navigate('/explore')} style={{ marginTop: 16 }}>
              <Icon name="chevron" size={16} />
              <span>Quay lại trang Khám phá</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const photos = destination.photoUrls && destination.photoUrls.length > 0
    ? destination.photoUrls
    : ['https://images.unsplash.com/photo-1528127269322-539801943592?w=1200'];

  const prevPhoto = () => {
    setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const nextPhoto = () => {
    setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="dest-detail-page">
      <div className="dest-detail-container">
        {/* Navigation Breadcrumb */}
        <div className="dest-detail-topbar">
          <button className="dest-back-btn" onClick={() => navigate('/explore')}>
            <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
              <Icon name="chevron" size={16} />
            </span>
            <span>Khám phá</span>
          </button>
          <span className="dest-crumb-divider">/</span>
          <span className="dest-crumb-current">{destination.name}</span>
        </div>

        {/* Hero Photo Carousel */}
        <div className="dest-carousel-wrapper">
          <div className="dest-carousel-main">
            <img
              src={photos[activePhotoIndex]}
              alt={`${destination.name} - Ảnh ${activePhotoIndex + 1}`}
              className="dest-carousel-img"
            />
            <div className="dest-carousel-gradient" />

            {photos.length > 1 && (
              <>
                <button
                  className="dest-carousel-arrow prev"
                  onClick={prevPhoto}
                  aria-label="Ảnh trước"
                >
                  <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
                    <Icon name="chevron" size={20} />
                  </span>
                </button>
                <button
                  className="dest-carousel-arrow next"
                  onClick={nextPhoto}
                  aria-label="Ảnh tiếp theo"
                >
                  <Icon name="chevron" size={20} />
                </button>
                <div className="dest-carousel-counter">
                  {activePhotoIndex + 1} / {photos.length}
                </div>
              </>
            )}

            <div className="dest-carousel-title-overlay">
              <h1 className="dest-carousel-title">{destination.name}</h1>
              <div className="dest-carousel-meta-row">
                {(destination.state || destination.country) && (
                  <div className="dest-carousel-location-tag">
                    <Icon name="compass" size={14} />
                    <span>
                      {destination.state
                        ? (destination.state !== destination.name
                            ? `${destination.state}, ${destination.country || 'Việt Nam'}`
                            : destination.country || 'Việt Nam')
                        : destination.country || 'Việt Nam'}
                    </span>
                  </div>
                )}
                {destination.bestTimeToVisit && (
                  <div className="dest-carousel-time-tag">
                    <Icon name="calendar" size={14} />
                    <span>Thời điểm lý tưởng: {destination.bestTimeToVisit}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Carousel thumbnails */}
          {photos.length > 1 && (
            <div className="dest-thumbnails-strip">
              {photos.map((url, idx) => (
                <button
                  key={idx}
                  className={`dest-thumbnail-item ${idx === activePhotoIndex ? 'active' : ''}`}
                  onClick={() => setActivePhotoIndex(idx)}
                >
                  <img src={url} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Layout */}
        <div className="dest-detail-layout">
          {/* Main Info Column */}
          <div className="dest-detail-main">
            {/* AI Summary Section */}
            {destination.summary && (
              <div className="dest-card-box dest-summary-box">
                <div className="dest-box-header">
                  <div className="dest-ai-badge">
                    <Icon name="spark" size={16} />
                    <span>Tóm tắt thông minh từ AI</span>
                  </div>
                </div>
                <p className="dest-summary-text">{destination.summary}</p>
              </div>
            )}

            {/* Pros & Cons */}
            {((destination.pros && destination.pros.length > 0) ||
              (destination.cons && destination.cons.length > 0)) && (
              <div className="dest-card-box">
                <h3 className="dest-section-title">Đánh giá nhanh</h3>
                <div className="dest-pros-cons-grid">
                  {destination.pros && destination.pros.length > 0 && (
                    <div className="dest-pro-column">
                      <div className="dest-pro-header">
                        <span className="dest-pro-icon">✓</span>
                        <h4>Ưu điểm nổi bật</h4>
                      </div>
                      <ul className="dest-pro-list">
                        {destination.pros.map((pro, i) => (
                          <li key={i}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {destination.cons && destination.cons.length > 0 && (
                    <div className="dest-con-column">
                      <div className="dest-con-header">
                        <span className="dest-con-icon">!</span>
                        <h4>Lưu ý / Nhược điểm</h4>
                      </div>
                      <ul className="dest-con-list">
                        {destination.cons.map((con, i) => (
                          <li key={i}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specialty Dishes */}
            {destination.specialtyDishes && destination.specialtyDishes.length > 0 && (
              <div className="dest-card-box">
                <h3 className="dest-section-title">Ẩm thực & Đặc sản nức tiếng</h3>
                <div className="dest-dishes-grid">
                  {destination.specialtyDishes.map((dish, idx) => (
                    <div key={idx} className="dest-dish-card">
                      <span className="dest-dish-icon">🍲</span>
                      <span className="dest-dish-name">{dish}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info & Action Column */}
          <div className="dest-detail-sidebar">
            <div className="dest-sidebar-card">
              <h3 className="dest-sidebar-title">Lên kế hoạch du lịch</h3>
              <p className="dest-sidebar-desc">
                Tạo lịch trình mẫu cho chuyến đi đến <strong>{destination.name}</strong> với sự hỗ trợ của AI.
              </p>

              {(destination.state || destination.country) && (
                <div className="dest-sidebar-info-row">
                  <div className="dest-sidebar-info-icon">
                    <Icon name="compass" size={18} />
                  </div>
                  <div>
                    <span className="dest-sidebar-info-label">Khu vực / Tỉnh thành</span>
                    <span className="dest-sidebar-info-val">
                      {destination.state ? `${destination.state}, ${destination.country || 'Việt Nam'}` : destination.country || 'Việt Nam'}
                    </span>
                  </div>
                </div>
              )}

              {destination.estimatedBudget && (
                <div className="dest-sidebar-info-row">
                  <div className="dest-sidebar-info-icon">
                    <Icon name="wallet" size={18} />
                  </div>
                  <div>
                    <span className="dest-sidebar-info-label">Ngân sách ước tính</span>
                    <span className="dest-sidebar-info-val">{destination.estimatedBudget}</span>
                  </div>
                </div>
              )}

              {destination.bestTimeToVisit && (
                <div className="dest-sidebar-info-row">
                  <div className="dest-sidebar-info-icon">
                    <Icon name="calendar" size={18} />
                  </div>
                  <div>
                    <span className="dest-sidebar-info-label">Mùa du lịch đẹp nhất</span>
                    <span className="dest-sidebar-info-val">{destination.bestTimeToVisit}</span>
                  </div>
                </div>
              )}

              {destination.latitude && destination.longitude && (
                <div className="dest-sidebar-info-row">
                  <div className="dest-sidebar-info-icon">
                    <Icon name="map" size={18} />
                  </div>
                  <div>
                    <span className="dest-sidebar-info-label">Tọa độ địa lý</span>
                    <span className="dest-sidebar-info-val">
                      {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary dest-cta-btn"
                onClick={handleCreateTrip}
                disabled={isCreatingTrip}
              >
                {isCreatingTrip ? (
                  <>
                    <span className="spinner-sm" />
                    <span>Đang tạo chuyến đi...</span>
                  </>
                ) : (
                  <>
                    <Icon name="plus" size={18} />
                    <span>Lên lịch trình tới đây</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
