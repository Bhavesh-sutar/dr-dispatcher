const DR = require("../models/DR");

// Update Action / Optimized / Submitted
const updateDRAction = async (drId, action, optimized, submitted) => {
  // Find the DR
  const dr = await DR.findOne({ drId });

  if (!dr) {
    throw new Error("DR not found");
  }

  // --------------------------------
  // FINAL STATE PROTECTION
  // --------------------------------

  // Once Submitted is completed, the DR is permanently completed.
  if (dr.submitted && dr.submitted.length > 0) {
    throw new Error("Submitted is already completed. DR cannot be changed.");
  }

  // --------------------------------
  // ACTION UPDATE
  // --------------------------------

  if (action !== undefined) {
    // Action can only be selected once
    if (dr.actions && dr.actions.length > 0) {
      throw new Error("Action is already completed and cannot be changed.");
    }

    // Validate action
    if (action !== "Opt IN" && action !== "Opt OUT") {
      throw new Error("Invalid action");
    }

    // -------------------------------
    // OPT OUT
    // -------------------------------

    if (action === "Opt OUT") {
      dr.actions = ["Opt OUT"];
      dr.optimized = ["NO"];
      dr.submitted = ["NO"];
      dr.status = "Completed";
    }

    // -------------------------------
    // OPT IN
    // -------------------------------

    else {
      dr.actions = ["Opt IN"];

      // Opt IN starts the workflow
      dr.status = "In-progress";
    }
  }

  // --------------------------------
  // OPTIMIZED UPDATE
  // --------------------------------

  if (optimized !== undefined) {
    // Action must be Opt IN
    if (!dr.actions || dr.actions[0] !== "Opt IN") {
      throw new Error("Action must be Opt IN before updating Optimized.");
    }

    // Optimized can only be selected once
    if (dr.optimized && dr.optimized.length > 0) {
      throw new Error(
        "Optimized is already completed and cannot be changed."
      );
    }

    // Validate optimized value
    if (optimized !== "YES" && optimized !== "NO") {
      throw new Error("Optimized must be YES or NO");
    }

    dr.optimized = [optimized];

    // Still waiting for Submitted
    dr.status = "In-progress";
  }

  // --------------------------------
  // SUBMITTED UPDATE
  // --------------------------------

  if (submitted !== undefined) {
    // Action must be Opt IN
    if (!dr.actions || dr.actions[0] !== "Opt IN") {
      throw new Error("Action must be Opt IN before updating Submitted.");
    }

    // Submitted can only be selected once
    if (dr.submitted && dr.submitted.length > 0) {
      throw new Error(
        "Submitted is already completed and cannot be changed."
      );
    }

    // Validate submitted value
    if (submitted !== "YES" && submitted !== "NO") {
      throw new Error("Submitted must be YES or NO");
    }

    dr.submitted = [submitted];

    // Submitted is the final step
    dr.status = "Completed";
  }

  // --------------------------------
  // NOTHING TO UPDATE
  // --------------------------------

  if (
    action === undefined &&
    optimized === undefined &&
    submitted === undefined
  ) {
    throw new Error("No update data provided");
  }

  // Save
  await dr.save();

  return dr;
};

// Service function to retrieve all DRs based on the provided filters
const getAllDRs = async (
  search,
  status,
  eventType,
  fromDate,
  toDate,
  page=1,
  limit=10
) => {
  const query = {};

  //Skip login for pages, eg. for page 2 then skip first 10 entries
  const skip = (page-1) * limit


  // Build the query object based on the provided filters
  if (search) {
    query.drId = { $regex: search, $options: "i" };
  }

  if (status) {
    query.status = status;
  }

  if (eventType) {
    query.eventType = eventType;
  }

  if (fromDate || toDate) {
    query.date = {};

    if (fromDate) {
      query.date.$gte = new Date(fromDate);
    }

    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999); // Set the end date to the end of the day (23:59:59.999)
      //  to include all events on that day

      query.date.$lte = endDate;
    }
  }

  const total = await DR.countDocuments(query);

  const drs = await DR.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  return {
    data: drs,
    pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    },
    };
};

module.exports = {
  getAllDRs,
  updateDRAction,
};