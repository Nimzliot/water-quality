import { useState } from "react";
import { useDashboardData } from "../context/DashboardDataContext";

const simulationOptions = [
  { value: "PH_DRIFT", label: "pH Drift" },
  { value: "TEMP_DRIFT", label: "Temperature Drift" },
  { value: "SENSOR_FAULT", label: "Sensor Fault" },
  { value: "CONTAMINATION", label: "Contamination" },
  { value: "CRITICAL", label: "Critical Mixed Event" },
];

function Settings() {
  const { runSimulation, simulationLoading } = useDashboardData();
  const [formState, setFormState] = useState({
    mode: "PH_DRIFT",
    steps: 6,
    baselinePh: 7.2,
    baselineTemperature: 28.5,
    magnitude: 0.45,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validation, setValidation] = useState(null);

  const handleChange = (event) => {
    setFormState((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSimulation = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setValidation(null);

    try {
      const response = await runSimulation({
        mode: formState.mode,
        steps: Number(formState.steps),
        baselinePh: Number(formState.baselinePh),
        baselineTemperature: Number(formState.baselineTemperature),
        magnitude: Number(formState.magnitude),
      });

      setMessage(`Simulation completed: ${response.mode} generated ${response.count} frames.`);
      setValidation(response.validation || null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Simulation failed");
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="glass-panel p-5">
        <p className="section-title">Adaptive Detection</p>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>Heartbeat packets should arrive every 5 seconds.</p>
          <p>Hardware becomes disconnected when heartbeats stop for 15 seconds.</p>
          <p>Residual thresholds are blended with recent residual behavior using an adaptive window.</p>
          <p>The backend now stores predicted sensor states before each Kalman correction step.</p>
          <p>Persistent residual anomalies are interpreted as likely sensor drift or sensor fault.</p>
          <p>Out-of-range water values with stable residuals are interpreted as contamination events.</p>
        </div>
      </div>

      <div className="glass-panel p-5">
        <p className="section-title">Simulation Lab</p>
        <form className="mt-4 space-y-4" onSubmit={handleSimulation}>
          <div>
            <label className="mb-2 block text-sm text-stone-700">Scenario</label>
            <select className="input-field" name="mode" value={formState.mode} onChange={handleChange}>
              {simulationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-stone-700">Steps</label>
              <input className="input-field" name="steps" type="number" min="1" value={formState.steps} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-2 block text-sm text-stone-700">Magnitude</label>
              <input className="input-field" name="magnitude" type="number" step="0.05" value={formState.magnitude} onChange={handleChange} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-stone-700">Baseline pH</label>
              <input className="input-field" name="baselinePh" type="number" step="0.1" value={formState.baselinePh} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-2 block text-sm text-stone-700">Baseline Temp</label>
              <input className="input-field" name="baselineTemperature" type="number" step="0.1" value={formState.baselineTemperature} onChange={handleChange} />
            </div>
          </div>
          {message ? <p className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black">{message}</p> : null}
          {error ? <p className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-neutral-800">{error}</p> : null}
          <button className="primary-button w-full" type="submit" disabled={simulationLoading}>
            {simulationLoading ? "Running Simulation..." : "Run Experimental Validation"}
          </button>
        </form>

        {validation ? (
          <div className="mt-5 rounded-[24px] border border-black/8 bg-black/[0.02] p-5">
            <p className="section-title">Validation Summary</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-black/[0.03] px-4 py-3">
                <p className="text-sm text-slate-500">Expected Status</p>
                <p className="mt-2 font-medium text-black">{validation.expectedStatus}</p>
              </div>
              <div className="rounded-2xl bg-black/[0.03] px-4 py-3">
                <p className="text-sm text-slate-500">Exact Match Rate</p>
                <p className="mt-2 font-medium text-black">{validation.exactMatchRate}%</p>
              </div>
              <div className="rounded-2xl bg-black/[0.03] px-4 py-3">
                <p className="text-sm text-slate-500">Anomaly Detection Rate</p>
                <p className="mt-2 font-medium text-black">{validation.anomalyDetectionRate}%</p>
              </div>
              <div className="rounded-2xl bg-black/[0.03] px-4 py-3">
                <p className="text-sm text-slate-500">First Expected Detection Step</p>
                <p className="mt-2 font-medium text-black">{validation.firstExpectedDetectionStep ?? "Not detected"}</p>
              </div>
              <div className="rounded-2xl bg-black/[0.03] px-4 py-3">
                <p className="text-sm text-slate-500">False Negatives</p>
                <p className="mt-2 font-medium text-black">{validation.falseNegativeCount}</p>
              </div>
              <div className="rounded-2xl bg-black/[0.03] px-4 py-3">
                <p className="text-sm text-slate-500">Average Confidence</p>
                <p className="mt-2 font-medium text-black">{validation.averageConfidenceScore}%</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Settings;
