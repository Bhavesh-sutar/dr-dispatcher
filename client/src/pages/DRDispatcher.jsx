import { useCallback, useEffect, useState } from "react";
import drService from "../services/drService";
import DRFilters from "../components/DRFilters";
import DRTable from "../components/DRTable";

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

  const fetchDRs = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      setError("");

      const response = await drService.getDRs(currentFilters);

      setDrs(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch DRs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDRs({
      search: "",
      status: "",
      eventType: "",
      fromDate: "",
      toDate: "",
    });
  }, [fetchDRs]);

  const handleFilterChange = useCallback(
    (name, value) => {
      const updatedFilters = {
        ...filters,
        [name]: value,
      };

      setFilters(updatedFilters);
      fetchDRs(updatedFilters);
    },
    [filters, fetchDRs]
  );


  const handleDRUpdate = async (
  drId,
  action,
  optimized,
  submitted
) => {
  const response = await drService.updateDRAction(
    drId,
    action,
    optimized,
    submitted
  );

  setDrs((currentDRs) =>
    currentDRs.map((dr) =>
      dr.drId === drId ? response.data : dr
    )
  );
};


  const handleRefresh = () => {
    fetchDRs(filters);
  };

  return (
    <div>
      <h1>DR Dispatcher</h1>

      <DRFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
      />

      {loading && <p>Loading DRs...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && <DRTable drs={drs} onDRUpdate={handleDRUpdate}/>}

    </div>
  );
};

export default DRDispatcher;