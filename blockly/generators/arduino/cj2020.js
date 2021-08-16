goog.provide('Blockly.Arduino.cj2020');

goog.require('Blockly.Arduino');

function cj2020_minmax_macros() {
  Blockly.Arduino.definitions_['define_minmax_macros'] = `
#ifndef MIN
#define MIN(A, B) ((A) < (B) ? (A) : (B))
#endif
#ifndef MAX
#define MAX(A, B) ((A) > (B) ? (A) : (B))
#endif
`;
}

function cj2020_ds18b20_requirements() {
  cj2020_minmax_macros();
  Blockly.Arduino.definitions_['define_cj2020_ds18b20'] = `
#include <OneWire.h>
#include <DallasTemperature.h>

#define TEMPERATURE_PIN 4
#define DS18B20_MAX_CONVERSION_TIMEOUT 750 /* from library */

class Temperature {
private:
  OneWire _bus = OneWire(TEMPERATURE_PIN);
  DallasTemperature _sensors = DallasTemperature(&_bus);
  unsigned long _lastReq = 0;

  void _blockTillConversionComplete() {
    if (_lastReq == 0) { // equivalent to completed conversion
      return;
    }

    while (!_sensors.isConversionComplete() && (millis() - _lastReq < DS18B20_MAX_CONVERSION_TIMEOUT)) {
      delay(MIN(1, DS18B20_MAX_CONVERSION_TIMEOUT - (millis() - _lastReq)));
    }

    _lastReq = 0;
  }

public:
  void setup() {
    _sensors.begin();
    _sensors.setWaitForConversion(false);
    _sensors.setResolution(9);

    if (_sensors.getDeviceCount() != 1) {
      Serial.print("Detetados ");
      Serial.print(_sensors.getDeviceCount());
      Serial.println(" sensores de temperatura (em vez de 1). Verifica as tuas ligações.");
    }
  }

  void setResolution(uint8_t res) {
    _sensors.setResolution(res);
  }

  void requestTemperatures() {
    _sensors.requestTemperatures();
    _lastReq = millis();
  }

  double getTemperatureForIndex(uint8_t idx) {
    _blockTillConversionComplete();
    return _sensors.getTempCByIndex(idx);
  }
} temperature;
`;

  Blockly.Arduino.setups_['setup_cj2020_ds18b20'] = `
temperature.setup();
`
}

Blockly.Arduino.cj2020_ds18b20 = function() {
  cj2020_ds18b20_requirements();
  Blockly.Arduino.definitions_['define_cj2020_ds18b20_legacy'] = `
    double ds18b20_legacy_read(Temperature& temperature) {
      temperature.requestTemperatures();
      return temperature.getTemperatureForIndex(0);
    }
  `;
  return [`ds18b20_legacy_read(temperature)`, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino.cj2020_ds18b20_requestTemperatures = function() {
  cj2020_ds18b20_requirements();
  return `temperature.requestTemperatures();\n`;
};

Blockly.Arduino.cj2020_ds18b20_getTemperatureForIndex = function() {
  cj2020_ds18b20_requirements();

  const idx = this.getFieldValue('INDEX');
  return [`temperature.getTemperatureForIndex(${idx})`, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino.cj2020_ds18b20_setResolution = function() {
  cj2020_ds18b20_requirements();

  const res = this.getFieldValue('RESOLUTION');
  return `temperature.setResolution(${res});\n`;
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
cj2020_minmax_macros();
Blockly.Arduino.definitions_['cj2020_radio_define'] = `
#include <SPIFlash.h>
#include <RFM69.h>
#include <RFM69_ATC.h>

#define RADIO_SS_PIN 10
#define RADIO_IRQ_PIN 5
#define RADIO_NET_ID 100 // 0-255, must be the same on all nodes
#define RADIO_NODE_ID 2 // 0-254, must be unique in network, 255=broadcast
#define RADIO_GROUNDSTATION_NODE_ID 1 // same as above, the ground station
#define RADIO_ATC_RSSI -80
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
  }

  void setFrequency(uint32_t freq) {
    _radio.setFrequency(freq);
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
    _radio.send(RADIO_GROUNDSTATION_NODE_ID, _buffer, _buffer_len);
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
    return write(&c, 1);
  }

  // safeguard in case people forget to flush
  size_t println() {
    size_t ret = Print::println();
    flush();
    return ret;
  }

  template<typename T>
  size_t println(T a) {
    size_t ret = Print::println(a);
    flush();
    return ret;
  }

  template<typename T, typename T2>
  size_t println(T a, T2 b) {
    size_t ret = Print::println(a, b);
    flush();
    return ret;
  }
} radio;
`;

  Blockly.Arduino.setups_['cj2020_radio_setup'] = 'radio.setup();\n';
}

Blockly.Arduino.cj2020_radio_setfreq = function() {
  cj2020_radio_requirements();

  const freq = this.getFieldValue('FREQ');
  return `radio.setFrequency(${freq});\n`
}

Blockly.Arduino.cj2020_radio_print = function() {
  cj2020_radio_requirements();

  const content = Blockly.Arduino.valueToCode(this, 'CONTENT', Blockly.Arduino.ORDER_ATOMIC) || 'ERRO A OBTER VALOR';
  return `radio.print(${content});\n`;
};

Blockly.Arduino.cj2020_radio_println = function() {
  cj2020_radio_requirements();

  const content = Blockly.Arduino.valueToCode(this, 'CONTENT', Blockly.Arduino.ORDER_ATOMIC);
  return `radio.println(${content || ''});\n`;
};

Blockly.Arduino.cj2020_radio_flush = function() {
  cj2020_radio_requirements();
  return `radio.flush();\n`;
};
