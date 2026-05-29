import React, { useState } from 'react';

const StudyChart = ({ data = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 glass-card p-6">
        No weekly study records compiled yet. Start a session to generate metrics!
      </div>
    );
  }

  // Find max value to scale the chart
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 10);
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = paddingX + (index * (chartWidth - paddingX * 2)) / (data.length - 1);
    // Invert Y axis as SVG 0 is top
    const y =
      chartHeight -
      paddingY -
      (d.minutes / maxMinutes) * (chartHeight - paddingY * 2);
    return { x, y, minutes: d.minutes, day: d.day };
  });

  // Create SVG path string for the line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Create SVG path string for the filled area underneath the line
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
      : '';

  return (
    <div className="glass-card p-6 flex flex-col gap-4 relative">
      <div>
        <h4 className="text-sm font-semibold text-slate-200">Study Session Trends</h4>
        <p className="text-xs text-slate-400">Total focus duration per day (past week in minutes)</p>
      </div>

      <div className="w-full relative h-[180px]">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
          <defs>
            {/* Area Fill Gradient */}
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={chartWidth - paddingX}
            y2={paddingY}
            className="stroke-slate-800/80 stroke-1"
          />
          <line
            x1={paddingX}
            y1={chartHeight / 2}
            x2={chartWidth - paddingX}
            y2={chartHeight / 2}
            className="stroke-slate-800/80 stroke-1 stroke-dashed"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={chartHeight - paddingY}
            x2={chartWidth - paddingX}
            y2={chartHeight - paddingY}
            className="stroke-slate-800/80 stroke-1"
          />

          {/* Filled Area */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Line Path */}
          <path
            d={linePath}
            fill="none"
            className="stroke-indigo-500 stroke-2"
            filter="url(#glow)"
          />

          {/* Nodes / Dots */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? 6 : 4}
                className="fill-indigo-400 stroke-dark-900 stroke-2 cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {/* Day Labels */}
              <text
                x={p.x}
                y={chartHeight - 4}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 font-medium"
              >
                {p.day}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div
            className="absolute bg-slate-900 border border-indigo-500/50 p-2 rounded-lg text-[10px] text-white shadow-xl z-20 pointer-events-none transition-all"
            style={{
              left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
              top: `${(points[hoveredIndex].y / chartHeight) * 100 - 30}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <p className="font-semibold text-slate-300">{data[hoveredIndex].day}</p>
            <p className="text-indigo-400 font-bold mt-0.5">{data[hoveredIndex].minutes} mins</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyChart;
