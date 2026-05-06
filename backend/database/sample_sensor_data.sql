insert into public.sensor_data (
  ph,
  temperature,
  filtered_ph,
  filtered_temperature,
  residual_ph,
  residual_temperature,
  status,
  classification_reason,
  confidence_score,
  source_type,
  simulation_mode
)
values
  (7.120, 28.200, 7.080, 28.050, 0.040, 0.150, 'NORMAL', 'Residuals and measured water values are within expected bounds.', 68.00, 'LIVE', null),
  (7.500, 32.800, 7.180, 29.100, 0.320, 3.700, 'SENSOR_FAULT', 'Residual anomaly persisted across recent frames, indicating likely sensor drift or sensor fault.', 88.00, 'SIMULATED', 'SENSOR_FAULT'),
  (4.980, 27.900, 5.050, 28.000, -0.070, -0.100, 'CONTAMINATION', 'Water parameters moved outside the safe operating range while residual behavior remained stable.', 84.00, 'SIMULATED', 'CONTAMINATION'),
  (4.650, 42.400, 5.700, 31.100, -1.050, 11.300, 'CRITICAL', 'Safe-range violation detected together with persistent residual anomaly.', 96.00, 'SIMULATED', 'CRITICAL');
