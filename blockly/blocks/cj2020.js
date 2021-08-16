goog.provide('Blockly.Blocks.cj2020');

goog.require('Blockly.Blocks');

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
        .appendField("DS18B20: Obter temperatura do sensor #")
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
        .appendField("BMP180: Ler pressão");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve pressão em Pa');
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
