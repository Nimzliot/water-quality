const supabase = require("../config/supabase");
const {
  getKalmanSettings,
  applyKalmanSeriesDetailed,
} = require("../services/kalmanService");
const { calculateResidual } = require("../services/residualService");
const {
  detectFaultStatus,
  getAdaptiveSettings,
  getFaultThresholds,
} = require("../services/faultDetectionService");
const { summarizeSimulationValidation } = require("../services/validationService");

const DEFAULT_HISTORY_WINDOW = 25;

const validateReading = (value, label) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    const error = new Error(`${label} must be a valid number`);
    error.status = 400;
    throw error;
  }
};

const fetchRecentSeries = async (limit = DEFAULT_HISTORY_WINDOW) => {
  const { data, error } = await supabase
    .from("sensor_data")
    .select("ph, temperature, residual_ph, residual_temperature, status")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data || []).reverse();
};

const processMeasurement = async ({
  ph,
  temperature,
  sourceType = "LIVE",
  simulationMode = null,
  expectedStatus = null,
}) => {
  validateReading(ph, "pH");
  validateReading(temperature, "Temperature");

  const recentSeries = await fetchRecentSeries();
  const phSeries = recentSeries.map((row) => row.ph).concat(ph);
  const temperatureSeries = recentSeries.map((row) => row.temperature).concat(temperature);

  const kalmanSettings = getKalmanSettings();
  const adaptiveSettings = getAdaptiveSettings();
  const phDiagnostics = applyKalmanSeriesDetailed(phSeries, kalmanSettings.ph, adaptiveSettings);
  const temperatureDiagnostics = applyKalmanSeriesDetailed(temperatureSeries, kalmanSettings.temperature, adaptiveSettings);

  const latestPhDiagnostics = phDiagnostics[phDiagnostics.length - 1];
  const latestTemperatureDiagnostics = temperatureDiagnostics[temperatureDiagnostics.length - 1];
  const filteredPh = latestPhDiagnostics.filteredEstimate;
  const filteredTemperature = latestTemperatureDiagnostics.filteredEstimate;
  const residualPh = calculateResidual(ph, filteredPh);
  const residualTemperature = calculateResidual(temperature, filteredTemperature);

  const thresholds = getFaultThresholds();
  const classification = detectFaultStatus(
    {
      residualPh,
      residualTemperature,
    },
    {
      ph,
      temperature,
    },
    recentSeries,
    thresholds
  );

  const payload = {
    ph,
    temperature,
    predicted_ph: Number(latestPhDiagnostics.predictedEstimate.toFixed(4)),
    predicted_temperature: Number(latestTemperatureDiagnostics.predictedEstimate.toFixed(4)),
    filtered_ph: Number(filteredPh.toFixed(4)),
    filtered_temperature: Number(filteredTemperature.toFixed(4)),
    residual_ph: Number(residualPh.toFixed(4)),
    residual_temperature: Number(residualTemperature.toFixed(4)),
    kalman_gain_ph: Number(latestPhDiagnostics.kalmanGain.toFixed(4)),
    kalman_gain_temperature: Number(latestTemperatureDiagnostics.kalmanGain.toFixed(4)),
    adaptive_process_noise_ph: Number(latestPhDiagnostics.adaptiveProcessNoise.toFixed(6)),
    adaptive_measurement_noise_ph: Number(latestPhDiagnostics.adaptiveMeasurementNoise.toFixed(6)),
    adaptive_process_noise_temperature: Number(latestTemperatureDiagnostics.adaptiveProcessNoise.toFixed(6)),
    adaptive_measurement_noise_temperature: Number(latestTemperatureDiagnostics.adaptiveMeasurementNoise.toFixed(6)),
    status: classification.status,
    expected_status: expectedStatus,
    classification_reason: classification.reason,
    confidence_score: Number((classification.confidence * 100).toFixed(2)),
    source_type: sourceType,
    simulation_mode: simulationMode,
  };

  const { data, error } = await supabase
    .from("sensor_data")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

const buildSimulationFrames = (mode, steps, baselinePh, baselineTemperature, magnitude) => {
  const frames = [];
  const expectedStatus =
    mode === "CONTAMINATION"
      ? "CONTAMINATION"
      : mode === "CRITICAL"
        ? "CRITICAL"
        : "SENSOR_FAULT";

  for (let index = 0; index < steps; index += 1) {
    let ph = baselinePh;
    let temperature = baselineTemperature;

    switch (mode) {
      case "PH_DRIFT":
        ph += magnitude * (index + 1);
        break;
      case "TEMP_DRIFT":
        temperature += magnitude * (index + 1);
        break;
      case "SENSOR_FAULT":
        ph += index % 2 === 0 ? magnitude : -magnitude;
        temperature += (index % 2 === 0 ? 1 : -1) * Math.min(magnitude, 1.8);
        break;
      case "CONTAMINATION":
        ph = baselinePh - Math.abs(magnitude) - 2.0;
        break;
      case "CRITICAL":
        ph = baselinePh - Math.abs(magnitude) - 2.0;
        temperature = baselineTemperature + Math.abs(magnitude) + 8;
        break;
      default:
        break;
    }

    frames.push({
      ph: Number(ph.toFixed(3)),
      temperature: Number(temperature.toFixed(3)),
      expectedStatus,
    });
  }

  return frames;
};

const postHeartbeat = async (req, res, next) => {
  try {
    const { deviceId = "ESP32-WQ-01", firmwareVersion = "1.0.0", status = "ONLINE", ipAddress = null } = req.body;

    const { data, error } = await supabase
      .from("device_heartbeats")
      .insert({
        device_id: deviceId,
        firmware_version: firmwareVersion,
        status,
        ip_address: ipAddress,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Heartbeat stored successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const postSensorData = async (req, res, next) => {
  try {
    const { ph, temperature } = req.body;
    const data = await processMeasurement({ ph, temperature, sourceType: "LIVE" });

    return res.status(201).json({
      success: true,
      message: "Sensor data processed and stored successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const simulateSensorScenario = async (req, res, next) => {
  try {
    const {
      mode = "PH_DRIFT",
      steps = 6,
      baselinePh = 7.2,
      baselineTemperature = 28.5,
      magnitude = 0.45,
    } = req.body;

    const frames = buildSimulationFrames(mode, Math.max(1, Number(steps) || 1), Number(baselinePh), Number(baselineTemperature), Number(magnitude));
    const storedFrames = [];

    for (const frame of frames) {
      const stored = await processMeasurement({
        ph: frame.ph,
        temperature: frame.temperature,
        sourceType: "SIMULATED",
        simulationMode: mode,
        expectedStatus: frame.expectedStatus,
      });
      storedFrames.push(stored);
    }

    const validation = summarizeSimulationValidation(mode, storedFrames);

    return res.status(201).json({
      success: true,
      message: "Simulation scenario executed successfully",
      mode,
      count: storedFrames.length,
      data: storedFrames,
      validation,
    });
  } catch (error) {
    return next(error);
  }
};

const getSensorHistory = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 500);

    const { data, error } = await supabase
      .from("sensor_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  postHeartbeat,
  postSensorData,
  simulateSensorScenario,
  getSensorHistory,
};
