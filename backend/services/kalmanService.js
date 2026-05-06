class KalmanFilter {
  constructor({ processNoise = 0.01, measurementNoise = 0.1, estimatedError = 1, initialValue = 0 } = {}) {
    this.processNoise = processNoise;
    this.measurementNoise = measurementNoise;
    this.estimatedError = estimatedError;
    this.currentEstimate = initialValue;
  }

  filter(measurement) {
    const prediction = this.currentEstimate;
    const predictionError = this.estimatedError + this.processNoise;
    const kalmanGain = predictionError / (predictionError + this.measurementNoise);

    this.currentEstimate = prediction + kalmanGain * (measurement - prediction);
    this.estimatedError = (1 - kalmanGain) * predictionError;

    return this.currentEstimate;
  }
}

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

module.exports = {
  KalmanFilter,
  applyKalmanSeries,
  getKalmanSettings,
};
