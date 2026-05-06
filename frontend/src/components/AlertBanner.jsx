function AlertBanner({ latest }) {
  if (!latest || latest.status === "NORMAL") {
    return (
      <div className="glass-panel border border-emerald-500/20 p-4 text-emerald-300">
        All monitored channels are within residual thresholds.
      </div>
    );
  }

  if (latest.status === "SENSOR_FAULT") {
    return (
      <div className="glass-panel border border-amber-500/20 p-4 text-amber-200">
        Sensor fault suspected. Residual pH: {latest.residual_ph}, residual temperature: {latest.residual_temperature}.
      </div>
    );
  }

  if (latest.status === "CONTAMINATION") {
    return (
      <div className="glass-panel border border-sky-500/20 p-4 text-sky-200">
        Water contamination alert. The measured water parameters moved outside the configured safe range while the sensor remained stable.
      </div>
    );
  }

  return (
    <div className="glass-panel border border-rose-500/20 p-4 text-rose-300">
      Critical event detected. Contamination and sensor-fault indicators are both present.
    </div>
  );
}

export default AlertBanner;
