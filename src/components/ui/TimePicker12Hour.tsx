import React from 'react';

interface TimePicker12HourProps {
  value: string; // "hh:mm a" e.g. "09:30 AM"
  onChange: (newValue: string) => void;
  label?: string;
  disabled?: boolean;
}

export const TimePicker12Hour: React.FC<TimePicker12HourProps> = ({
  value,
  onChange,
  label,
  disabled = false,
}) => {
  let hours = '09';
  let minutes = '00';
  let period: 'AM' | 'PM' = 'AM';

  try {
    const parts = value.trim().split(' ');
    if (parts.length === 2) {
      const [time, p] = parts;
      const [h, m] = time.split(':');
      if (h) hours = h.padStart(2, '0');
      if (m) minutes = m.padStart(2, '0');
      if (p.toUpperCase() === 'AM' || p.toUpperCase() === 'PM') {
        period = p.toUpperCase() as 'AM' | 'PM';
      }
    }
  } catch {
    // fallback
  }

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${e.target.value}:${minutes} ${period}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${hours}:${e.target.value} ${period}`);
  };

  const togglePeriod = (newPeriod: 'AM' | 'PM') => {
    onChange(`${hours}:${minutes} ${newPeriod}`);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#222E46] rounded-xl p-1.5 focus-within:border-blue-500 transition-colors">
        {/* Hours */}
        <select
          value={hours}
          onChange={handleHourChange}
          disabled={disabled}
          className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer py-1 px-1 rounded hover:bg-slate-200 dark:hover:bg-[#222E46]"
        >
          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
            <option key={h} value={h} className="bg-white dark:bg-[#121826] text-slate-900 dark:text-white">
              {h}
            </option>
          ))}
        </select>

        <span className="text-slate-400 font-bold">:</span>

        {/* Minutes */}
        <select
          value={minutes}
          onChange={handleMinuteChange}
          disabled={disabled}
          className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer py-1 px-1 rounded hover:bg-slate-200 dark:hover:bg-[#222E46]"
        >
          {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
            <option key={m} value={m} className="bg-white dark:bg-[#121826] text-slate-900 dark:text-white">
              {m}
            </option>
          ))}
        </select>

        {/* AM/PM Toggle */}
        <div className="flex items-center ml-auto bg-white dark:bg-[#121826] p-0.5 rounded-lg border border-slate-200 dark:border-[#222E46]">
          <button
            type="button"
            disabled={disabled}
            onClick={() => togglePeriod('AM')}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
              period === 'AM'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            AM
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => togglePeriod('PM')}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
              period === 'PM'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
};
