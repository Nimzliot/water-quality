insert into public.sensor_data (
  ph,
  temperature,
  predicted_ph,
  predicted_temperature,
  filtered_ph,
  filtered_temperature,
  residual_ph,
  residual_temperature,
  kalman_gain_ph,
  kalman_gain_temperature,
  adaptive_process_noise_ph,
  adaptive_measurement_noise_ph,
  adaptive_process_noise_temperature,
  adaptive_measurement_noise_temperature,
  status,
  expected_status,
  classification_reason,
  confidence_score,
  source_type,
  simulation_mode
)
values
  (7.120, 28.200, 7.060, 28.010, 7.080, 28.050, 0.040, 0.150, 0.6210, 0.6830, 0.012000, 0.290000, 0.011000, 0.180000, 'NORMAL', null, 'Residuals and measured water values are within expected bounds.', 68.00, 'LIVE', null),
  (7.500, 32.800, 7.140, 29.000, 7.180, 29.100, 0.320, 3.700, 0.7040, 0.7410, 0.018000, 0.410000, 0.023000, 0.260000, 'SENSOR_FAULT', 'SENSOR_FAULT', 'Residual anomaly persisted across recent frames, indicating likely sensor drift or sensor fault.', 88.00, 'SIMULATED', 'SENSOR_FAULT'),
  (4.980, 27.900, 5.100, 28.070, 5.050, 28.000, -0.070, -0.100, 0.5660, 0.6120, 0.014000, 0.370000, 0.012000, 0.190000, 'CONTAMINATION', 'CONTAMINATION', 'Water parameters moved outside the safe operating range while residual behavior remained stable.', 84.00, 'SIMULATED', 'CONTAMINATION'),
  (4.650, 42.400, 5.960, 30.900, 5.700, 31.100, -1.050, 11.300, 0.7920, 0.8180, 0.031000, 0.520000, 0.046000, 0.330000, 'CRITICAL', 'CRITICAL', 'Safe-range violation detected together with persistent residual anomaly.', 96.00, 'SIMULATED', 'CRITICAL');
