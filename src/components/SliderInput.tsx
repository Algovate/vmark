import React from 'react';

interface SliderInputProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  disabled = false,
  onChange,
  formatValue,
}) => {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        htmlFor={id}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <span>{label}</span>
        <span
          style={{
            color: 'var(--accent-primary)',
            fontWeight: '600',
            fontSize: '0.875rem',
          }}
        >
          {displayValue}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      />
    </div>
  );
};

