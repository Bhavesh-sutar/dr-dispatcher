const express = require("express");

const {
  getAllDRs,
  updateDRAction,
  createDR,
} = require("../controllers/drController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getAllDRs);

router.patch("/:drId/action", authMiddleware, updateDRAction);

router.post("/", authMiddleware, createDR);

module.exports = router;
