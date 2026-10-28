import { useRef } from 'react';
import { ClearIcon, SearchIcon } from '../ui/Icons';
import './SearchField.css';

interface SearchFieldProps {
  value: string;
  onChange(value: string): void;
  // Doubles as the accessible name, e.g. "Search 310 figures".
  placeholder: string;
}

export default function SearchField({ value, onChange, placeholder }: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div role="search" className="sf">
      <SearchIcon className="sf-icon" />
      <input
        ref={inputRef}
        className="sf-input"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value.length > 0 && (
        <button
          type="button"
          className="sf-clear"
          aria-label="Clear search"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
        >
          <span className="sf-clear-disc">
            <ClearIcon />
          </span>
        </button>
      )}
    </div>
  );
}
