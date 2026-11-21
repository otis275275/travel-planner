import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { Skeleton } from '../../components/common/Skeleton';
import { DestinationCard } from './DestinationCard';
import { WizardModal } from './WizardModal';
import { DestinationAutocomplete } from '../../components/common/DestinationAutocomplete';
import { useGetTopDestinationsQuery } from '../../services/destinationsApi';
import type { AutocompleteItem } from '../../types/destination.types';

const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Thiên nhiên', label: '🌲 Thiên nhiên' },
  { id: 'Biển', label: '🏖️ Biển đảo' },
  { id: 'Lịch sử', label: '🏛️ Lịch sử & Văn hóa' },
  { id: 'Ẩm thực', label: '🍲 Ẩm thực' },
  { id: 'Chụp ảnh', label: '📸 Check-in sống ảo' },
];

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();

  // Filter & Wizard state
  const [activeCategory, setActiveCategory] = useState('all');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Queries
  const { data: topResponse, isLoading: isLoadingTop } = useGetTopDestinationsQuery();
  const destinations = topResponse?.data || [];

  // Filter destinations client-side
  const filteredDestinations = destinations.filter((dest) => {
    if (activeCategory === 'all') return true;
    return dest.themeTags?.some((tag) => tag.toLowerCase().includes(activeCategory.toLowerCase()));
  });

  const handleSelectDestination = (item: AutocompleteItem) => {
    navigate(`/destinations/${item.placeId}?name=${encodeURIComponent(item.displayName)}`);
  };

  return (
    <div className="explore-page">
      {/* Page Header */}
      <PageHeader
        eyebrow="Khám phá / Điểm đến"
        title="Khám phá điểm đến tuyệt vời"
        description="Tìm kiếm địa điểm du lịch yêu thích, xem tóm tắt thông minh từ AI hoặc nhận gợi ý lịch trình theo sở thích của bạn."
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button
            variant="primary"
            icon="spark"
            onClick={() => setIsWizardOpen(true)}
            className="explore-wizard-cta-btn"
          >
            Gợi ý điểm đến ✨
          </Button>
        </div>
      </PageHeader>

      {/* Universal Search Hero Section */}
      <div className="explore-search-hero">
        <DestinationAutocomplete
          variant="hero"
          placeholder="Tìm kiếm bất kỳ tỉnh thành, thị trấn, danh thắng (vd: Sa Pa, Đà Nẵng, Ninh Bình...)"
          onSelect={handleSelectDestination}
        />
      </div>

      {/* AI Wizard Highlight Card */}
      <div className="explore-banner-card" onClick={() => setIsWizardOpen(true)}>
        <div className="explore-banner-left">
          <div className="explore-banner-badge">
            <Icon name="spark" size={14} />
            <span>AI Travel Assistant</span>
          </div>
          <h3 className="explore-banner-title">Chưa biết nên đi đâu vào kỳ nghỉ tới?</h3>
          <p className="explore-banner-subtitle">
            Chọn vùng miền, phong cách du lịch và thời điểm — AI sẽ tự động phân tích và gợi ý 3 điểm đến hoàn hảo nhất kèm lịch trình chi tiết.
          </p>
          <div className="explore-banner-tags">
            <span className="explore-mini-tag">⚡ Phản hồi sau vài giây</span>
            <span className="explore-mini-tag">🎯 Cá nhân hóa 100%</span>
            <span className="explore-mini-tag">📸 Ảnh & Thông tin thực tế</span>
          </div>
        </div>
        <div className="explore-banner-right">
          <button className="btn btn-primary explore-banner-btn">
            <span>Bắt đầu gợi ý</span>
            <Icon name="chevron" size={16} />
          </button>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="explore-category-strip">
        <div className="explore-category-list">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`explore-category-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Grid Section */}
      <div className="explore-content-section">
        <div className="explore-section-header">
          <div>
            <h2 className="explore-section-title">Điểm đến nổi bật</h2>
            <p className="explore-section-subtitle">
              {activeCategory === 'all'
                ? 'Các địa danh được yêu thích và lên kế hoạch nhiều nhất'
                : `Các điểm đến thuộc chủ đề "${CATEGORIES.find((c) => c.id === activeCategory)?.label || activeCategory}"`}
            </p>
          </div>
          <span className="explore-count-badge">
            {isLoadingTop ? '...' : `${filteredDestinations.length} địa điểm`}
          </span>
        </div>

        {/* Loading Skeleton */}
        {isLoadingTop && (
          <div className="dest-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="dest-card-skeleton">
                <Skeleton height={200} borderRadius={16} />
                <div style={{ padding: '16px' }}>
                  <Skeleton height={20} width="70%" borderRadius={6} />
                  <Skeleton height={14} width="40%" borderRadius={4} style={{ marginTop: 8 }} />
                  <Skeleton height={40} borderRadius={8} style={{ marginTop: 12 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoadingTop && filteredDestinations.length === 0 && (
          <div className="explore-empty-state">
            <div className="explore-empty-icon">🏖️</div>
            <h3>Chưa tìm thấy địa điểm phù hợp</h3>
            <p>Hãy thử chọn chủ đề khác hoặc tìm kiếm với thanh tìm kiếm ở trên.</p>
            <button
              className="btn btn-secondary"
              onClick={() => setActiveCategory('all')}
              style={{ marginTop: 12 }}
            >
              Xem tất cả điểm đến
            </button>
          </div>
        )}

        {/* Destination Cards Grid */}
        {!isLoadingTop && filteredDestinations.length > 0 && (
          <div className="dest-grid">
            {filteredDestinations.map((dest) => (
              <DestinationCard key={dest.id || dest.placeId} destination={dest} />
            ))}
          </div>
        )}
      </div>

      {/* AI Wizard Modal */}
      <WizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
};
