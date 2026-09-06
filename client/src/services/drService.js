import api from "./api";

// Get DRs with optional filters
const getDRs = async ({
  search = "",
  status = "",
  eventType = "",
  fromDate = "",
  toDate = "",
} = {}) => {
  const params = {};

  if (search) params.search = search;
  if (status) params.status = status;
  if (eventType) params.eventType = eventType;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;

  const response = await api.get("/dr", { params });

  return response.data;
};

// Update Action / Optimized / Submitted / Status of a DR
const updateDRAction = async (
  drId,
  action,
  optimized,
  submitted
) => {
  const response = await api.patch(`/dr/${drId}/action`, {
    action,
    optimized,
    submitted,
  });

  return response.data;
};

const drService = {
  getDRs,
  updateDRAction,
};

export default drService;