# Cross-Validated Multi-Sensor Fault Detection in Water Quality Systems Using Kalman-Based Residual Analysis

A complete full-stack IoT monitoring system built with React, Vite, Tailwind CSS, Express, Supabase PostgreSQL, Supabase Auth, Recharts, Axios, and an ESP32 REST client.

## Features

- ESP32-compatible ingestion endpoint for pH and DS18B20 temperature data
- Dedicated heartbeat endpoint for device connected/disconnected status
- Supabase Auth login with backend verification of Supabase access tokens
- Kalman filter smoothing for pH and temperature streams
- Adaptive residual analysis with persistence-aware classification
- Distinguishes `SENSOR_FAULT`, `CONTAMINATION`, and `CRITICAL` events
- Simulation lab for drift injection and experimental validation
- Supabase PostgreSQL storage with SQL schema included
- Dark glassmorphism dashboard with live cards, charts, alerts, and history
- Modular backend services and React Context-based auth flow

## Project Structure

```text
backend/
frontend/
embedded/
README.md
API_DOCUMENTATION.md
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` with your Supabase project values.

Run the SQL in [backend/database/supabase_schema.sql](/C:/Users/Acer/Desktop/Water-Quality/backend/database/supabase_schema.sql:1) inside the Supabase SQL editor.
This recreates the telemetry tables for the simple single-deployment mode.

Start the backend:

```bash
npm run dev
```

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Start the frontend:

```bash
npm run dev
```

Default frontend URL: `http://localhost:5173`

## Required Environment Variables

Backend:

- `PORT`
- `FRONTEND_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PH_PROCESS_NOISE`
- `PH_MEASUREMENT_NOISE`
- `TEMP_PROCESS_NOISE`
- `TEMP_MEASUREMENT_NOISE`
- `PH_FAULT_THRESHOLD`
- `TEMP_FAULT_THRESHOLD`
- `PH_SAFE_MIN`
- `PH_SAFE_MAX`
- `TEMP_SAFE_MIN`
- `TEMP_SAFE_MAX`
- `ADAPTIVE_WINDOW_SIZE`
- `FAULT_PERSISTENCE_LIMIT`
- `CONTAMINATION_PERSISTENCE_LIMIT`

Frontend:

- `VITE_API_BASE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Sensor Processing Logic

1. ESP32 posts `ph` and `temperature` to `/api/sensor/data`.
2. ESP32 posts heartbeats to `/api/sensor/heartbeat`.
3. The backend fetches recent global readings for the deployment.
4. Kalman filtering smooths pH and temperature series.
5. Residuals are computed with `actual - filtered`.
6. Adaptive logic uses residual magnitude, persistence, and safe-range rules.
7. Each frame is classified as `NORMAL`, `SENSOR_FAULT`, `CONTAMINATION`, or `CRITICAL`.
8. Processed data is stored in Supabase and shown in the dashboard.

## Authentication Setup

Create at least one email/password user in the Supabase Authentication panel before logging in to the dashboard.

This project now uses:

- Supabase Auth for dashboard login
- `auth.users` for login credentials
- `public.users` for app-side user records
- global telemetry tables for a single deployment, so ESP32 posting does not need user mapping

Dashboard pages still require a logged-in Supabase user, but ESP32 device posts do not require a token.

## Sample Test Data

Use plain JSON and send:

```json
{
  "ph": 7.2,
  "temperature": 28.5
}
```

Example `curl`:

```bash
curl -X POST http://localhost:5000/api/sensor/data \
  -H "Content-Type: application/json" \
  -d "{\"ph\":7.2,\"temperature\":28.5}"
```

Heartbeat example:

```bash
curl -X POST http://localhost:5000/api/sensor/heartbeat \
  -H "Content-Type: application/json" \
  -d "{\"deviceId\":\"ESP32-WQ-01\",\"firmwareVersion\":\"1.0.0\",\"status\":\"ONLINE\",\"ipAddress\":\"192.168.1.8\"}"
```

Simulation example:

```bash
curl -X POST http://localhost:5000/api/sensor/simulate \
  -H "Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"mode\":\"PH_DRIFT\",\"steps\":6,\"baselinePh\":7.2,\"baselineTemperature\":28.5,\"magnitude\":0.45}"
```

## ESP32 Notes

The sample sketch is in [embedded/esp32_code.ino](/C:/Users/Acer/Desktop/Water-Quality/embedded/esp32_code.ino:1). Update the WiFi credentials and API URLs before flashing. For deployment, replace `your-server-ip` with your PC or server LAN IP.

Required libraries:

- `WiFi.h`
- `HTTPClient.h`
- `OneWire`
- `DallasTemperature`
- `ArduinoJson`

## API Reference

See [API_DOCUMENTATION.md](/C:/Users/Acer/Desktop/Water-Quality/API_DOCUMENTATION.md:1) for endpoint details.
