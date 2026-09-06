const express = require("express");

const { getAllDRs, updateDRAction } = require("../controllers/drController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getAllDRs);

router.patch("/:drId/action", authMiddleware, updateDRAction);

module.exports = router;