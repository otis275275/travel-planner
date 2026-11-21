import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { Badge } from './Badge';
import { useLazySearchPlacesAutocompleteQuery } from '../../services/destinationsApi';
import type { AutocompleteItem } from '../../types/destination.types';

export interface DestinationAutocompleteProps {
  value?: string;
  placeholder?: string;
  selectedItem?: AutocompleteItem | null;
  onSelect?: (item: AutocompleteItem) => void;
  onClear?: () => void;
  onChangeText?: (text: string) => void;
  variant?: 'hero' | 'form';
  showSelectedBadge?: boolean;
  className?: string;
}

export function DestinationAutocomplete({
  value: controlledValue,
  placeholder = 'Tìm tỉnh thành, thị trấn, danh thắng (vd: Sa Pa, Đà Nẵng, Ninh Bình...)',
  selectedItem,
  onSelect,
  onClear,
  onChangeText,
  variant = 'form',
  showSelectedBadge = true,
  className = '',
}: DestinationAutocompleteProps) {
  const [internalQuery, setInternalQuery] = useState(controlledValue || '');
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const [triggerAutocomplete] = useLazySearchPlacesAutocompleteQuery();

  const currentQuery = controlledValue !== undefined ? controlledValue : internalQuery;

  // Debounced Photon Autocomplete query
  useEffect(() => {
    if (
      currentQuery.trim().length < 2 ||
      (selectedItem && selectedItem.displayName === currentQuery.trim())
    ) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await triggerAutocomplete(currentQuery.trim()).unwrap();
        if (res.data) {
          setSuggestions(res.data);
          setShowDropdown(res.data.length > 0);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error('Autocomplete query error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [currentQuery, selectedItem, triggerAutocomplete]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (text: string) => {
    if (controlledValue === undefined) {
      setInternalQuery(text);
    }
    onChangeText?.(text);
    setSelectedIndex(-1);
  };

  const handleSelect = (item: AutocompleteItem) => {
    if (controlledValue === undefined) {
      setInternalQuery(item.displayName);
    }
    setShowDropdown(false);
    onSelect?.(item);
  };

  const handleClear = () => {
    if (controlledValue === undefined) {
      setInternalQuery('');
    }
    setSuggestions([]);
    setShowDropdown(false);
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter' && currentQuery.trim().length >= 2) {
        // Create an ad-hoc fallback autocomplete item if pressed enter directly
        const slug = currentQuery
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s-]/g, '')
          .replace(/\s+/g, '-');
        handleSelect({
          placeId: slug,
          displayName: currentQuery.trim(),
        });
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Render for 'hero' variant (used on ExplorePage)
  if (variant === 'hero') {
    return (
      <div className={`explore-search-container ${className}`} ref={containerRef} style={{ position: 'relative' }}>
        <div className="explore-search-bar">
          <span className="explore-search-icon">
            <Icon name="search" size={20} />
          </span>
          <input
            type="text"
            className="explore-search-input"
            placeholder={placeholder}
            value={currentQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
          />
          {isSearching && <span className="explore-search-spinner" />}
          {currentQuery && !isSearching && (
            <button
              className="explore-search-clear"
              onClick={handleClear}
              aria-label="Xóa tìm kiếm"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {/* Floating Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <ul className="explore-autocomplete-dropdown">
            {suggestions.map((item, idx) => (
              <li
                key={item.placeId + idx}
                className={`explore-autocomplete-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <span className="explore-item-icon">📍</span>
                <div className="explore-item-details">
                  <span className="explore-item-name">{item.displayName}</span>
                  {item.region && (
                    <span className="explore-item-region">{item.region}</span>
                  )}
                </div>
                <Icon name="chevron" size={14} className="explore-item-arrow" />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Render for 'form' variant (used on CreateTripPage / form modals)
  return (
    <div
      ref={containerRef}
      className={`destination-autocomplete-form ${className}`}
      style={{ position: 'relative', width: '100%' }}
    >
      <div className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
        <Icon name="search" />
        <input
          placeholder={placeholder}
          value={currentQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          style={{ width: '100%' }}
        />
        {isSearching && <span className="spinner-sm" style={{ marginRight: '8px' }} />}
        {selectedItem && showSelectedBadge ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Badge tone="success">Đã chọn</Badge>
            <button
              type="button"
              onClick={handleClear}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--muted)',
                padding: '2px 6px',
              }}
              aria-label="Xóa điểm đến"
            >
              ✕
            </button>
          </div>
        ) : currentQuery.trim() ? (
          <button
            type="button"
            onClick={handleClear}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'var(--muted)',
              padding: '2px 6px',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul className="explore-autocomplete-dropdown">
          {suggestions.map((item, idx) => (
            <li
              key={item.placeId + idx}
              className={`explore-autocomplete-item ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <span className="explore-item-icon">📍</span>
              <div className="explore-item-details">
                <span className="explore-item-name">{item.displayName}</span>
                {item.region && (
                  <span className="explore-item-region">{item.region}</span>
                )}
              </div>
              <Icon name="chevron" size={14} className="explore-item-arrow" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
