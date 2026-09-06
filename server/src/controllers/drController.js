const drService = require("../services/drService");

// Controller function to update the actions, optimized, and submitted fields of a DR
const updateDRAction = async (req, res, next) => {
  try {
    const drId = req.params.drId;

    const { action, optimized, submitted } = req.body;

    const dr = await drService.updateDRAction(
      drId,
      action,
      optimized,
      submitted
    );

    res.status(200).json({
      success: true,
      message: "DR action updated successfully",
      data: dr,
    });
  } catch (error) {
        res.status(400).json({
        success: false,
        message: error.message,
        });
  }
};

// Controller function to retrieve all DRs based on the provided filters
const getAllDRs = async (req, res, next) => {
  try {
    const search = req.query.search;
    const status = req.query.status;
    const eventType = req.query.eventType; // DR or EEA
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;

    const drs = await drService.getAllDRs(
      search,
      status,
      eventType,
      fromDate,
      toDate
    );

    res.status(200).json({
      success: true,
      data: drs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDRs,
  updateDRAction,
};  