import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Destination } from '../../types/destination.types';
import { Icon } from '../../components/common/Icon';
import { Badge } from '../../components/common/Badge';

interface DestinationCardProps {
  destination: Destination;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination }) => {
  const navigate = useNavigate();

  const photoUrl =
    destination.photoUrls && destination.photoUrls.length > 0
      ? destination.photoUrls[0]
      : 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800';

  const handleClick = () => {
    navigate(`/destinations/${destination.placeId}?name=${encodeURIComponent(destination.name)}`);
  };

  return (
    <div
      className="dest-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="dest-card-photo-wrap">
        <img
          src={photoUrl}
          alt={destination.name}
          className="dest-card-photo"
          loading="lazy"
        />
        <div className="dest-card-overlay" />
        {destination.bestTimeToVisit && (
          <div className="dest-card-time-badge">
            <Icon name="calendar" size={13} />
            <span>{destination.bestTimeToVisit}</span>
          </div>
        )}
      </div>

      <div className="dest-card-body">
        <div className="dest-card-header">
          <h3 className="dest-card-title">{destination.name}</h3>
          {(destination.state || destination.country) && (
            <span className="dest-card-location">
              📍 {destination.state ? (destination.state !== destination.name ? destination.state : destination.country) : destination.country}
            </span>
          )}
        </div>

        {destination.summary && (
          <p className="dest-card-summary">{destination.summary}</p>
        )}

        {destination.themeTags && destination.themeTags.length > 0 && (
          <div className="dest-card-tags">
            {destination.themeTags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="dest-tag-chip">
                {tag}
              </span>
            ))}
          </div>
        )}

        {destination.estimatedBudget && (
          <div className="dest-card-footer">
            <span className="dest-card-budget-label">Chi phí tham khảo</span>
            <span className="dest-card-budget-value">{destination.estimatedBudget}</span>
          </div>
        )}
      </div>
    </div>
  );
};
