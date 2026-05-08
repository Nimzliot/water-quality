const supabase = require("../config/supabase");

const HEARTBEAT_TIMEOUT_MS = 15000;

const getHardwareState = (heartbeat) => {
  if (!heartbeat) {
    return {
      connected: false,
      status: "DISCONNECTED",
    };
  }

  if (heartbeat.status === "OFFLINE") {
    return {
      connected: false,
      status: "OFFLINE",
    };
  }

  const isFresh = Date.now() - new Date(heartbeat.created_at).getTime() < HEARTBEAT_TIMEOUT_MS;

  return {
    connected: isFresh,
    status: isFresh ? "CONNECTED" : "DISCONNECTED",
  };
};

const getDashboardStats = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("sensor_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    const { data: heartbeatRows, error: heartbeatError } = await supabase
      .from("device_heartbeats")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (heartbeatError) {
      throw heartbeatError;
    }

    const readings = data || [];
    const latestHeartbeat = heartbeatRows?.[0] || null;
    const latest = readings[0] || null;
    const sensorFaultCount = readings.filter((row) => row.status === "SENSOR_FAULT").length;
    const contaminationCount = readings.filter((row) => row.status === "CONTAMINATION").length;
    const criticalCount = readings.filter((row) => row.status === "CRITICAL").length;
    const faultCount = sensorFaultCount + contaminationCount + criticalCount;
    const normalCount = readings.filter((row) => row.status === "NORMAL").length;
    const hardwareState = getHardwareState(latestHeartbeat);

    const averages = readings.length
      ? {
          ph: Number((readings.reduce((sum, row) => sum + row.ph, 0) / readings.length).toFixed(2)),
          temperature: Number(
            (readings.reduce((sum, row) => sum + row.temperature, 0) / readings.length).toFixed(2)
          ),
          residual_ph: Number(
            (readings.reduce((sum, row) => sum + Math.abs(row.residual_ph), 0) / readings.length).toFixed(3)
          ),
          residual_temperature: Number(
            (readings.reduce((sum, row) => sum + Math.abs(row.residual_temperature), 0) / readings.length).toFixed(3)
          ),
          kalman_gain_ph: Number(
            (readings.reduce((sum, row) => sum + Number(row.kalman_gain_ph || 0), 0) / readings.length).toFixed(4)
          ),
          kalman_gain_temperature: Number(
            (readings.reduce((sum, row) => sum + Number(row.kalman_gain_temperature || 0), 0) / readings.length).toFixed(4)
          ),
        }
      : {
          ph: 0,
          temperature: 0,
          residual_ph: 0,
          residual_temperature: 0,
          kalman_gain_ph: 0,
          kalman_gain_temperature: 0,
        };

    return res.json({
      success: true,
      data: {
        latest,
        latestHeartbeat,
        hardware: {
          connected: hardwareState.connected,
          status: hardwareState.status,
          deviceId: latestHeartbeat?.device_id || null,
          lastHeartbeatAt: latestHeartbeat?.created_at || null,
          firmwareVersion: latestHeartbeat?.firmware_version || null,
          ipAddress: latestHeartbeat?.ip_address || null,
        },
        totals: {
          readings: readings.length,
          faults: faultCount,
          sensorFaults: sensorFaultCount,
          contaminationAlerts: contaminationCount,
          criticalAlerts: criticalCount,
          normal: normalCount,
        },
        averages,
        chartData: readings.slice().reverse(),
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardStats,
};
