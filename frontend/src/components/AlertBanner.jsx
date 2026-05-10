function AlertBanner({ latest }) {
  if (!latest || latest.status === "NORMAL") {
    return (
      <div className="glass-panel border border-black/10 p-4 text-black">
        All monitored channels are within residual thresholds.
      </div>
    );
  }

  if (latest.status === "SENSOR_FAULT") {
    return (
      <div className="glass-panel border border-black/10 p-4 text-black">
        Sensor fault suspected. Residual pH: {latest.residual_ph}, residual temperature: {latest.residual_temperature}.
      </div>
    );
  }

  if (latest.status === "CONTAMINATION") {
    return (
      <div className="glass-panel border border-black/10 p-4 text-black">
        Water contamination alert. The measured water parameters moved outside the configured safe range while the sensor remained stable.
      </div>
    );
  }

  return (
    <div className="glass-panel border border-black/10 p-4 text-black">
      Critical event detected. Contamination and sensor-fault indicators are both present.
    </div>
  );
}

export default AlertBanner;
