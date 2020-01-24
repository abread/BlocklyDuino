goog.provide('Blockly.Arduino.cj2020');

goog.require('Blockly.Arduino');


Blockly.Arduino.cj2020_ds18b20 = function() {
  Blockly.Arduino.definitions_['define_cj2020_ds18b20'] = `
#include <OneWire.h>
#include <DallasTemperature.h>

#define TEMPERATURE_PIN 4

class Temperature {
  OneWire _bus = OneWire(TEMPERATURE_PIN);
  DallasTemperature _sensors = DallasTemperature(&_bus);
public:
  void setup() {
    _sensors.begin();

    if (_sensors.getDeviceCount() != 1) {
      Serial.print("Detetados ");
      Serial.print(_sensors.getDeviceCount());
      Serial.println(" sensores de temperatura (em vez de 1). Verifica as tuas ligações.");
    }
  }

  double read() {
    _sensors.requestTemperatures();
    return _sensors.getTempCByIndex(0);
  }
} temperature;
`;

  Blockly.Arduino.setups_['setup_cj2020_ds18b20'] = `
temperature.setup();
`

  return [`temperature.read()`, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino.cj2020_bmp180 = function() {
  Blockly.Arduino.definitions_['define_cj2020_bmp180'] = `
#include <Wire.h>
#include <Adafruit_BMP085.h>
class Pressure {
  Adafruit_BMP085 _bmp;

public:
  void setup() {
    if (!_bmp.begin()) {
      Serial.println("Sensor de pressão não encontrado. Verifica as tuas ligações.");
    }
  }

  double read() {
    _bmp.readTemperature(); // won't work without it, TODO: check if library takes care of this for us
    return _bmp.readPressure();
  }
} pressure;
`;

  Blockly.Arduino.setups_['setup_cj2020_bmp180'] = `
pressure.setup();
`

  return [`pressure.read()`, Blockly.Arduino.ORDER_ATOMIC];
}

function cj2020_radio_requirements() {
Blockly.Arduino.definitions_['cj2020_radio_define'] = `
#ifndef MIN
#define MIN(A, B) ((A) < (B) ? (A) : (B))
#endif
#ifndef MAX
#define MAX(A, B) ((A) > (B) ? (A) : (B))
#endif

#include <SPIFlash.h>
#include <RFM69.h>
#include <RFM69_ATC.h>

#define RADIO_SS_PIN 10
#define RADIO_IRQ_PIN 5
#define RADIO_FREQUENCY 433000000 // Hz
#define RADIO_NET_ID 100 // 0-255, must be the same on all nodes
#define RADIO_NODE_ID 2 // 0-254, must be unique in network, 255=broadcast
#define RADIO_GROUNDSTATION_NODE_ID 1 // same as above, the ground station
#define RADIO_ATC_RSSI -80
#define RADIO_SEND_RETRIES 2
#define RADIO_SEND_ACK_TIMEOUT 100 // in ms. TODO: calculate RTT+L/R for typical packet size (L) and 1km distance
#define RADIO_MAX_BUFFER_SIZE 61 // library limitation
class StreamedRFM : public Print {
  RFM69_ATC _radio = RFM69_ATC(RADIO_SS_PIN, RADIO_IRQ_PIN);
  uint8_t _buffer[RADIO_MAX_BUFFER_SIZE] = {0};
  uint8_t _buffer_len = 0;

public:
  void setup() {
    // Radio
    _radio.initialize(RF69_433MHZ, RADIO_NODE_ID, RADIO_NET_ID);
    _radio.setHighPower();
    _radio.encrypt(null);
    _radio.enableAutoPower(RADIO_ATC_RSSI);
    _radio.setFrequency(RADIO_FREQUENCY);
  }

  int buffer_space() {
    return RADIO_MAX_BUFFER_SIZE - _buffer_len;
  }

  void flush() {
    if (_buffer_len == 0) {
      return;
    }

    Serial.print("saída rádio: ");
    Serial.println((char*) _buffer);
    if(! _radio.sendWithRetry(RADIO_GROUNDSTATION_NODE_ID, _buffer, _buffer_len, RADIO_SEND_RETRIES, RADIO_SEND_ACK_TIMEOUT)) {
      Serial.println("Envio falhou, dados em buffer descartados");
    }

    _buffer_len = 0;
  }

  size_t write(uint8_t* payload, int len) {
    int i = 0;
    while (i < len) {
      if (buffer_space() == 0) {
        flush();
      }

      int sz = MIN(buffer_space(), len - i);
      memcpy(_buffer+_buffer_len, payload+i, sz);
      i += sz;
      _buffer_len += sz;
    }

    return len;
  }

  size_t write(uint8_t c) {
    write(&c, 1);
  }

  // safeguard in case people forget to flush
  size_t println() {
    Print::println();
    flush();
  }

  template<typename T>
  size_t println(T a) {
    Print::println(a);
    flush();
  }

  template<typename T, typename T2>
  size_t println(T a, T2 b) {
    Print::println(a, b);
    flush();
  }
} radio;
`;

  Blockly.Arduino.setups_['cj2020_radio_setup'] = 'radio.setup();\n';
}

Blockly.Arduino.cj2020_radio_print = function() {
  cj2020_radio_requirements();

  const content = Blockly.Arduino.valueToCode(this, 'CONTENT', Blockly.Arduino.ORDER_ATOMIC) || '0';
  return `radio.print(${content});\n`;
};

Blockly.Arduino.cj2020_radio_println = function() {
  cj2020_radio_requirements();

  const content = Blockly.Arduino.valueToCode(this, 'CONTENT', Blockly.Arduino.ORDER_ATOMIC) || '0';
  return `radio.println(${content});\n`;
};

Blockly.Arduino.cj2020_radio_flush = function() {
  cj2020_radio_requirements();
  return `radio.flush();\n`;
};
