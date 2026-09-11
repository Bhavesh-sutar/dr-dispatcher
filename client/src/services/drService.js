import api from "./api";

// Get DRs with optional filters
const getDRs = async ({
  search = "",
  status = "",
  eventType = "",
  fromDate = "",
  toDate = "",
  page = 1,
  limit = 10,
} = {}) => {
  const params = {};

  if (search) params.search = search;
  if (status) params.status = status;
  if (eventType) params.eventType = eventType;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  const response = await api.get("/dr", { params });

  return response.data;
};

// Update Action / Optimized / Submitted / Status of a DR
const updateDRAction = async (drId, action, optimized, submitted) => {
  const response = await api.patch(`/dr/${drId}/action`, {
    action,
    optimized,
    submitted,
  });

  return response.data;
};

// Create a new DR event
const createDR = async (drData) => {
  const response = await api.post("/dr", drData);

  return response.data;
};

const drService = {
  getDRs,
  updateDRAction,
  createDR,
};

export default drService;
