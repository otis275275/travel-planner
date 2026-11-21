import React, { useState } from 'react';
import { Button } from '../../../components/common/Button';
import {
  TripBasicInfoSection,
  TripPreferencesSection,
} from '../../../components/trips';
import { useUpdateTripMutation } from '../../../services/tripsApi';
import type { Trip, TripStatus } from '../../../types/trip.types';
import type { AutocompleteItem } from '../../../types/destination.types';

interface EditTripModalProps {
  trip: Trip;
  onClose: () => void;
}

export function EditTripModal({ trip, onClose }: EditTripModalProps) {
  // Basic info states
  const [title, setTitle] = useState(trip.title);
  const [destinationInput, setDestinationInput] = useState(trip.destination?.name || '');
  const [selectedDestination, setSelectedDestination] = useState<AutocompleteItem | null>(
    trip.destination
      ? {
          placeId: trip.destination.placeId,
          displayName: trip.destination.name,
          region: trip.destination.state || trip.destination.country || undefined,
        }
      : null
  );
  const [startDate, setStartDate] = useState(trip.startDate || '');
  const [endDate, setEndDate] = useState(trip.endDate || '');
  const [people, setPeople] = useState('2');
  const [budget, setBudget] = useState(trip.totalBudget ? String(trip.totalBudget) : '');
  const [status, setStatus] = useState<TripStatus>(trip.status);

  // Preferences states
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Ẩm thực',
    'Thiên nhiên',
  ]);
  const [transport, setTransport] = useState('Taxi, đi bộ ngắn');
  const [dietary, setDietary] = useState('Không yêu cầu đặc biệt');
  const [accessibility, setAccessibility] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [updateTrip, { isLoading }] = useUpdateTripMutation();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Tên chuyến đi không được để trống.');
      return;
    }

    const cleanBudget = budget ? Number(budget.replace(/\D/g, '')) : undefined;

    try {
      await updateTrip({
        tripId: trip.id,
        data: {
          title: title.trim(),
          placeId: selectedDestination?.placeId,
          destinationName: selectedDestination?.displayName || destinationInput.trim(),
          startDate: startDate || null,
          endDate: endDate || null,
          totalBudget: cleanBudget && !isNaN(cleanBudget) ? cleanBudget : null,
          status,
        },
      }).unwrap();

      onClose();
    } catch (err: any) {
      console.error('Failed to update trip:', err);
      setErrorMsg(err?.data?.message || 'Có lỗi xảy ra khi cập nhật chuyến đi.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{
          width: '680px',
          maxWidth: '95vw',
          textAlign: 'left',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '14px',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '20px' }}>Chỉnh sửa chuyến đi</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
              Cập nhật thông tin cơ bản hoặc sở thích cho hành trình.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '18px',
              color: 'var(--muted)',
            }}
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="form-card" style={{ border: 'none' }}>
          <TripBasicInfoSection
            title={title}
            onChangeTitle={setTitle}
            destinationInput={destinationInput}
            onChangeDestinationInput={setDestinationInput}
            selectedDestination={selectedDestination}
            onSelectDestination={(item) => {
              setSelectedDestination(item);
              setDestinationInput(item.displayName);
            }}
            onClearDestination={() => {
              setSelectedDestination(null);
              setDestinationInput('');
            }}
            startDate={startDate}
            onChangeStartDate={setStartDate}
            endDate={endDate}
            onChangeEndDate={setEndDate}
            people={people}
            onChangePeople={setPeople}
            budget={budget}
            onChangeBudget={setBudget}
            status={status}
            onChangeStatus={setStatus}
            showStatusSelect={true}
            sectionNumber={1}
          />

          <TripPreferencesSection
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            transport={transport}
            onChangeTransport={setTransport}
            dietary={dietary}
            onChangeDietary={setDietary}
            accessibility={accessibility}
            onChangeAccessibility={setAccessibility}
            sectionNumber={2}
          />

          <div
            className="modal-actions"
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--line)',
            }}
          >
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
