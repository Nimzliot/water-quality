# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

This project uses Supabase Auth for login.

Create an email/password user in the Supabase dashboard, then sign in from the frontend.

After the first authenticated backend request, the app automatically creates a matching row in `public.users`.

### `GET /auth/me`

Headers:

- `Authorization: Bearer <supabase_access_token>`

Response:

```json
{
  "success": true,
  "message": "Authenticated Supabase user",
  "user": {
    "id": "uuid",
    "email": "researcher@example.com"
  },
  "appUser": {
    "id": "uuid",
    "email": "researcher@example.com"
  }
}
```

## Sensor APIs

### `POST /sensor/data`

Headers:

- `Content-Type: application/json`

Request:

```json
{
  "ph": 7.2,
  "temperature": 28.5
}
```

Response fields:

- `ph`
- `temperature`
- `predicted_ph`
- `predicted_temperature`
- `filtered_ph`
- `filtered_temperature`
- `residual_ph`
- `residual_temperature`
- `kalman_gain_ph`
- `kalman_gain_temperature`
- `adaptive_process_noise_ph`
- `adaptive_measurement_noise_ph`
- `adaptive_process_noise_temperature`
- `adaptive_measurement_noise_temperature`
- `status`
- `classification_reason`
- `confidence_score`
- `source_type`
- `simulation_mode`
- `created_at`

### `POST /sensor/heartbeat`

Headers:

- `Content-Type: application/json`

Request:

```json
{
  "deviceId": "ESP32-WQ-01",
  "firmwareVersion": "1.0.0",
  "status": "ONLINE",
  "ipAddress": "192.168.1.8"
}
```

Response fields:

- `device_id`
- `firmware_version`
- `status`
- `ip_address`
- `created_at`

### `POST /sensor/simulate`

Headers:

- `Authorization: Bearer <supabase_access_token>`
- `Content-Type: application/json`

Request:

```json
{
  "mode": "PH_DRIFT",
  "steps": 6,
  "baselinePh": 7.2,
  "baselineTemperature": 28.5,
  "magnitude": 0.45
}
```

Supported modes:

- `PH_DRIFT`
- `TEMP_DRIFT`
- `SENSOR_FAULT`
- `CONTAMINATION`
- `CRITICAL`

Simulation response also includes `validation` with:

- `expectedStatus`
- `exactMatches`
- `exactMatchRate`
- `anomalyDetectionRate`
- `firstExpectedDetectionStep`
- `falseNegativeCount`
- `averageConfidenceScore`
- `observedStatusDistribution`

### `GET /sensor/history`

Headers:

- `Authorization: Bearer <supabase_access_token>`

Query params:

- `limit` optional, max `500`

Returns latest processed history for the deployment.

## Dashboard API

### `GET /dashboard/stats`

Returns:

- `latest` latest reading
- `totals.readings`
- `totals.faults`
- `totals.sensorFaults`
- `totals.contaminationAlerts`
- `totals.criticalAlerts`
- `totals.normal`
- `averages.ph`
- `averages.temperature`
- `averages.residual_ph`
- `averages.residual_temperature`
- `chartData` latest 100 rows for charts

## Status Logic

- `NORMAL`: residuals and safe-range checks are within bounds
- `SENSOR_FAULT`: adaptive residual anomaly persists across recent frames
- `CONTAMINATION`: water values leave the safe range while residual behavior stays stable
- `CRITICAL`: contamination and sensor-fault indicators appear together

## Kalman Modeling

- The backend computes a predicted state before each measurement update
- The corrected state is stored as the filtered reading
- Kalman gain and adaptive process/measurement noise are stored for each frame
- Residuals are computed as `actual - filtered`
