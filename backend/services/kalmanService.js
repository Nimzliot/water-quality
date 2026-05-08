class KalmanFilter {
  constructor({ processNoise = 0.01, measurementNoise = 0.1, estimatedError = 1, initialValue = 0 } = {}) {
    this.processNoise = processNoise;
    this.measurementNoise = measurementNoise;
    this.estimatedError = estimatedError;
    this.currentEstimate = initialValue;
  }

  step(measurement, overrides = {}) {
    const prediction = this.currentEstimate;
    const processNoise = Number(overrides.processNoise ?? this.processNoise);
    const measurementNoise = Number(overrides.measurementNoise ?? this.measurementNoise);
    const predictionError = this.estimatedError + processNoise;
    const kalmanGain = predictionError / (predictionError + measurementNoise);

    this.currentEstimate = prediction + kalmanGain * (measurement - prediction);
    this.estimatedError = (1 - kalmanGain) * predictionError;

    return {
      predictedEstimate: prediction,
      filteredEstimate: this.currentEstimate,
      kalmanGain,
      processNoise,
      measurementNoise,
      innovation: measurement - prediction,
    };
  }

  filter(measurement, overrides = {}) {
    return this.step(measurement, overrides).filteredEstimate;
  }
}

const mean = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

const standardDeviation = (values) => {
  if (!values.length) {
    return 0;
  }

  const average = mean(values);
  const variance = mean(values.map((value) => (value - average) ** 2));
  return Math.sqrt(variance);
};

const deriveAdaptiveNoise = (history, config) => {
  const baseProcessNoise = Number(config.processNoise || 0.01);
  const baseMeasurementNoise = Number(config.measurementNoise || 0.1);

  if (!Array.isArray(history) || history.length < 2) {
    return {
      processNoise: baseProcessNoise,
      measurementNoise: baseMeasurementNoise,
    };
  }

  const sanitized = history.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  const deltas = sanitized.slice(1).map((value, index) => value - sanitized[index]);
  const signalVolatility = standardDeviation(sanitized);
  const deltaVolatility = standardDeviation(deltas);
  const trendStrength = Math.abs(sanitized[sanitized.length - 1] - sanitized[0]) / Math.max(1, sanitized.length - 1);

  const measurementMultiplier = 1 + Math.min(2.5, signalVolatility / Math.max(baseMeasurementNoise, 0.0001));
  const processMultiplier = 1 + Math.min(2.5, (deltaVolatility + trendStrength) / Math.max(baseProcessNoise * 10, 0.0001));

  return {
    processNoise: Number((baseProcessNoise * processMultiplier).toFixed(6)),
    measurementNoise: Number((baseMeasurementNoise * measurementMultiplier).toFixed(6)),
  };
};

const getKalmanSettings = () => ({
  ph: {
    processNoise: Number(process.env.PH_PROCESS_NOISE || 0.01),
    measurementNoise: Number(process.env.PH_MEASUREMENT_NOISE || 0.25),
  },
  temperature: {
    processNoise: Number(process.env.TEMP_PROCESS_NOISE || 0.01),
    measurementNoise: Number(process.env.TEMP_MEASUREMENT_NOISE || 0.16),
  },
});

const applyKalmanSeries = (series, config) => {
  if (!Array.isArray(series) || series.length === 0) {
    return [];
  }

  const filter = new KalmanFilter({
    ...config,
    initialValue: series[0],
  });

  return series.map((measurement) => filter.filter(measurement));
};

const applyKalmanSeriesDetailed = (series, config, options = {}) => {
  if (!Array.isArray(series) || series.length === 0) {
    return [];
  }

  const adaptiveWindowSize = Math.max(2, Number(options.adaptiveWindowSize) || 8);
  const filter = new KalmanFilter({
    ...config,
    initialValue: series[0],
  });

  return series.map((measurement, index) => {
    const history = series.slice(Math.max(0, index - adaptiveWindowSize), index + 1);
    const adaptiveNoise = deriveAdaptiveNoise(history, config);
    const step = filter.step(measurement, adaptiveNoise);

    return {
      measurement,
      predictedEstimate: step.predictedEstimate,
      filteredEstimate: step.filteredEstimate,
      residual: measurement - step.filteredEstimate,
      kalmanGain: step.kalmanGain,
      adaptiveProcessNoise: step.processNoise,
      adaptiveMeasurementNoise: step.measurementNoise,
      innovation: step.innovation,
    };
  });
};

module.exports = {
  KalmanFilter,
  applyKalmanSeries,
  applyKalmanSeriesDetailed,
  deriveAdaptiveNoise,
  getKalmanSettings,
};
