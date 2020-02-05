goog.provide('Blockly.Blocks.cj2020');

goog.require('Blockly.Blocks');

Blockly.Blocks['cj2020_ds18b20'] = {
  init: function() {
    this.setColour(10);
    this.appendDummyInput()
        .appendField("Lê temperatura (DS18B20)");
    this.setOutput(true, 'Number');
    this.setTooltip('devolve temperatura em ºC');
  }
};

Blockly.Blocks['cj2020_bmp180'] = {
  init: function() {
    this.setColour(10);
    this.appendDummyInput()
        .appendField("Ler pressão (BMP180)");
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
    this.setColour(230);
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
    this.setColour(230);
    this.appendValueInput("CONTENT", "String")
        .appendField("Rádio: escreve")
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Escreve dados para enviar no rádio como texto (codificado em ASCII)');
  }
};

Blockly.Blocks['cj2020_radio_println'] = {
  init: function() {
    this.setColour(230);
    this.appendValueInput("CONTENT", "String")
        .appendField("Rádio: escreve e muda de linha ")
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Escreve dados para enviar no rádio como texto (codificado em ASCII) e um caracter de mudança de linha no fim');
  }
};

Blockly.Blocks['cj2020_radio_flush'] = {
  init: function() {
    this.setColour(230);
    this.appendDummyInput().appendField("Rádio: flush()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Força o envio quaisquer dados ainda no buffer do rádio');
  }
};
