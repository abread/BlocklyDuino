goog.provide('Blockly.Arduino.cj2020');

goog.require('Blockly.Arduino');

function cjkit_include() {
  if (!Blockly.Arduino.definitions_['include_cjkit']) {
    Blockly.Arduino.definitions_['include_cjkit'] = `
#define CJKIT_VERSION 2
#include <CJKit.h>
`;
  }
}

Blockly.Arduino.base_delay = function() {
  cjkit_include();
  var delay_time = Blockly.Arduino.valueToCode(this, 'DELAY_TIME', Blockly.Arduino.ORDER_ATOMIC) || '1000'
  var code = 'CJKit::xdelay(' + delay_time + ');\n';
  return code;
};

function cj2020_gps_requirements() {
  cjkit_include();
  Blockly.Arduino.setups_['setup_output_6'] = `
#if CJKIT_VERSION < 2
pinMode(6, OUTPUT);
digitalWrite(6, HIGH);
#endif
`;

  // TODO: update
  Blockly.Arduino.definitions_['aaa_cj2020_gps'] = `
#include <TinyGPS++.h>

#define GPS_SERIAL CJKit::GPS_SERIAL
#define GPS_SERIAL_BAUD CJKit::GPS_BAUD_RATE

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
  cjkit_include();
  Blockly.Arduino.definitions_['define_cj2020_ds18b20'] = `
CJKit::TemperatureSensorBus temperatureBus;
`;

  Blockly.Arduino.setups_['setup_cj2020_ds18b20'] = `
  temperatureBus.begin();
  {
    uint8_t devCount = temperatureBus.deviceCount();
    Serial.print("temperatura: detetados ");
    Serial.print(devCount);
    Serial.println(" sensores ligados.");
    if (devCount == 0) {
      Serial.println("temperatura: provável FALHA na inicialização");
    }
  }
`;
}

Blockly.Arduino.cj2020_ds18b20 = function() {
  cj2020_ds18b20_requirements();
  Blockly.Arduino.definitions_['define_cj2020_ds18b20_legacy'] = `
    double ds18b20_legacy_read() {
      temperatureBus.requestTemperatures();
      return temperatureBus.readTemperatureCForIndex(0);
    }
  `;
  return [`ds18b20_legacy_read()`, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino.cj2020_ds18b20_requestTemperatures = function() {
  cj2020_ds18b20_requirements();
  return `temperatureBus.requestTemperatures();\n`;
};

Blockly.Arduino.cj2020_ds18b20_getTemperatureForIndex = function() {
  cj2020_ds18b20_requirements();

  const idx = this.getFieldValue('INDEX');
  return [`temperatureBus.readTemperatureCForIndex(${idx})`, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino.cj2020_ds18b20_setResolution = function() {
  cj2020_ds18b20_requirements();

  const res = this.getFieldValue('RESOLUTION');
  return `temperatureBus.setResolution(${res});\n`;
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

function cj2020_bmp180_requirements() {
  cjkit_include();
  Blockly.Arduino.definitions_['define_cj2020_bmp180'] = `
CJKit::Pressure pressure;
`;

  Blockly.Arduino.setups_['setup_cj2020_bmp180'] = `
  if (!pressure.begin()) {
    Serial.println("pressão: FALHA na inicialização");
  }
`;
}

Blockly.Arduino.cj2020_bmp180 = function() {
  cj2020_bmp180_requirements();
  return [`pressure.readPressurePa()`, Blockly.Arduino.ORDER_ATOMIC];
}

Blockly.Arduino.cj2020_bmp180_temperature = function() {
  cj2020_bmp180_requirements();
  return [`pressure.readTemperatureC()`, Blockly.Arduino.ORDER_ATOMIC];
}

function cj2020_radio_requirements() {
  cjkit_include();
  Blockly.Arduino.definitions_['cj2020_radio_define'] = `
CJKit::StreamedRadio<> radio;
`;

  Blockly.Arduino.setups_['cj2020_radio_setup'] = `
  if (!radio.begin()) {
    Serial.println("rádio: FALHA na inicialização");
  }
`;
}

Blockly.Arduino.cj2020_radio_setfreq = function() {
  cj2020_radio_requirements();

  const freq = this.getFieldValue('FREQ');
  return `radio.setFrequency(${freq});\n`;
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
