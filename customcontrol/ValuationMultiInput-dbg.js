/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
//for Template7, Template11
sap.ui.define(["sap/m/MultiInput",
	"sap/m/Token",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"i2d/qm/inspresults/records1/model/formatter"
], function(MultiInput, Token, JSONModel, ODataModel, Filter, Sorter, formatter) {
	return MultiInput.extend("i2d.qm.inspresults.records1.customcontrol.ValuationMultiInput", {
		metadata: {
			properties: {
				//A indicator used to judge if a removed token is a original one.
				"originalCount": {
					type: "int"
				},
				"validCount": {
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
		renderer: {},
		init: function() {
			this._bInitialLoading = true;
			//Define a token's object properties. when a new token is added.
			this.detailGeneralKeys = ["Inspectionresultattribute", "Inspspecrecordingtype", "Inspectionresulttext",
				"Insprsltfreedefinedtestequip",
				"Inspresultiteminternalid", "Inspectionresultoriginalvalue", "CharacteristicAttributeCode",
				"CharacteristicAttributeCodeGrp", "Inspectionresultmeasuredvalue", "Inspectionresultitem"
			];
			this.setRemovedItems([]);
			MultiInput.prototype.init.apply(this, arguments);
		},
		onBeforeRendering: function() {
			MultiInput.prototype.onBeforeRendering.apply(this, arguments);
		},
		onAfterRendering: function() {
			if (this._bInitialLoading) {
				var sLabelId = this.getParent().getContent()[0] && this.getParent().getContent()[0].getId();
				if (sLabelId) {
					this.addAriaLabelledBy(sLabelId);
				}
				this._oResourceBundle = this.getModel("i18n").getResourceBundle();
				this._valuationItems = [{
					ValuationKey: "A",
					ValuationName: this._oResourceBundle.getText("QM_ACCEPTED")
				}, {
					ValuationKey: "R",
					ValuationName: this._oResourceBundle.getText("QM_REJECTED")
				}];
				this._suggestModel = new JSONModel(this._valuationItems);
				this._valueHelpModel = new JSONModel(this._valuationItems);

				this.setModel(this._suggestModel, "suggestModel");
				this.setModel(this._valueHelpModel, "valueHelpModel");

				var oBindingData = this.getBindingContext() && this.getBindingContext().getObject() || {};
				//originalCount record the count of values on server originally, including the invalid ones
				this.setOriginalCount(oBindingData.Inspresultvaluecount);

				//validCount record the count of valid values.
				this.setValidCount(oBindingData.InspResultValidValuesNumber);

				//1.when user change the text and leave focus (blur),
				this.attachTokenUpdate(this._tokenUpdate);

				//2.when user is typing text (not blur),
				//should get suggest items form back-end and filter on front-end.
				this.attachSuggest(this._suggest);

				//3.when user click the "value help icon" on right side,
				//should get suggest items form server,  filter on front-end, and popup value help dialog
				this.attachValueHelpRequest(this._performValueHelp);

				//4.when user select form suggest item list,
				//should update the group and code
				this.attachSuggestionItemSelected(this._onSelect);

				this.attachChange(this._validator.bind(this));
				this.addValidator(this._validator.bind(this));

				this._bInitialLoading = false;
			}
			MultiInput.prototype.onAfterRendering.apply(this, arguments);
		},
		/**
		 * Callback for MultiInput token validation. 
		 * If input value is not a valid Accept/Reject string, just clear input, otherwise add new token.
		 */
		_validator: function(oArgs) {
			var sInputVal = oArgs.text ? oArgs.text.toLowerCase() : this.getValue().toLowerCase();
			var oBindingData = this.getBindingContext().getObject();
			var sAcceptedText = this._valuationItems[0].ValuationName;
			var sRejectedText = this._valuationItems[1].ValuationName;
			if (sInputVal === sAcceptedText.toLowerCase()) {
				sInputVal = sAcceptedText;
			} else if (sInputVal === sRejectedText.toLowerCase()) {
				sInputVal = sRejectedText;
			} else {
				this.setValue();
				return MultiInput.WaitForAsyncValidation;
			}
			// add token asynchronously
			if (oArgs.text) {
				// add token asynchronously
				var oToken = new Token({
					key: ++oBindingData.Inspresultvaluecount,
					text: sInputVal
				});
				oArgs.asyncCallback(oToken);
			}
			return MultiInput.WaitForAsyncValidation;
		},
		_tokenUpdate: function(oEvent) {
			var sEventType = oEvent.getParameter("type");
			var oType = sap.m.Tokenizer.TokenUpdateType;
			if (sEventType !== oType.Added && sEventType !== oType.Removed) {
				return;
			}
			if (!oEvent.getSource().getBindingContext() || !this.getBindingContext()) {
				return;
			}
			var aValues = this.getTokens().map(function(t) {
				return t.getText();
			});

			var oBindingData = this.getBindingContext() && this.getBindingContext().getObject() || {};
			var oToken;
			var sKey;
			var sText;
			var results = this.getBindingContext().getObject().to_ResultDetails.results4Binding;
			if (sEventType === oType.Added) {
				oToken = oEvent.getParameter("addedTokens")[0];
				sKey = oToken.getKey();
				sText = oToken.getText();
				var index = results.length;
				var oResultInPayload = {};
				this.detailGeneralKeys.forEach(function(sName) {
					oResultInPayload[sName] = oBindingData[sName] || "";
				});
				results[index] = oResultInPayload;
				var oResult = results[index];
				var sCode = "";
				this._valuationItems.forEach(function(v) {
					if (sText === v.ValuationName) {
						sCode = v.ValuationKey;
					}
				});
				oResult.Inspectionvaluationresult = sCode;
				oResult.Inspresultiteminternalid = "" + oBindingData.Inspresultvaluecount;
				this.setValidCount(this.getValidCount() + 1);
			} else if (sEventType === oType.Removed) {
				oToken = oEvent.getParameter("removedTokens")[0];
				sKey = oToken.getKey();
				sText = oToken.getText();
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
				var isOriginal = parseInt(oToken.getKey(), 10) <= this.getOriginalCount();
				if (isOriginal) {
					var removedItems = this.getRemovedItems();
					removedItems.push(JSON.parse(JSON.stringify(removedItem)));
				}
				this.setValidCount(this.getValidCount() - 1);
			}
			//Fire valueChange event and pass internal value to outer.
			this.fireValueChange({
				"values": aValues,
				"type": sEventType,
				"item": {
					"value": sText,
					"key": sKey
				}
			});
		},
		_suggest: function(oEvent) {
			//handleValuationSelectedHelpSearch
			this.getBinding("suggestionItems").filter(this._filterByValuationResult(oEvent.getParameter("suggestValue")));
		},
		_performValueHelp: function(oEvent) {
			//handleValuationValueHelp
			var sValue = this.getValue();

			if (!this._dialog) {
				this._dialog = sap.ui.xmlfragment(
					"i2d.qm.inspresults.records1.view.fragments.RecordResultsValuationDialog", this);
				this._dialog.setModel(this.valueHelpModel);
				this.addDependent(this._dialog);
			}

			if (this._dialog.getAggregation("_dialog") !== null) {
				this._dialog.getAggregation("_dialog").setProperty("draggable", true);
			}

			this._dialog.getBinding("items").filter(this._filterByValuationResult(sValue));
			this._dialog.open(sValue);

		},
		onSearch: function(oEvent) {
			//onValuationValueHelpSearch
			this._dialog.getBinding("items").filter(this._filterByValuationResult(oEvent.getParameter("value")));
		},
		reset: function() {
			var oBindingData = this.getBindingContext().getObject();
			this.setOriginalCount(oBindingData.Inspresultvaluecount);
			var aTokens = this.getTokens();

			for (var i in oBindingData.to_ResultDetails.results4Binding) {
				aTokens[i].setKey(oBindingData.to_ResultDetails.results4Binding[i].Inspresultiteminternalid);
			}
		},
		onConfirm: function(oEvent) {
			//onValuationValueHelpConfirm
			var aContexts = oEvent.getParameter("selectedContexts");
			var oBindingData = this.getBindingContext().getObject();
			aContexts.forEach(function(item) {
				var sKey = (++oBindingData.Inspresultvaluecount).toString();
				var sText = item.getObject().ValuationName;
				var results = this.getBindingContext().getObject().to_ResultDetails.results4Binding;
				var index = results.length;
				var oResultInPayload = {};
				this.detailGeneralKeys.forEach(function(sName) {
					oResultInPayload[sName] = oBindingData[sName] || "";
				});
				results[index] = oResultInPayload;
				var oResult = results[index];
				var sCode = "";
				this._valuationItems.forEach(function(v) {
					if (sText === v.ValuationName) {
						sCode = v.ValuationKey;
					}
				});
				oResult.Inspectionvaluationresult = sCode;
				oResult.Inspresultiteminternalid = "" + oBindingData.Inspresultvaluecount;
				this.setValidCount(this.getValidCount() + 1);
				this.addToken(new Token({
					key: sKey,
					text: sText
				}));
				var aValues = this.getTokens().map(function(t) {
					return t.getText();
				});

				this.fireValueChange({
					"values": aValues,
					"type": sap.m.Tokenizer.TokenUpdateType.Added,
					"item": {
						"value": sText,
						"key": sKey
					}
				});
			}.bind(this));
		},

		_filterByValuationResult: function(sValue) {
			var aFilters = [];
			if (sValue) {
				aFilters.push(new Filter("ValuationName", sap.ui.model.FilterOperator.Contains, sValue));
			}
			return aFilters;
		},
		_onSelect: function(oEvent) {
			var input = oEvent.getSource();
			//handleValuationSuggestionItemSingleSelected
			if (input.getValue()) {
				var oBindingData = input.getBindingContext().getObject();
				var sText = oEvent.getParameter("selectedItem") &&
					oEvent.getParameter("selectedItem").getProperty("text");
				if (sText) {
					var sKey = (++oBindingData.Inspresultvaluecount).toString();
					var results = input.getBindingContext().getObject().to_ResultDetails.results4Binding;
					var index = results.length;
					var oResultInPayload = {};
					input.detailGeneralKeys.forEach(function(sName) {
						oResultInPayload[sName] = oBindingData[sName] || "";
					});
					results[index] = oResultInPayload;
					var oResult = results[index];
					var sCode = "";
					input._valuationItems.forEach(function(v) {
						if (sText === v.ValuationName) {
							sCode = v.ValuationKey;
						}
					});
					oResult.Inspectionvaluationresult = sCode;
					oResult.Inspresultiteminternalid = "" + oBindingData.Inspresultvaluecount;
					this.setValidCount(input.getValidCount() + 1);

					var oTokenTemplate = new Token({
						key: sKey,
						text: sText
					});
					input.addToken(oTokenTemplate);
					input.setValue();
					var aValues = input.getTokens().map(function(t) {
						return t.getText();
					});

					input.fireValueChange({
						"values": aValues,
						"type": sap.m.Tokenizer.TokenUpdateType.Added,
						"item": {
							"value": sText,
							"key": sKey
						}
					});
				}

			}
		}

	});
});