const getFaultThresholds = () => ({
  ph: Number(process.env.PH_FAULT_THRESHOLD || 0.35),
  temperature: Number(process.env.TEMP_FAULT_THRESHOLD || 1.5),
});

const getContaminationThresholds = () => ({
  phMin: Number(process.env.PH_SAFE_MIN || 6.5),
  phMax: Number(process.env.PH_SAFE_MAX || 8.5),
  temperatureMin: Number(process.env.TEMP_SAFE_MIN || 5),
  temperatureMax: Number(process.env.TEMP_SAFE_MAX || 35),
});

const getAdaptiveSettings = () => ({
  adaptiveWindowSize: Number(process.env.ADAPTIVE_WINDOW_SIZE || 25),
  faultPersistenceLimit: Number(process.env.FAULT_PERSISTENCE_LIMIT || 3),
  contaminationPersistenceLimit: Number(process.env.CONTAMINATION_PERSISTENCE_LIMIT || 2),
});

const mean = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

const standardDeviation = (values) => {
  if (!values.length) {
    return 0;
  }

  const average = mean(values);
  const variance = mean(values.map((value) => (value - average) ** 2));
  return Math.sqrt(variance);
};

const countTrailingMatches = (rows, matcher) => {
  let count = 0;

  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (!matcher(rows[index])) {
      break;
    }

    count += 1;
  }

  return count;
};

const detectFaultStatus = (
  residuals,
  actualValues,
  recentReadings = [],
  thresholds = getFaultThresholds(),
  contaminationThresholds = getContaminationThresholds(),
  adaptiveSettings = getAdaptiveSettings()
) => {
  const residualHistoryPh = recentReadings.map((row) => Math.abs(Number(row.residual_ph || 0)));
  const residualHistoryTemp = recentReadings.map((row) => Math.abs(Number(row.residual_temperature || 0)));

  const dynamicPhThreshold = Math.max(
    thresholds.ph,
    mean(residualHistoryPh) + standardDeviation(residualHistoryPh) * 2
  );
  const dynamicTemperatureThreshold = Math.max(
    thresholds.temperature,
    mean(residualHistoryTemp) + standardDeviation(residualHistoryTemp) * 2
  );

  const phFault = Math.abs(residuals.residualPh) > dynamicPhThreshold;
  const temperatureFault = Math.abs(residuals.residualTemperature) > dynamicTemperatureThreshold;
  const contaminationDetected =
    actualValues.ph < contaminationThresholds.phMin ||
    actualValues.ph > contaminationThresholds.phMax ||
    actualValues.temperature < contaminationThresholds.temperatureMin ||
    actualValues.temperature > contaminationThresholds.temperatureMax;

  const faultPersistenceCount = countTrailingMatches(recentReadings, (row) => {
    const phResidual = Math.abs(Number(row.residual_ph || 0));
    const temperatureResidual = Math.abs(Number(row.residual_temperature || 0));
    return phResidual > thresholds.ph * 0.7 || temperatureResidual > thresholds.temperature * 0.7;
  });

  const contaminationPersistenceCount = countTrailingMatches(recentReadings, (row) => {
    const phValue = Number(row.ph || 0);
    const temperatureValue = Number(row.temperature || 0);
    return (
      phValue < contaminationThresholds.phMin ||
      phValue > contaminationThresholds.phMax ||
      temperatureValue < contaminationThresholds.temperatureMin ||
      temperatureValue > contaminationThresholds.temperatureMax
    );
  });

  const stableResidualSignal =
    Math.abs(residuals.residualPh) <= thresholds.ph * 0.75 &&
    Math.abs(residuals.residualTemperature) <= thresholds.temperature * 0.75;

  const persistentFault =
    phFault ||
    temperatureFault ||
    faultPersistenceCount >= adaptiveSettings.faultPersistenceLimit;

  const persistentContamination =
    contaminationDetected &&
    (stableResidualSignal || contaminationPersistenceCount >= adaptiveSettings.contaminationPersistenceLimit);

  if (persistentFault && persistentContamination) {
    return {
      status: "CRITICAL",
      reason: "Safe-range violation detected together with persistent residual anomaly.",
      confidence: 0.96,
      diagnostics: {
        dynamicPhThreshold,
        dynamicTemperatureThreshold,
        faultPersistenceCount,
        contaminationPersistenceCount,
      },
    };
  }

  if (persistentFault) {
    return {
      status: "SENSOR_FAULT",
      reason: "Residual anomaly persisted across recent frames, indicating likely sensor drift or sensor fault.",
      confidence: 0.88,
      diagnostics: {
        dynamicPhThreshold,
        dynamicTemperatureThreshold,
        faultPersistenceCount,
        contaminationPersistenceCount,
      },
    };
  }

  if (persistentContamination) {
    return {
      status: "CONTAMINATION",
      reason: "Water parameters moved outside the safe operating range while residual behavior remained stable.",
      confidence: 0.84,
      diagnostics: {
        dynamicPhThreshold,
        dynamicTemperatureThreshold,
        faultPersistenceCount,
        contaminationPersistenceCount,
      },
    };
  }

  if (contaminationDetected) {
    return {
      status: "CONTAMINATION",
      reason: "Safe-range violation detected in the latest reading.",
      confidence: 0.72,
      diagnostics: {
        dynamicPhThreshold,
        dynamicTemperatureThreshold,
        faultPersistenceCount,
        contaminationPersistenceCount,
      },
    };
  }

  return {
    status: "NORMAL",
    reason: "Residuals and measured water values are within expected bounds.",
    confidence: 0.68,
    diagnostics: {
      dynamicPhThreshold,
      dynamicTemperatureThreshold,
      faultPersistenceCount,
      contaminationPersistenceCount,
    },
  };
};

module.exports = {
  getFaultThresholds,
  getContaminationThresholds,
  getAdaptiveSettings,
  detectFaultStatus,
};
