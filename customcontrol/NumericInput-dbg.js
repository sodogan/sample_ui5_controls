/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
//for Template1,Template2
sap.ui.define([
	"sap/m/Input",
	"i2d/qm/inspresults/records1/util/NumberFormat",
	"i2d/qm/inspresults/records1/model/formatter"
], function(Input, NumberFormat, formatter) {
	"use strict";
	return Input.extend("i2d.qm.inspresults.records1.customcontrol.NumericInput", {
		metadata: {
			properties: {
				"actualValue": {
					type: "any"
				},
				"decimalPlaces": {
					type: "int"
				}
			},
			events: {
				"numericChange": {}
			}
		},
		renderer: {},
		init: function() {
			this._bInitialLoading = true;
			Input.prototype.init.apply(this, arguments);
		},
		onBeforeRendering: function() {
			Input.prototype.onBeforeRendering.apply(this, arguments);
		},
		onAfterRendering: function() {
			if (this.getActualValue() !== "") {
				var formattedValue = formatter.quantityFormatter(this.getActualValue(), this.getDecimalPlaces());
				this.setValue(formattedValue);
			}
			if (this._bInitialLoading) {
				this._oResourceBundle = this.getModel("i18n").getResourceBundle();
				this.attachChange(this._recalculate);
				this._bInitialLoading = false;
			}
			var oDefaultLabel = $("#" + this.getId() + "-labelledby");
			if (oDefaultLabel && oDefaultLabel.length) {
				var sLabel = this.getParent().getContent()[0] && this.getParent().getContent()[0].getText();
				oDefaultLabel.text(sLabel);
			}
			Input.prototype.onAfterRendering.apply(this, arguments);
		},
		_recalculate: function(oEvent) {
			var sText = this.getValue();
			// To check if it is a number
			var intValue = parseInt(sText, 10);
			if (intValue > 999999999999999) {
				return;
			} else {
				var fValue = NumberFormat.getFloatInstance().parse(sText);
				if (isNaN(fValue)) {
					this.setValue("");
					this.setActualValue("");
					var sErrorMessage = this._oResourceBundle.getText("QM_ENTER_MEAN_VALUE");
					this.setValueStateText(sErrorMessage);
					this.setValueState("Error");
				} else {
					var sFormattedValue = formatter.quantityFormatter(fValue, this.getDecimalPlaces());
					this.setValue(sFormattedValue);
					this.setActualValue(NumberFormat.getFloatInstance().parse(sFormattedValue));
					this.setValueStateText("");
					this.setValueState("None");
				}

				this.fireNumericChange({
					value: this.getActualValue()
				});
			}
		}
	});
});