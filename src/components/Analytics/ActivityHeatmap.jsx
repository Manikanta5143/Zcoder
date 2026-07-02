import React, { useState, useMemo } from 'react';
import './ActivityHeatmap.css';

export default function ActivityHeatmap({ submissions = [] }) {
  const [filterType, setFilterType] = useState('total'); // 'total' | 'accepted' | 'failed'
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate 365 days leading to today
  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999); // end of today

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0); // start of day
      days.push(d);
    }
    return days;
  }, []);

  // Group submissions by date string for rapid search
  const submissionCountsByDate = useMemo(() => {
    const counts = {};
    submissions.forEach(sub => {
      if (!sub.createdAt) return;
      const dStr = new Date(sub.createdAt).toDateString();
      if (!counts[dStr]) {
        counts[dStr] = { total: 0, accepted: 0, failed: 0 };
      }
      counts[dStr].total += 1;
      if (sub.verdict === 'Accepted') {
        counts[dStr].accepted += 1;
      } else {
        counts[dStr].failed += 1;
      }
    });
    return counts;
  }, [submissions]);

  // Construct 53 columns (weeks) of days
  const gridWeeks = useMemo(() => {
    const weeks = [];
    let currentWeek = [];

    // Alignment: find the weekday of the first date
    const firstDayIndex = calendarDays[0].getDay(); // 0 is Sunday, 1 is Monday...
    
    // Pad the first week if not starting on Sunday
    for (let p = 0; p < firstDayIndex; p++) {
      currentWeek.push(null);
    }

    calendarDays.forEach(date => {
      const dStr = date.toDateString();
      const countData = submissionCountsByDate[dStr] || { total: 0, accepted: 0, failed: 0 };
      const count = countData[filterType];

      currentWeek.push({
        date,
        count
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      // Pad final week
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [calendarDays, submissionCountsByDate, filterType]);

  // Months label positions
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;

    gridWeeks.forEach((week, weekIdx) => {
      // Find the first valid day in the week
      const validDay = week.find(d => d !== null);
      if (validDay) {
        const m = validDay.date.getMonth();
        if (m !== lastMonth) {
          labels.push({
            name: validDay.date.toLocaleDateString('en-US', { month: 'short' }),
            colIdx: weekIdx
          });
          lastMonth = m;
        }
      }
    });
    return labels;
  }, [gridWeeks]);

  // Decide colors based on counts and filterType
  const getCellColor = (count) => {
    if (count === 0) return '#1e293b'; // default empty
    
    if (filterType === 'failed') {
      // Red shades
      if (count <= 1) return '#fecdd3';
      if (count <= 2) return '#fda4af';
      if (count <= 4) return '#f43f5e';
      return '#be123c';
    } else if (filterType === 'accepted') {
      // Blue shades
      if (count <= 1) return '#bfdbfe';
      if (count <= 2) return '#60a5fa';
      if (count <= 4) return '#2563eb';
      return '#1d4ed8';
    } else {
      // Green shades (Default)
      if (count <= 1) return '#bbf7d0';
      if (count <= 2) return '#4ade80';
      if (count <= 4) return '#16a34a';
      return '#15803d';
    }
  };

  // Dimensions
  const cellSize = 10;
  const cellGap = 2;
  const headerHeight = 20;
  const sidebarWidth = 30;

  const width = sidebarWidth + gridWeeks.length * (cellSize + cellGap);
  const height = headerHeight + 7 * (cellSize + cellGap);

  return (
    <div className="activity-heatmap-card">
      <div className="heatmap-header">
        <div className="header-left">
          <h4>Submission Calendar</h4>
          <span className="subtitle">Activity and performance over the past year</span>
        </div>
        <div className="heatmap-controls">
          <button 
            className={`control-btn total ${filterType === 'total' ? 'active' : ''}`}
            onClick={() => setFilterType('total')}
          >
            Submissions
          </button>
          <button 
            className={`control-btn accepted ${filterType === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilterType('accepted')}
          >
            Accepted Solves
          </button>
          <button 
            className={`control-btn failed ${filterType === 'failed' ? 'active' : ''}`}
            onClick={() => setFilterType('failed')}
          >
            Errors & WA
          </button>
        </div>
      </div>

      <div className="heatmap-viewport-wrapper">
        <div className="heatmap-svg-container">
          <svg viewBox={`0 0 ${width} ${height}`} className="heatmap-svg">
            {/* 1. Month Labels */}
            {monthLabels.map((lbl, idx) => (
              <text
                key={idx}
                x={sidebarWidth + lbl.colIdx * (cellSize + cellGap)}
                y={12}
                className="heatmap-text month-label"
              >
                {lbl.name}
              </text>
            ))}

            {/* 2. Weekday Labels */}
            <text x={10} y={headerHeight + 1 * (cellSize + cellGap) + 8} className="heatmap-text day-label">Mon</text>
            <text x={10} y={headerHeight + 3 * (cellSize + cellGap) + 8} className="heatmap-text day-label">Wed</text>
            <text x={10} y={headerHeight + 5 * (cellSize + cellGap) + 8} className="heatmap-text day-label">Fri</text>

            {/* 3. Grid Cells */}
            {gridWeeks.map((week, colIdx) => (
              <g key={colIdx}>
                {week.map((day, rowIdx) => {
                  if (!day) return null;

                  const x = sidebarWidth + colIdx * (cellSize + cellGap);
                  const y = headerHeight + rowIdx * (cellSize + cellGap);
                  const color = getCellColor(day.count);

                  return (
                    <rect
                      key={rowIdx}
                      x={x}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      fill={color}
                      rx="1.5"
                      ry="1.5"
                      className="heatmap-cell"
                      onMouseEnter={(e) => {
                        const rect = e.target.getBoundingClientRect();
                        setHoveredDay({
                          date: day.date,
                          count: day.count,
                          x: x,
                          y: y
                        });
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  );
                })}
              </g>
            ))}
          </svg>

          {/* Tooltip */}
          {hoveredDay && (
            <div 
              className="heatmap-tooltip" 
              style={{ 
                left: `${(hoveredDay.x / width) * 100}%`, 
                top: `${(hoveredDay.y / height) * 100 - 8}%` 
              }}
            >
              <strong>{hoveredDay.count} {filterType === 'total' ? 'submissions' : filterType === 'accepted' ? 'accepted solves' : 'errors'}</strong>
              <span>on {hoveredDay.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="legend-blocks">
          <span className="legend-block" style={{ backgroundColor: '#1e293b' }} />
          <span className="legend-block" style={{ backgroundColor: getCellColor(1) }} />
          <span className="legend-block" style={{ backgroundColor: getCellColor(2) }} />
          <span className="legend-block" style={{ backgroundColor: getCellColor(4) }} />
          <span className="legend-block" style={{ backgroundColor: getCellColor(6) }} />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
