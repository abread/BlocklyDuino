goog.provide('Blockly.Blocks.cj2020');

goog.require('Blockly.Blocks');

Blockly.Blocks['base_delay'] = {
  helpUrl: 'http://arduino.cc/en/Reference/delay',
  init: function() {
    this.setColour(120);
    this.appendValueInput("DELAY_TIME", 'Number')
        .appendField("Pausa durante")
        .setCheck('Number');
    this.appendDummyInput().appendField('ms');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Pausa execução durante o tempo especificado (em ms)');
  }
};

Blockly.Blocks['cj2020_gps_latitude'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("GPS: Ler latitude");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve última latitude medida (graus)');
  }
};

Blockly.Blocks['cj2020_gps_longitude'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("GPS: Ler longitude");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve última longitude medida (graus)');
  }
};

Blockly.Blocks['cj2020_gps_pos_age'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("GPS: Ler idade da posição");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve instante em que foi recebida a última latitude/longitude do GPS (milissegundos)');
  }
};

Blockly.Blocks['cj2020_gps_course'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("GPS: Ler direção");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve última direção medida (graus)');
  }
};

Blockly.Blocks['cj2020_gps_course_age'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("GPS: Ler idade da direção");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve instante em que foi recebida a última direção do GPS (milissegundos)');
  }
};

Blockly.Blocks['cj2020_gps_speed'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("GPS: Ler velocidade (m/s)");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve última velocidade medida (metros por segundo)');
  }
};

Blockly.Blocks['cj2020_gps_speed_age'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("GPS: Ler idade da velocidade");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve instante em que foi recebida a última velocidade do GPS (milissegundos)');
  }
};

Blockly.Blocks['cj2020_gps_altitude'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("GPS: Ler altitude (m)");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve última altitude medida (metros)');
  }
};

Blockly.Blocks['cj2020_gps_altitude_age'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("GPS: Ler idade da altitude");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve instante em que foi recebida a última altitude do GPS (milissegundos)');
  }
};

Blockly.Blocks['cj2020_gps_parse_pending'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("GPS: Processar dados pendentes");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('lê e processa informação enviada do GPS (até não haver mais pendente)');
  }
};

Blockly.Blocks['cj2020_ds18b20'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("DS18B20: Pedir medição e obter temperatura do sensor #0");
    this.setOutput(true, 'Number');
    this.setTooltip('inicia medição de temperatura em todos os DS18B20 ligados e obtém leitura do sensor #0');
  }
};

Blockly.Blocks['cj2020_ds18b20_requestTemperatures'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("DS18B20: Pedir medição de temperatura");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('inicia medição de temperatura em todos os DS18B20 ligados');
  }
};

function idx_validator(text) {
	const n = Number(text);
	if (Number.isInteger(n) && Number(n) >= 0) {
		return String(n);
	}
	return null;
}

function ds18b20_resolution_validator(text) {
	if (text == '9' || text == '10' || text == '11' || text == '12') {
		return text;
	}
	return null;
}

Blockly.Blocks['cj2020_ds18b20_getTemperatureForIndex'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("DS18B20: Ler temperatura (ºC) do sensor #")
        .appendField(new Blockly.FieldTextInput("0", idx_validator), "INDEX");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve temperatura em ºC');
  }
};

Blockly.Blocks['cj2020_ds18b20_setResolution'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("DS18B20: Definir resolução para")
        .appendField(new Blockly.FieldTextInput("9", ds18b20_resolution_validator), "RESOLUTION")
        .appendField("bits");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('define resolução de todos os DS18B20 ligados (9, 10, 11 ou 12 bits)');
  }
};

Blockly.Blocks['cj2020_dht11_readTemperature'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("DHT11: Ler temperatura");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve temperatura medida pelo DHT11 em ºC');
  }
};

Blockly.Blocks['cj2020_dht11_readRelHumidity'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("DHT11: Ler humidade relativa");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve humidade relativa medida pelo DHT11 (número entre 0.0 e 1.0)');
  }
};

Blockly.Blocks['cj2020_bmp180'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("BMP180: Ler pressão (Pa)");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve pressão em Pa');
  }
};

Blockly.Blocks['cj2020_bmp180_temperature'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("BMP180: Ler temperatura (ºC)");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve temperatura em ºC');
  }
};

function freq_validator(text) {
	const n = Number(text);
	if (Number.isInteger(n) && Number(n) >= 424000000 && Number(n) <= 510000000) {
		return String(n);
	}
	return null;
}

Blockly.Blocks['cj2020_radio_setfreq'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput()
        .appendField("Rádio: definir frequência para")
        .appendField(new Blockly.FieldTextInput("433000000", freq_validator), "FREQ")
        .appendField("Hz");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("Define frequência base do rádio para o valor especificado em Hz");
  }
};

Blockly.Blocks['cj2020_radio_print'] = {
  init: function() {
    this.setColour(190);
    this.appendValueInput("CONTENT", "String")
        .appendField("Rádio: escreve")
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Escreve dados para enviar no rádio como texto (codificado em ASCII)');
  }
};

Blockly.Blocks['cj2020_radio_println'] = {
  init: function() {
    this.setColour(190);
    this.appendValueInput("CONTENT", "String")
        .appendField("Rádio: escreve e muda de linha")
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Escreve dados para enviar no rádio como texto (codificado em ASCII) e um caracter de mudança de linha no fim');
  }
};

Blockly.Blocks['cj2020_radio_flush'] = {
  init: function() {
    this.setColour(190);
    this.appendDummyInput().appendField("Rádio: forçar envio");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Força o envio quaisquer dados ainda no buffer do rádio (flush)');
  }
};
