import { useEffect, useState } from "react";
import "./DRFilters.css";

const DRFilters = ({ filters, onFilterChange, onRefresh }) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange("search", searchInput);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  return (
    <div className="dr-filters">
      <div className="dr-filters-group">
        <input
          className="dr-filters-input dr-filters-search"
          type="text"
          placeholder="Search DR ID"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        <input
          className="dr-filters-input dr-filters-date"
          type="date"
          value={filters.fromDate}
          onChange={(event) => onFilterChange("fromDate", event.target.value)}
        />

        <input
          className="dr-filters-input dr-filters-date"
          type="date"
          value={filters.toDate}
          onChange={(event) => onFilterChange("toDate", event.target.value)}
        />

        <select
          className="dr-filters-select"
          value={filters.status}
          onChange={(event) => onFilterChange("status", event.target.value)}
        >
          <option value="">All Status</option>
          <option value="Planned">Planned</option>
          <option value="In-progress">In-progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          className="dr-filters-select"
          value={filters.eventType}
          onChange={(event) => onFilterChange("eventType", event.target.value)}
        >
          <option value="">All Event Types</option>
          <option value="DR">DR</option>
          <option value="EEA">EEA</option>
        </select>
      </div>

      <button className="dr-filters-refresh" type="button" onClick={onRefresh}>
        <svg
          className="dr-filters-refresh-icon"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path
            d="M16.5 10a6.5 6.5 0 11-1.9-4.6M16.5 3.5V8h-4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Refresh
      </button>
    </div>
  );
};

export default DRFilters;
