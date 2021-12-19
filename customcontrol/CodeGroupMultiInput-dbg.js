/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
//for Template9
sap.ui.define(["sap/m/MultiInput",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/m/Token",
	"i2d/qm/inspresults/records1/model/formatter"
], function(MultiInput, JSONModel, Filter, Sorter, Token, formatter) {
	"use strict";
	return MultiInput.extend("i2d.qm.inspresults.records1.customcontrol.CodeGroupMultiInput", {
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
				}
			},
			events: {
				//Use this event to bind the view instead of MultiInput's tokenUpdate event.
				"valueChange": {}
			}
		},
		formatter: formatter,
		renderer: {},
		init: function() {
			this.setModel(new JSONModel({
				"results": []
			}), "suggestModel");
			this.setRemovedItems([]);
			this._bInitialLoading = true;
			MultiInput.prototype.init.apply(this, arguments);
		},
		onBeforeRendering: function() {
			if (!this.constructor.prototype.formatter._oResourceBundle) {
				this.constructor.prototype.formatter._oResourceBundle = this.getModel("i18n").getResourceBundle();

			}

			MultiInput.prototype.onBeforeRendering.apply(this, arguments);
		},

		onAfterRendering: function() {
			if (this._bInitialLoading) {
				this.options = null;
				this.tokens = [];
				var sLabelId = this.getParent().getContent()[0] && this.getParent().getContent()[0].getId();
				if (sLabelId) {
					this.addAriaLabelledBy(sLabelId);
				}
				this.attachSuggest(this._suggestion);
				this.attachSuggestionItemSelected(this._onSuggestionItemSelected);
				this.attachValueHelpRequest(this._performValueHelp);
				//Bind validator for new token added.
				this.addValidator(this._tokenValidator.bind(this));
				this.attachChange(this._tokenValidator.bind(this));
				//Bind token change event listener when tokens change.
				this.attachTokenUpdate(this._tokenUpdate);

				var oBindingData = this.getBindingContext() && this.getBindingContext().getObject() || {};
				//set originalCount value which used as a indicator to judge whether the removed token is within original value list. 
				this.setOriginalCount(oBindingData.Inspresultvaluecount);
				this._oDataModel = this.getModel("serviceModel");
				this._bInitialLoading = false;
			}

			MultiInput.prototype.onAfterRendering.apply(this, arguments);
		},
		/**
		 * Process suggestion filter.
		 */
		_suggestion: function(oEvent) {
			this.getModel("suggestModel").setProperty("/results", []);
			if (this.options) {
				this.getModel("suggestModel").setProperty("/results", this.options.results || []);

			} else {
				this._getOptions(oEvent, function() {
					this.getModel("suggestModel").setProperty("/results", this.options.results || []);
				}.bind(this));
			}

			this._filterByGrpCodeAndTxt.call(oEvent.getSource().getBinding("suggestionRows"), oEvent.getParameter("suggestValue"));
		},
		/**
		 * Handler for a item is selected from suggestion list.
		 */
		_onSuggestionItemSelected: function(oEvent) {
			var input = oEvent.getSource();
			if (input.getValue()) {
				var oBindingData = input.getBindingContext().getObject();

				var sKey = (++oBindingData.Inspresultvaluecount).toString();
				var oRow = oEvent.getParameter("selectedRow").getTable().getSelectedContexts()[0].getObject();

				var current = this._createEmptyResultObject();
				current.Inspresultiteminternalid = sKey + "";
				current.CharacteristicAttributeCodeGrp = oRow.CharacteristicAttributeCodeGrp;
				current.CharacteristicAttributeCode = oRow.CharacteristicAttributeCode;
				current.Inspectionvaluationresult = oRow.CharcAttributeValuation;

				oBindingData.to_ResultDetails.results4Binding.push(current);

				var sText = oRow.CharacteristicAttributeCodeGrp + " - " + oRow.CharacteristicAttributeCode;
				var oTokenTemplate = new Token({
					key: sKey,
					text: sText
				});
				input.addToken(oTokenTemplate);
				input.setValue();
				input.fireValueChange({
					"type": sap.m.Tokenizer.TokenUpdateType.Added,
					"removedItems": input.getRemovedItems(),
					"currentItem": current
				});
			}
		},
		/**
		 * Popup a value help dialog, when value help button is clicked.
		 */
		_performValueHelp: function(oEvent) {
			if (!this._valueHelpDialog) {

				this._valueHelpDialog = sap.ui.xmlfragment(
					"i2d.qm.inspresults.records1.view.fragments.RecordResultsCodeGroupDialog", this);
				//this._valueHelpDialog.setModel(this.options,"groupCodeVH");
				this.addDependent(this._valueHelpDialog);
				if (this._valueHelpDialog.getAggregation("_dialog") !== null) {
					this._valueHelpDialog.getAggregation("_dialog").setProperty("draggable", true);
				}
				if (!this.formatter._oResourceBundle || !this._oResourceBundle) {
					this._oResourceBundle = this.getModel("i18n").getResourceBundle();
					this.formatter._oResourceBundle = this._oResourceBundle;
				}
			}
			if (this.options) {
				this._valueHelpDialog.setModel(new JSONModel(this.options), "groupCodeVH");
				this._valueHelpDialog.open(this.getValue());
				//set busy Indicator
				this._valueHelpDialog.fireSearch({
					value: this.getValue()
				});
				//remove busy Indicator
				this._valueHelpDialog._oTable.removeStyleClass("sapMSelectDialogListHide");
				this._valueHelpDialog._oBusyIndicator.$().css("display", "none");
			} else {
				this._getOptions(oEvent, function() {

					this._valueHelpDialog.setModel(new JSONModel(this.options), "groupCodeVH");
					this._valueHelpDialog.fireSearch({
						value: this.getValue()
					});
					//remove busy Indicator
					this._valueHelpDialog._oTable.removeStyleClass("sapMSelectDialogListHide");
					this._valueHelpDialog._oBusyIndicator.$().css("display", "none");

				}.bind(this));

				this._valueHelpDialog.open(this.getValue());
				//set busy Indicator
				this._valueHelpDialog._oTable.addStyleClass("sapMSelectDialogListHide");
				this._valueHelpDialog._oBusyIndicator.$().css("display", "inline-block");
			}
		},
		/**
		 * Handler for a item is selected from value help dialog.
		 */
		onConfirm: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var oBindingData = this.getBindingContext().getObject();
			aContexts.forEach(function(item) {
				var current = this._createEmptyResultObject();
				current.Inspresultiteminternalid = ++oBindingData.Inspresultvaluecount + "";
				current.CharacteristicAttributeCodeGrp = item.getObject().CharacteristicAttributeCodeGrp;
				current.CharacteristicAttributeCode = item.getObject().CharacteristicAttributeCode;
				current.Inspectionvaluationresult = item.getObject().CharcAttributeValuation;

				oBindingData.to_ResultDetails.results4Binding.push(current);
				this.addToken(new Token({
					key: current.Inspresultiteminternalid,
					text: current.CharacteristicAttributeCodeGrp + " - " + current.CharacteristicAttributeCode
				}));

				this.fireValueChange({
					"type": sap.m.Tokenizer.TokenUpdateType.Added,
					"removedItems": this.getRemovedItems(),
					"currentItem": current
				});

			}.bind(this));
		},
		/**
		 * Search handler for value help dialog.
		 */
		onSearch: function(oEvent) {
			this._filterByGrpCodeAndTxt.call(oEvent.getSource().getBinding("items"), oEvent.getParameter("value"));
		},
		reset: function() {
			var oBindingData = this.getBindingContext().getObject();
			this.setOriginalCount(oBindingData.Inspresultvaluecount);
			var aTokens = this.getTokens();

			for (var i in oBindingData.to_ResultDetails.results4Binding) {
				aTokens[i].setKey(oBindingData.to_ResultDetails.results4Binding[i].Inspresultiteminternalid);
			}

		},
		/**
		 * Validator for new token added.
		 */
		_tokenValidator: function(oArgs) {
			var oBindingData = this.getBindingContext() && this.getBindingContext().getObject() || {};
			var current;
			var oOption;
			var sInputVal = oArgs.text ? oArgs.text.toUpperCase() : this.getValue().toUpperCase();
			var iIndexOfSplit = sInputVal.lastIndexOf("-");
			if (iIndexOfSplit <= 0) {
				this.setValue();
				return MultiInput.WaitForAsyncValidation;
			}
			oOption = this._findOptionByTokenString(sInputVal);

			if (!oOption) {
				this.setValue();
				return MultiInput.WaitForAsyncValidation;
			}
			if (oArgs.text) {
				current = this._createEmptyResultObject();
				current.Inspresultiteminternalid = ++oBindingData.Inspresultvaluecount + "";
				current.CharacteristicAttributeCodeGrp = oOption.CharacteristicAttributeCodeGrp;
				current.CharacteristicAttributeCode = oOption.CharacteristicAttributeCode;
				current.Inspectionvaluationresult = oOption.CharcAttributeValuation;

				oBindingData.to_ResultDetails.results4Binding.push(current);
				var oToken = new Token({
					key: current.Inspresultiteminternalid,
					text: current.CharacteristicAttributeCodeGrp + " - " + current.CharacteristicAttributeCode
				});
				oArgs.asyncCallback(oToken);
			}

			return MultiInput.WaitForAsyncValidation;

		},
		_tokenUpdate: function(oEvent) {
			var sEventType = oEvent.getParameter("type");
			var oToken;
			var oType = sap.m.Tokenizer.TokenUpdateType;
			var results = this.getBindingContext().getObject().to_ResultDetails.results4Binding;
			var current;
			if (sEventType === oType.Added) {
				oToken = oEvent.getParameter("addedTokens")[0];
				current = this._createEmptyResultObject();

				current.Inspresultiteminternalid = oToken.getKey();
				var sTokenText = oToken.getText().trim();
				current.CharacteristicAttributeCodeGrp = sTokenText.substr(0, sTokenText.lastIndexOf("-")).trim();
				current.CharacteristicAttributeCode = sTokenText.substr(sTokenText.lastIndexOf("-") + 1).trim();

				var sValuationResult = (results.length > 0) ? results[results.length - 1].Inspectionvaluationresult : "";
				current.Inspectionvaluationresult = sValuationResult;
				this.fireValueChange({
					"type": sEventType,
					"removedItems": this.getRemovedItems(),
					"currentItem": current
				});
			} else if (sEventType === oType.Removed) {
				oToken = oEvent.getParameter("removedTokens")[0];
				var index = results.length;
				for (var i = 0; i < results.length; i++) {
					var currentKey = parseInt(oToken.getKey(), 10);
					var itemKey = parseInt(results[i].Inspresultiteminternalid, 10);
					if (currentKey === itemKey) {
						index = i;
						break;
					}
				}
				current = results[index];
				results.splice(index, 1);
				if (parseInt(oToken.getKey(), 10) <= this.getOriginalCount()) {

					this.getRemovedItems().push(current);
				}
				//Fire valueChange event and pass internal value to outer.
				this.fireValueChange({
					"type": sEventType,
					"removedItems": this.getRemovedItems(),
					"currentItem": current
				});
			}
		},
		_getOptions: function(oEvent, callback) {

			if (!this.options) {
				var oSelectedCharItem = oEvent.getSource().getBindingContext().getObject();
				//var sSelectedCharItemsId = oEvent.getSource().getId();
				var aFiltersByAnd = [];
				aFiltersByAnd.push(new Filter("InspectionLot", sap.ui.model.FilterOperator.EQ, oSelectedCharItem.Inspectionlot));
				aFiltersByAnd.push(new Filter("InspPlanOperationInternalID", sap.ui.model.FilterOperator.EQ, oSelectedCharItem.Inspplanoperationinternalid));
				aFiltersByAnd.push(new Filter("InspectionCharacteristic", sap.ui.model.FilterOperator.EQ, oSelectedCharItem.Inspectioncharacteristic));
				this._oDataModel.read("/C_Chargroupcode_Valuehelp", {
					filters: aFiltersByAnd,
					sorters: [new Sorter("CharacteristicAttributeCode", false)],
					success: (function(oResponse) {
						//had requested data putting in an object to avoid requesting repeatedly.
						this.options = oResponse;
						if (callback) {
							callback();
						}
					}).bind(this)
				});
			}
		},
		_filterByGrpCodeAndTxt: function(sValue) {
			//1. if input text is empty, show all suggestion items
			if (!sValue) {
				this.filter([]);
				return;
			}

			//2. if input text contains "-", try to filter by to parts.
			if (sValue.indexOf("-") >= 0) {
				var sCodeGroup = sValue.substr(0, sValue.lastIndexOf("-"));
				var sCode = sValue.substr(sValue.lastIndexOf("-") + 1);
				var aSplitFilters = [
					new Filter("CharacteristicAttributeCodeGrp", sap.ui.model.FilterOperator.Contains, sCodeGroup.trim()),
					new Filter("CharacteristicAttributeCode", sap.ui.model.FilterOperator.Contains, sCode.trim())
				];
				this.filter(aSplitFilters);
				if (this.getLength()) {
					return;
				}
			}

			//3. if nothing match, try to filter as an entire string
			var entireValue = sValue.trim();
			var aEntireFilters = [new Filter({
				filters: [
					new Filter("CharacteristicAttributeCodeGrp", sap.ui.model.FilterOperator.Contains, entireValue),
					new Filter("CharacteristicAttributeCode", sap.ui.model.FilterOperator.Contains, entireValue),
					new Filter("CharacteristicAttributeCodeTxt", sap.ui.model.FilterOperator.Contains, entireValue)
				],
				and: false
			})];

			this.filter(aEntireFilters);
		},

		_findOptionByTokenString: function(sTokenText) {
			var sCodeGroup = sTokenText.substr(0, sTokenText.lastIndexOf("-"));
			var sCode = sTokenText.substr(sTokenText.lastIndexOf("-") + 1);
			var aNewGroupCodeVHModel = this.options.results.map(function(obj) {
				return obj.CharacteristicAttributeCodeGrp + " - " + obj.CharacteristicAttributeCode;
			});
			var iIndexOfCodeVHModel = aNewGroupCodeVHModel.indexOf(sCodeGroup.trim() + " - " + sCode.trim());
			if (iIndexOfCodeVHModel !== -1) {
				var oOptionObject = this.options.results[iIndexOfCodeVHModel];
				return oOptionObject;
			} else {
				return null;
			}
		},

		_createEmptyResultObject: function() {
			return {
				Inspectionresultattribute: "",
				Inspspecrecordingtype: "",
				Inspectionresulttext: "",
				Insprsltfreedefinedtestequip: "",
				Inspresultiteminternalid: "",
				Inspectionresultoriginalvalue: "",
				CharacteristicAttributeCode: "",
				CharacteristicAttributeCodeGrp: "",
				Inspectionvaluationresult: "",
				Inspectionresultmeasuredvalue: "",
				Inspectionresultitem: ""
			};
		}
	});
});