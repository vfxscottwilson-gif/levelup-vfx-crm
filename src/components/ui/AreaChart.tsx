import React, { useState } from 'react';

interface DataPoint {
  day: string;
  hours: number;
  tasks: number;
}

interface AreaChartProps {
  data?: DataPoint[];
  height?: number;
}

const DEFAULT_DATA: DataPoint[] = [
  { day: 'Mon', hours: 7.5, tasks: 4 },
  { day: 'Tue', hours: 8.2, tasks: 6 },
  { day: 'Wed', hours: 6.8, tasks: 3 },
  { day: 'Thu', hours: 8.5, tasks: 7 },
  { day: 'Fri', hours: 7.9, tasks: 5 },
  { day: 'Sat', hours: 4.0, tasks: 2 },
  { day: 'Sun', hours: 0.0, tasks: 0 },
];

export const AreaChart: React.FC<AreaChartProps> = ({ data = DEFAULT_DATA, height = 240 }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const maxHours = Math.max(...data.map(d => d.hours), 10);
  const maxTasks = Math.max(...data.map(d => d.tasks), 10);

  const chartWidth = 600;
  const chartHeight = height;
  const padding = { top: 20, right: 20, bottom: 30, left: 30 };

  const usableWidth = chartWidth - padding.left - padding.right;
  const usableHeight = chartHeight - padding.top - padding.bottom;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * usableWidth;
  const getYHours = (val: number) => padding.top + usableHeight - (val / maxHours) * usableHeight;
  const getYTasks = (val: number) => padding.top + usableHeight - (val / maxTasks) * usableHeight;

  // Build SVG path strings
  const hoursPoints = data.map((d, i) => `${getX(i)},${getYHours(d.hours)}`);
  const tasksPoints = data.map((d, i) => `${getX(i)},${getYTasks(d.tasks)}`);

  const hoursLinePath = `M ${hoursPoints.join(' L ')}`;
  const hoursAreaPath = `${hoursLinePath} L ${getX(data.length - 1)},${chartHeight - padding.bottom} L ${padding.left},${chartHeight - padding.bottom} Z`;

  const tasksLinePath = `M ${tasksPoints.join(' L ')}`;
  const tasksAreaPath = `${tasksLinePath} L ${getX(data.length - 1)},${chartHeight - padding.bottom} L ${padding.left},${chartHeight - padding.bottom} Z`;

  return (
    <div className="relative w-full">
      {/* Legend */}
      <div className="flex items-center gap-6 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
          <span className="text-xs text-[#8B94A9]">Hours Logged</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#38BDF8]" />
          <span className="text-xs text-[#8B94A9]">Tasks Completed</span>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="tasksGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding.top + usableHeight * ratio;
            return (
              <line
                key={idx}
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#242A38"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Fills */}
          <path d={hoursAreaPath} fill="url(#hoursGrad)" />
          <path d={tasksAreaPath} fill="url(#tasksGrad)" />

          {/* Lines */}
          <path
            d={hoursLinePath}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={tasksLinePath}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Dots & Interactive Touch targets */}
          {data.map((d, i) => {
            const x = getX(i);
            const yH = getYHours(d.hours);
            const yT = getYTasks(d.tasks);
            const isHovered = hoverIndex === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={chartHeight - padding.bottom}
                    stroke="#8B94A9"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point dots */}
                <circle
                  cx={x}
                  cy={yH}
                  r={isHovered ? 5 : 3.5}
                  fill="#14171F"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                />
                <circle
                  cx={x}
                  cy={yT}
                  r={isHovered ? 5 : 3.5}
                  fill="#14171F"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                />

                {/* X-axis labels */}
                <text
                  x={x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className={`text-[11px] font-medium fill-current transition-colors ${
                    isHovered ? 'text-[#EAEEF7] font-semibold' : 'text-[#8B94A9]'
                  }`}
                >
                  {d.day}
                </text>

                {/* Invisible hover slice */}
                <rect
                  x={x - usableWidth / (data.length * 2)}
                  y={padding.top}
                  width={usableWidth / data.length}
                  height={usableHeight}
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoverIndex !== null && (
          <div
            className="absolute -top-3 bg-[#1A1E28] border border-[#242A38] rounded-xl px-3 py-2 shadow-xl pointer-events-none transform -translate-x-1/2 z-20"
            style={{
              left: `${(getX(hoverIndex) / chartWidth) * 100}%`,
            }}
          >
            <p className="text-xs font-semibold text-[#EAEEF7] mb-1">{data[hoverIndex].day}</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#3B82F6] font-medium">
                {data[hoverIndex].hours} hrs
              </span>
              <span className="text-[#38BDF8] font-medium">
                {data[hoverIndex].tasks} tasks
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
