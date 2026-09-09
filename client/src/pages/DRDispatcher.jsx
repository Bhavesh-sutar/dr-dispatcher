import { useCallback, useEffect, useState } from "react";
import drService from "../services/drService";
import DRFilters from "../components/DRFilters";
import DRTable from "../components/DRTable";
import Pagination from "../components/Pagination";

import "./DRDispatcher.css";

const DRDispatcher = () => {
  const [drs, setDrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    eventType: "",
    fromDate: "",
    toDate: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchDRs = useCallback(async (currentFilters, page = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await drService.getDRs({
        ...currentFilters,
        page,
        limit: 10,
      });

      setDrs(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch DRs. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDRs(filters, 1);
  }, [fetchDRs]);

  const handleFilterChange = (name, value) => {
    const updatedFilters = {
      ...filters,
      [name]: value,
    };

    setFilters(updatedFilters);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    fetchDRs(updatedFilters, 1);
  };

  const handlePageChange = (page) => {
    fetchDRs(filters, page);
  };

  const handleDRUpdate = async (drId, action, optimized, submitted) => {
    const response = await drService.updateDRAction(
      drId,
      action,
      optimized,
      submitted,
    );

    setDrs((currentDRs) =>
      currentDRs.map((dr) => (dr.drId === drId ? response.data : dr)),
    );
  };

  const handleRefresh = () => {
    fetchDRs(filters, pagination.page);
  };

  return (
    <div className="dr-page">
      <div className="dr-page-inner">
        <header className="dr-header">
          <h1 className="dr-title">DR Dispatcher</h1>

          <p className="dr-subtitle">
            Monitor and respond to active demand response events
          </p>
        </header>

        <DRFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
        />

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />

        {loading && (
          <div className="dr-status dr-status-loading">
            <span className="dr-spinner" aria-hidden="true" />
            <span>Loading DRs…</span>
          </div>
        )}

        {error && (
          <div className="dr-status dr-status-error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && (
          <DRTable drs={drs} onDRUpdate={handleDRUpdate} />
        )}
      </div>
    </div>
  );
};

export default DRDispatcher;
