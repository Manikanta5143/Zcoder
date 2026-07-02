import React, { useState } from 'react';
import './SvgCharts.css';

// ==========================================
// 1. LINE / AREA CHART (Runtime & Memory)
// ==========================================
export const LineChart = ({ data = [], title = "Trend", strokeColor = "#3b82f6", fillColor = "rgba(59, 130, 246, 0.15)", unit = "ms" }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (data.length === 0) {
    return <div className="chart-empty-state">No trend data available</div>;
  }

  // Svg sizing
  const width = 500;
  const height = 200;
  const padding = 30;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Extract values
  const values = data.map(d => d.value);
  const minVal = 0;
  const maxVal = Math.max(...values, 10) * 1.1; // Add 10% breathing room

  // Map values to coordinates
  const points = data.map((d, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding + chartHeight - ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  // Build SVG Path
  let pathD = "";
  let areaD = "";

  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
    areaD = pathD + ` L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;
  }

  return (
    <div className="svg-chart-card">
      <h4>{title}</h4>
      <div className="svg-chart-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="svg-canvas">
          <defs>
            <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="3,3" />
          <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} stroke="#1e293b" strokeDasharray="3,3" />
          <line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="#1e293b" />

          {/* Area under the line */}
          {points.length > 1 && (
            <path d={areaD} fill={`url(#gradient-${title.replace(/\s+/g, '')})`} />
          )}

          {/* Line path */}
          {points.length > 1 && (
            <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Interactive circles */}
          {points.map((p, idx) => (
            <g key={idx} 
               onMouseEnter={() => setHoveredPoint(p)}
               onMouseLeave={() => setHoveredPoint(null)}
               className="chart-interactive-group"
            >
              <circle cx={p.x} cy={p.y} r="5" fill="#1e293b" stroke={strokeColor} strokeWidth="2.5" />
              <circle cx={p.x} cy={p.y} r="12" fill="transparent" style={{ cursor: 'pointer' }} />
            </g>
          ))}

          {/* X Axis Labels */}
          {points.length > 1 && (
            <>
              <text x={points[0].x} y={height - 8} className="chart-axis-label text-start">{points[0].label}</text>
              <text x={points[points.length - 1].x} y={height - 8} className="chart-axis-label text-end">{points[points.length - 1].label}</text>
            </>
          )}

          {/* Y Axis Max Label */}
          <text x={padding - 5} y={padding + 5} className="chart-axis-label text-y">{Math.round(maxVal)}{unit}</text>
          <text x={padding - 5} y={padding + chartHeight + 4} className="chart-axis-label text-y">0{unit}</text>
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint && (
          <div className="chart-tooltip" style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100 - 15}%` }}>
            <span className="tooltip-lbl">{hoveredPoint.label}</span>
            <span className="tooltip-val">{hoveredPoint.value} {unit}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. DOUGHNUT CHART (Language / Difficulty)
// ==========================================
export const DoughnutChart = ({ data = [], title = "Distribution" }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="svg-chart-card">
        <h4>{title}</h4>
        <div className="chart-empty-state">No distribution data</div>
      </div>
    );
  }

  // Circle geometry properties
  const radius = 60;
  const strokeWidth = 14;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="svg-chart-card doughnut-card">
      <h4>{title}</h4>
      <div className="doughnut-content-wrapper">
        <div className="svg-chart-wrapper doughnut-svg-wrapper">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {data.map((item, idx) => {
              const percent = (item.value / total) * 100;
              const strokeOffset = circumference - (percent / 100) * circumference;
              const rotation = (accumulatedPercent / 100) * 360 - 90;
              accumulatedPercent += percent;

              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="transparent"
                  stroke={item.color || "#3b82f6"}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  transform={`rotate(${rotation} ${cx} ${cy})`}
                  style={{ 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                    cursor: 'pointer',
                    filter: isHovered ? `drop-shadow(0 0 8px ${item.color || "#3b82f6"})` : 'none'
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}

            {/* Central summary text */}
            <text x={cx} y={cy - 4} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600" letterSpacing="0.5">TOTAL</text>
            <text x={cx} y={cy + 16} textAnchor="middle" fill="white" fontSize="22" fontWeight="800">{total}</text>
          </svg>
        </div>

        {/* Legend */}
        <div className="doughnut-legend">
          {data.map((item, idx) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
            return (
              <div 
                key={idx} 
                className={`legend-item ${hoveredIdx === idx ? 'highlight' : ''}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <span className="legend-dot" style={{ backgroundColor: item.color }} />
                <span className="legend-label">{item.label}</span>
                <span className="legend-value">{item.value} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. BAR CHART (Submission Frequencies)
// ==========================================
export const BarChart = ({ data = [], title = "Activity Frequency", barColor = "#8b5cf6" }) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (data.length === 0) {
    return <div className="chart-empty-state">No frequency data available</div>;
  }

  // Svg geometry
  const width = 500;
  const height = 200;
  const padding = 30;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Max value calculation
  const maxVal = Math.max(...data.map(d => d.value), 5) * 1.1;

  // Bar spacing calculations
  const barGap = 12;
  const totalGapsWidth = barGap * (data.length - 1);
  const barWidth = (chartWidth - totalGapsWidth) / data.length;

  return (
    <div className="svg-chart-card">
      <h4>{title}</h4>
      <div className="svg-chart-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="svg-canvas">
          {/* Y Grids */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="3,3" />
          <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} stroke="#1e293b" strokeDasharray="3,3" />
          <line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="#1e293b" />

          {/* Bars */}
          {data.map((d, index) => {
            const pct = d.value / maxVal;
            const barHeight = pct * chartHeight;
            const x = padding + index * (barWidth + barGap);
            const y = padding + chartHeight - barHeight;

            const isHovered = hoveredBar === index;

            return (
              <g 
                key={index}
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Visual bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)} // Show at least a tiny line for 0
                  fill={isHovered ? "#a78bfa" : barColor}
                  rx="4"
                  ry="4"
                  style={{ transition: 'all 0.2s ease-out' }}
                />
                
                {/* Invisibly wider touch target for hover trigger */}
                <rect
                  x={x - barGap/2}
                  y={padding}
                  width={barWidth + barGap}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* X labels */}
                {data.length <= 12 && (
                  <text 
                    x={x + barWidth / 2} 
                    y={height - 8} 
                    textAnchor="middle" 
                    className="chart-axis-label"
                  >
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Axis borders */}
          <text x={padding - 5} y={padding + 5} className="chart-axis-label text-y">{Math.round(maxVal)}</text>
          <text x={padding - 5} y={padding + chartHeight + 4} className="chart-axis-label text-y">0</text>
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredBar !== null && (
          <div 
            className="chart-tooltip" 
            style={{ 
              left: `${((padding + hoveredBar * (barWidth + barGap) + barWidth/2) / width) * 100}%`, 
              top: `${((padding + chartHeight - (data[hoveredBar].value / maxVal) * chartHeight) / height) * 100 - 15}%` 
            }}
          >
            <span className="tooltip-lbl">{data[hoveredBar].label}</span>
            <span className="tooltip-val">{data[hoveredBar].value} Submissions</span>
          </div>
        )}
      </div>
    </div>
  );
};
