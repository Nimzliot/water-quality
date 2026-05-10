#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "";
const char* WIFI_PASSWORD = "";
const char* API_URL = "http://:5000/api/sensor/data";
const char* HEARTBEAT_URL = "http://:5000/api/sensor/heartbeat";
const char* DEVICE_ID = "ESP32-WQ-01";
const char* FIRMWARE_VERSION = "1.0.0";

const int PH_PIN = 34;
const int ONE_WIRE_BUS = 4;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

float readPhValue() {
  int rawValue = analogRead(PH_PIN);
  float voltage = rawValue * (3.3 / 4095.0);

 
  return 7.0 + ((2.5 - voltage) / 0.18);
}

void connectWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("WiFi connected");
}

void setup() {
  Serial.begin(115200);
  sensors.begin();
  analogReadResolution(12);
  connectWifi();
}

void postHeartbeat() {
  StaticJsonDocument<200> heartbeatDocument;
  heartbeatDocument["deviceId"] = DEVICE_ID;
  heartbeatDocument["firmwareVersion"] = FIRMWARE_VERSION;
  heartbeatDocument["status"] = "ONLINE";
  heartbeatDocument["ipAddress"] = WiFi.localIP().toString();

  String heartbeatBody;
  serializeJson(heartbeatDocument, heartbeatBody);

  HTTPClient heartbeatHttp;
  heartbeatHttp.begin(HEARTBEAT_URL);
  heartbeatHttp.addHeader("Content-Type", "application/json");
  int heartbeatCode = heartbeatHttp.POST(heartbeatBody);
  Serial.printf("Heartbeat HTTP %d\n", heartbeatCode);
  Serial.println(heartbeatHttp.getString());
  heartbeatHttp.end();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWifi();
  }

  postHeartbeat();

  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);
  float ph = readPhValue();

  StaticJsonDocument<200> jsonDocument;
  jsonDocument["ph"] = ph;
  jsonDocument["temperature"] = temperature;

  String requestBody;
  serializeJson(jsonDocument, requestBody);

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  int responseCode = http.POST(requestBody);
  String responseBody = http.getString();

  Serial.printf("HTTP %d\n", responseCode);
  Serial.println(responseBody);

  http.end();
  delay(5000);
}
