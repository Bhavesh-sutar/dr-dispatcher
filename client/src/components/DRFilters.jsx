import { useEffect, useState } from "react";

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
    <div>
      <input
        type="text"
        placeholder="Search DR ID"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
      />

      <input
        type="date"
        value={filters.fromDate}
        onChange={(event) =>
          onFilterChange("fromDate", event.target.value)
        }
      />

      <input
        type="date"
        value={filters.toDate}
        onChange={(event) =>
          onFilterChange("toDate", event.target.value)
        }
      />

      <select
        value={filters.status}
        onChange={(event) =>
          onFilterChange("status", event.target.value)
        }
      >
        <option value="">All Status</option>
        <option value="Planned">Planned</option>
        <option value="In-progress">In-progress</option>
        <option value="Completed">Completed</option>
      </select>

      <select
            value={filters.eventType}
            onChange={(event) =>
                onFilterChange("eventType", event.target.value)
            }
            >
            <option value="">All Event Types</option>
            <option value="DR">DR</option>
            <option value="EEA">EEA</option>
        </select>

      <button type="button" onClick={onRefresh}>
        Refresh
      </button>
    </div>
  );
};

export default DRFilters;