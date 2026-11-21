import React from 'react';
import { Button } from '../../../components/common/Button';
import { useDeleteTripMutation } from '../../../services/tripsApi';
import type { Trip } from '../../../types/trip.types';

interface DeleteTripModalProps {
  trip: Trip;
  onClose: () => void;
}

export function DeleteTripModal({ trip, onClose }: DeleteTripModalProps) {
  const [deleteTrip, { isLoading }] = useDeleteTripMutation();

  const handleDelete = async () => {
    try {
      await deleteTrip(trip.id).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <span className="danger-icon">!</span>
        <h3>Xóa “{trip.title}”?</h3>
        <p>
          Chuyến đi và mọi dữ liệu liên quan sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.
        </p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Đang xóa...' : 'Xóa chuyến đi'}
          </Button>
        </div>
      </div>
    </div>
  );
}
