const getExpectedStatusForMode = (mode) => {
  switch (mode) {
    case "CONTAMINATION":
      return "CONTAMINATION";
    case "CRITICAL":
      return "CRITICAL";
    case "PH_DRIFT":
    case "TEMP_DRIFT":
    case "SENSOR_FAULT":
    default:
      return "SENSOR_FAULT";
  }
};

const summarizeSimulationValidation = (mode, frames = []) => {
  const expectedStatus = getExpectedStatusForMode(mode);
  const observedStatusDistribution = frames.reduce((summary, frame) => {
    const label = frame.status || "UNKNOWN";
    summary[label] = (summary[label] || 0) + 1;
    return summary;
  }, {});

  const exactMatches = frames.filter((frame) => frame.status === expectedStatus).length;
  const anomalyMatches = frames.filter((frame) => frame.status !== "NORMAL").length;
  const firstExpectedDetectionIndex = frames.findIndex((frame) => frame.status === expectedStatus);
  const falseNegativeCount = frames.filter((frame) => frame.status === "NORMAL").length;
  const averageConfidenceScore = frames.length
    ? Number(
        (
          frames.reduce((sum, frame) => sum + Number(frame.confidence_score || 0), 0) /
          frames.length
        ).toFixed(2)
      )
    : 0;

  return {
    expectedStatus,
    totalFrames: frames.length,
    exactMatches,
    exactMatchRate: frames.length ? Number(((exactMatches / frames.length) * 100).toFixed(2)) : 0,
    anomalyDetectionRate: frames.length ? Number(((anomalyMatches / frames.length) * 100).toFixed(2)) : 0,
    firstExpectedDetectionStep: firstExpectedDetectionIndex >= 0 ? firstExpectedDetectionIndex + 1 : null,
    falseNegativeCount,
    averageConfidenceScore,
    observedStatusDistribution,
  };
};

module.exports = {
  getExpectedStatusForMode,
  summarizeSimulationValidation,
};
