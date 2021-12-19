/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
//for Template3,Template4
sap.ui.define([
	"sap/m/MultiInput",
	"sap/m/Token",
	"i2d/qm/inspresults/records1/util/NumberFormat",
	"i2d/qm/inspresults/records1/model/formatter",
	"i2d/qm/inspresults/records1/util/CalculationHelper",
], function(MultiInput, Token, NumberFormat, formatter, CalculationHelper) {
	"use strict";
	return MultiInput.extend("i2d.qm.inspresults.records1.customcontrol.NumericMultiInput", {
		metadata: {
			properties: {
				//A indicator used to judge if a removed token is a original one.
				"originalCount": {
					type: "int"
				},
				//An array to store all removed original tokens.
				"removedItems": {
					type: "object",
					defaultValue: []
				},
			},
			events: {
				//Use this event to bind the view instead of MultiInput's tokenUpdate event.
				"numericChange": {}
			}
		},
		renderer: {},
		init: function() {
			this._bInitialLoading = true;
			//Define a token's object properties. when a new token is added.
			this.detailGeneralKeys = ["Inspectionresultattribute", "Inspspecrecordingtype", "Inspectionresulttext", "Insprsltfreedefinedtestequip",
				"Inspresultiteminternalid", "Inspectionresultoriginalvalue", "CharacteristicAttributeCode",
				"CharacteristicAttributeCodeGrp", "Inspectionresultmeasuredvalue", "Inspectionresultitem"
			];
			this.setRemovedItems([]);
			MultiInput.prototype.init.apply(this, arguments);
		},
		onBeforeRendering: function() {
			MultiInput.prototype.onBeforeRendering.apply(this, arguments);
		},
		reset: function() {
			var oBindingData = this.getBindingContext().getObject();
			this.setOriginalCount(oBindingData.Inspresultvaluecount);
			var aTokens = this.getTokens();

			for (var i in oBindingData.to_ResultDetails.results4Binding) {
				aTokens[i].setKey(oBindingData.to_ResultDetails.results4Binding[i].Inspresultiteminternalid);
			}
		},
		calculationHelper: CalculationHelper,
		/**
		 * Callback for MultiInput token validation. 
		 * If input value is not a number, just clear input, otherwise add new token.
		 */
		_validator: function(oArgs) {
			var sInputVal = oArgs.text;
			var oBindingData = this.getBindingContext().getObject();
			// To check if it is a number
			var fValue = NumberFormat.getFloatInstance().parse(sInputVal);
			if (isNaN(fValue) || fValue > 999999999.99) {
				this.setValueState("Error");
				//this.setValue();
				return false;
			} else {
				sInputVal = NumberFormat.getFloatInstance().format(fValue);
				this.setValueState("None");
			}

			var oToken = new Token({
				key: ++oBindingData.Inspresultvaluecount,
				text: sInputVal
			});
			// add token asynchronously
			oArgs.asyncCallback(oToken);
			return MultiInput.WaitForAsyncValidation;
		},
		_tokenUpdate: function(oEvent) {
			var oType = sap.m.Tokenizer.TokenUpdateType;
			var sEventType = oEvent.getParameter("type");
			var oToken;
			if (sEventType === oType.Removed) {
				oToken = oEvent.getParameter("removedTokens")[0];
			} else if (sEventType === oType.Added) {
				oToken = oEvent.getParameter("addedTokens")[0];
			} else {
				return;
			}

			var oBindingData = this.getBindingContext() && this.getBindingContext().getObject() || {};
			var oFloatFormatter = NumberFormat.getFloatInstance({
				decimals: oBindingData.Inspspecdecimalplaces
			});

			//value of current token
			var sValue = "";
			if (oToken && oToken.getText()) {
				//format the input as expected based on the locale and decimal place
				sValue = oFloatFormatter.format(oFloatFormatter.parse(oToken.getText()));
				oToken.setText(sValue);
			}

			//Transform all token text to float type data.
			var aValues = this.getTokens().map(function(t) {
				return oFloatFormatter.parse(t.getText());
			});

			if (!this.getBindingContext()) {
				return;
			}
			var results = this.getBindingContext().getObject().to_ResultDetails.results4Binding;
			var index;
			if (sEventType === oType.Added) {
				//If new token added, create new object for this token and push it to result list.
				index = results.length;
				var oResultInPayload = {};
				this.detailGeneralKeys.forEach(function(sName) {
					oResultInPayload[sName] = oBindingData[sName] || "";
				});

				results[index] = oResultInPayload;
				results[index].Inspectionresultoriginalvalue = sValue;
				results[index].Inspectionresultmeasuredvalue = sValue;
				results[index].Inspresultiteminternalid = "" + oBindingData.Inspresultvaluecount;
			} else if (sEventType === oType.Removed) {
				//If a token was removed, remove the object from value list.
				for (var i = 0; i < results.length; i++) {
					var currentKey = parseInt(oToken.getKey(), 10);
					var itemKey = parseInt(results[i].Inspresultiteminternalid, 10);
					if (currentKey === itemKey) {
						index = i;
						break;
					}
				}
				var removedItem = results[index];
				results.splice(index, 1);
				//if removed value is original value, put the object into removedItems, then outer controller will know which one was removed.
				var isOriginal = parseInt(oToken.getKey(), 10) <= this.getOriginalCount();
				if (isOriginal) {
					var removedItems = this.getRemovedItems();
					removedItems.push(JSON.parse(JSON.stringify(removedItem)));
				}
			}
			//Fire numericChange event and pass internal value to outer.
			this.fireNumericChange({
				"values": aValues,
				"type": sEventType,
				"item": {
					"formattedValue": sValue,
					"value": oFloatFormatter.parse(oToken.getText()),
					"key": oToken.getKey(),
				}
			});
		},
		onAfterRendering: function() {
			if (this._bInitialLoading) {
				//Fix accessability issue:Input label should be read out by machine when focus on.
				var sLabelId = this.getParent().getContent()[0] && this.getParent().getContent()[0].getId();
				if (sLabelId) {
					this.addAriaLabelledBy(sLabelId);
				}
				//Bind validator for new token added.
				this.addValidator(this._validator.bind(this));
				//Bind token change event listener when tokens change.
				this.attachTokenUpdate(this._tokenUpdate);
				var oBindingData = this.getBindingContext() && this.getBindingContext().getObject() || {};
				//set originalCount value which used as a indicator to judge whether the removed token is within original value list. 
				this.setOriginalCount(oBindingData.Inspresultvaluecount);
				this._bInitialLoading = false;
			}
			MultiInput.prototype.onAfterRendering.apply(this, arguments);
		}
	});
});