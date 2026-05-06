const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  postSensorData,
  getSensorHistory,
  postHeartbeat,
  simulateSensorScenario,
} = require("../controllers/sensorController");

const router = express.Router();

router.post("/heartbeat", postHeartbeat);
router.post("/data", postSensorData);
router.post("/simulate", authMiddleware, simulateSensorScenario);
router.get("/history", authMiddleware, getSensorHistory);

module.exports = router;
