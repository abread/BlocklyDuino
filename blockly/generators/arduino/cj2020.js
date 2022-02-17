goog.provide('Blockly.Arduino.cj2020');

goog.require('Blockly.Arduino');

function minmax_macros() {
  Blockly.Arduino.definitions_['define_minmax_macros'] = `
#ifndef MIN
#define MIN(A, B) ((A) < (B) ? (A) : (B))
#endif
#ifndef MAX
#define MAX(A, B) ((A) > (B) ? (A) : (B))
#endif
`;
}

function xdelay_def(has_gps = false) {
  minmax_macros();

  if (!Blockly.Arduino.definitions_['aab_xdelay_gps'] || has_gps) {
    Blockly.Arduino.definitions_['aab_xdelay_gps'] = '/* using GPS */';
    Blockly.Arduino.definitions_['aab_xdelay'] = `
void xdelay(unsigned long d) {
  unsigned long startTime = millis();

  // parse pending gps data
  ${has_gps ? 'gps.parsePending();' : '// no gps present'}

  if (millis() < startTime + d) {
    delay(MIN(1, millis() - startTime - d));
  }
}
`;
  }
}

Blockly.Arduino.base_delay = function() {
  xdelay_def();
  var delay_time = Blockly.Arduino.valueToCode(this, 'DELAY_TIME', Blockly.Arduino.ORDER_ATOMIC) || '1000'
  var code = 'xdelay(' + delay_time + ');\n';
  return code;
};

function cj2020_gps_requirements() {
  Blockly.Arduino.setups_['setup_output_6'] = `
pinMode(6, OUTPUT);
digitalWrite(6, HIGH);
`
  Blockly.Arduino.definitions_['aaa_cj2020_gps'] = `
#include <TinyGPS++.h>

#define GPS_SERIAL Serial1
#define GPS_SERIAL_BAUD 9600

class Gps {
private:
  TinyGPSPlus _parser;
  unsigned long _lastNewMessage = 0;
public:
  void setup() {
    GPS_SERIAL.begin(GPS_SERIAL_BAUD);

    // try to get some info right at the start
    parsePending();
    delay(1000);
    parsePending();
  }

  void parsePending() {
    while (GPS_SERIAL.available()) {
      _parser.encode(GPS_SERIAL.read());
    }
  }

  double latitude() {
    return _parser.location.lat();
  }

  double longitude() {
    return _parser.location.lng();
  }

  unsigned long positionAge() {
    return _parser.location.age();
  }

  double courseDeg() {
    return _parser.course.deg();
  }

  unsigned long courseAge() {
    return _parser.course.age();
  }

  double speedMps() {
    return _parser.speed.mps();
  }

  unsigned long speedAge() {
    return _parser.speed.age();
  }

  double altitudeMeters() {
    return _parser.altitude.meters();
  }

  unsigned long altitudeAge() {
    return _parser.altitude.age();
  }
} gps;
`
  xdelay_def(true);

  Blockly.Arduino.setups_['setup_cj2020_gps'] = `
gps.setup();
`
}

Blockly.Arduino.cj2020_gps_latitude = function() {
  cj2020_gps_requirements();
  return [ 'gps.latitude()', Blockly.Arduino.ORDER_ATOMIC ];
}

Blockly.Arduino.cj2020_gps_longitude = function() {
  cj2020_gps_requirements();
  return [ 'gps.longitude()', Blockly.Arduino.ORDER_ATOMIC ];
}

Blockly.Arduino.cj2020_gps_pos_age = function() {
  cj2020_gps_requirements();
  return [ 'gps.positionAge()', Blockly.Arduino.ORDER_ATOMIC ];
}

Blockly.Arduino.cj2020_gps_course = function() {
  cj2020_gps_requirements();
  return [ 'gps.courseDeg()', Blockly.Arduino.ORDER_ATOMIC ];
}

Blockly.Arduino.cj2020_gps_course_age = function() {
  cj2020_gps_requirements();
  return [ 'gps.courseAge()', Blockly.Arduino.ORDER_ATOMIC ];
}

Blockly.Arduino.cj2020_gps_speed = function() {
  cj2020_gps_requirements();
  return [ 'gps.speedMps()', Blockly.Arduino.ORDER_ATOMIC ];
}

Blockly.Arduino.cj2020_gps_speed_age = function() {
  cj2020_gps_requirements();
  return [ 'gps.speedAge()', Blockly.Arduino.ORDER_ATOMIC ];
}

Blockly.Arduino.cj2020_gps_altitude = function() {
  cj2020_gps_requirements();
  return [ 'gps.altitudeMeters()', Blockly.Arduino.ORDER_ATOMIC ];
}

Blockly.Arduino.cj2020_gps_altitude_age = function() {
  cj2020_gps_requirements();
  return [ 'gps.altitudeAge()', Blockly.Arduino.ORDER_ATOMIC ];
}

Blockly.Arduino.cj2020_gps_parse_pending = function() {
  cj2020_gps_requirements();
  return `gps.parsePending();\n`;
}


function cj2020_ds18b20_requirements() {
  minmax_macros();
  xdelay_def();
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
      xdelay(MIN(1, DS18B20_MAX_CONVERSION_TIMEOUT - (millis() - _lastReq)));
    }

    _lastReq = 0;
  }

public:
  void setup() {
    _sensors.begin();
    _sensors.setWaitForConversion(false);
    _sensors.setResolution(9);

    Serial.print("Detetados ");
    Serial.print(_sensors.getDeviceCount());
    Serial.println(" sensores de temperatura DS18B20");
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
    double ds18b20_legacy_read() {
      temperature.requestTemperatures();
      return temperature.getTemperatureForIndex(0);
    }
  `;
  return [`ds18b20_legacy_read()`, Blockly.Arduino.ORDER_ATOMIC];
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

function cj2020_dht11_requirements() {
  Blockly.Arduino.definitions_['define_cj2020_dht11'] = `
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT11

class CJ_DHT {
private:
  DHT _sensor = DHT(DHT_PIN, DHT_TYPE);

public:
  void begin() {
    _sensor.begin();
  }

  float readTemperature() {
    return _sensor.readTemperature(false);
  }

  float readRelHumidity() {
    return _sensor.readHumidity();
  }
} dht;
`

  Blockly.Arduino.setups_['setup_cj2020_dht11'] = `dht.begin();\n`;
}

Blockly.Arduino.cj2020_dht11_readTemperature = function() {
  cj2020_dht11_requirements();
  return [`dht.readTemperature()`, Blockly.Arduino.ORDER_ATOMIC]
}

Blockly.Arduino.cj2020_dht11_readRelHumidity = function() {
  cj2020_dht11_requirements();
  return [`dht.readRelHumidity()`, Blockly.Arduino.ORDER_ATOMIC]
}

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
  minmax_macros();
  Blockly.Arduino.definitions_['cj2020_radio_define'] = `
#include <SPIFlash.h>
#include <RFM69.h>
#include <RFM69_ATC.h>

#define RADIO_SS_PIN 10
#define RADIO_IRQ_PIN 3
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
    Serial.write(_buffer, _buffer_len);
    Serial.println();
    _radio.send(RADIO_GROUNDSTATION_NODE_ID, _buffer, _buffer_len);
    _buffer_len = 0;
  }

  size_t write(uint8_t const* payload, int len) {
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
    return StreamedRFM::write(&c, 1);
  }

  int availableForWrite() {
    return buffer_space();
  }

  /* extra decimal places for floating point */
  size_t print(double d, int n = 5) {
    return Print::print(d, n);
  }

  size_t println(double d, int n = 5) {
    return Print::println(d, n);
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

  const content = Blockly.Arduino.valueToCode(this, 'CONTENT', Blockly.Arduino.ORDER_ATOMIC);
  return `radio.print(${content || ''});\n`;
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
