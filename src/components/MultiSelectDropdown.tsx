'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface MultiSelectDropdownProps<T> {
  options: { value: T; label: string }[];
  selectedValues: T[];
  onChange: (selectedValues: T[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  getValueKey?: (value: T) => string | number;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export default function MultiSelectDropdown<T>({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options',
  label,
  error,
  disabled = false,
  getValueKey = (value) => String(value),
  searchable = false,
  searchPlaceholder = 'Search...',
}: MultiSelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOption = (value: T) => {
    const valueKey = getValueKey(value);
    const isSelected = selectedValues.some(v => getValueKey(v) === valueKey);
    
    if (isSelected) {
      onChange(selectedValues.filter(v => getValueKey(v) !== valueKey));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const removeOption = (value: T, e: React.MouseEvent) => {
    e.stopPropagation();
    const valueKey = getValueKey(value);
    onChange(selectedValues.filter(v => getValueKey(v) !== valueKey));
  };

  const getSelectedLabels = () => {
    return selectedValues
      .map(val => {
        const option = options.find(opt => getValueKey(opt.value) === getValueKey(val));
        return option ? { label: option.label, value: val } : null;
      })
      .filter((item): item is { label: string; value: T } => item !== null);
  };

  const selectedLabels = getSelectedLabels();

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) {
      return options;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(lowerSearchTerm)
    );
  }, [options, searchTerm, searchable]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div
        className={`relative w-full p-2 border rounded-lg cursor-pointer bg-white ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between min-h-[38px]">
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedLabels.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              selectedLabels.map((item) => {
                return (
                  <span
                    key={getValueKey(item.value)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                  >
                    {item.label}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => removeOption(item.value, e)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                );
              })
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 flex flex-col">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
          <div className="overflow-auto flex-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                {searchTerm ? 'No options match your search' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const valueKey = getValueKey(option.value);
                const isSelected = selectedValues.some(v => getValueKey(v) === valueKey);
                
                return (
                  <label
                    key={valueKey}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOption(option.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

