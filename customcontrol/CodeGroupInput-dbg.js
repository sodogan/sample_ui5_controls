/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
//for Template8
sap.ui.define(["sap/m/Input",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"i2d/qm/inspresults/records1/model/formatter"
], function(Input, JSONModel, ODataModel, Filter, Sorter, formatter) {
	"use strict";
	return Input.extend("i2d.qm.inspresults.records1.customcontrol.CodeGroupInput", {
		metadata: {
			properties: {
				"codeGroup": {
					type: "string"
				},
				"code": {
					type: "string"
				}
			},
			events: {
				"valueChange": {}
			}
		},
		onSearch: function(oEvent) {
			this._filterByGrpCodeAndTxt.call(oEvent.getSource().getBinding("items"), oEvent.getParameter("value"));
		},
		onConfirm: function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts.length) {
				var sGroup = aContexts[0].getObject()[this._bindingPath.codeGroup];
				var sCode = aContexts[0].getObject()[this._bindingPath.code];
				var sText = this.formatter.rrGroupCodeDisplay(sGroup, sCode);
				this.setValue(sText);
				this.setCodeGroup(sGroup);
				this.setCode(sCode);
				this.fireValueChange({
					"codeGroup": sGroup,
					"code": sCode,
					"valuation": aContexts[0].getObject().CharcAttributeValuation

				});
			}
		},
		renderer: {},
		init: function() {
			this.setModel(new JSONModel({
				"results": []
			}), "suggestModel");
			this._bInitialLoading = true;
			Input.prototype.init.apply(this, arguments);
		},
		formatter: formatter,
		onBeforeRendering: function() {
			Input.prototype.onBeforeRendering.apply(this, arguments);
		},
		onAfterRendering: function() {
			if (this._bInitialLoading) {
				// var sLabelId = this.getParent().getContent()[0] && this.getParent().getContent()[0].getId();
				// if (sLabelId) {
				// 	this.addAriaLabelledBy(sLabelId);
				// }
				if (!this.formatter._oResourceBundle || !this._oResourceBundle) {
					this._oResourceBundle = this.getModel("i18n").getResourceBundle();
					this.formatter._oResourceBundle = this._oResourceBundle;
				}
				var sFormattedValue = this.formatter.rrGroupCodeDisplay(this.getCodeGroup(), this.getCode());
				this.setValue(sFormattedValue);
				this._bindingPath = {
					"code": this.getBinding("code").getPath(),
					"codeGroup": this.getBinding("codeGroup").getPath()
				};

				//1.when user change the text and leave focus (blur),
				//should validate the input text, and update the "codeGroup" and "code" property
				this.attachChange(this._onType);

				//2.when user is typing text (not blur),
				//should get suggest items form back-end and filter on front-end.
				this.attachSuggest(this._suggest);

				//3.when user click the "value help icon" on right side,
				//should get suggest items form server,  filter on front-end, and popup value help dialog
				this.attachValueHelpRequest(this._performValueHelp);

				//4.when user select form suggest item list,
				//should update the group and code
				this.attachSuggestionItemSelected(this._onSelect);
				this._oDataModel = this.getModel("serviceModel");
				this._bInitialLoading = false;
			}
			var oDefaultLabel = $("#" + this.getId() + "-labelledby");
			if (oDefaultLabel && oDefaultLabel.length) {
				var sLabel = this.getParent().getContent()[0] && this.getParent().getContent()[0].getText();
				oDefaultLabel.text(sLabel);
			}
			Input.prototype.onAfterRendering.apply(this, arguments);
		},
		_suggest: function(oEvent) {
			this.getModel("suggestModel").setProperty("/results", []);
			if (this._vHMap) {
				this.getModel("suggestModel").setProperty("/results", this._vHMap.results || []);
			} else {
				this._getAllValueHelp(oEvent, function() {
					this.getModel("suggestModel").setProperty("/results", this._vHMap.results || []);
				}.bind(this));
			}
			(this._filterByGrpCodeAndTxt.call(this.getBinding("suggestionRows"), oEvent.getParameter("suggestValue")));
		},
		_performValueHelp: function(oEvent) {
			//var oSelectedItem = this.getBindingContext().getObject();
			var sText = this.getValue();
			if (!this._dialog) {
				this._dialog = sap.ui.xmlfragment(
					"i2d.qm.inspresults.records1.view.fragments.RecordResultsCodeGroupDialog", this);
				this.addDependent(this._dialog);
				if (this._dialog.getAggregation("_dialog") !== null) {
					this._dialog.getAggregation("_dialog").setProperty("draggable", true);
				}
			} else {
				this._dialog.removeAllItems();
			}
			if (this._vHMap) {
				this._dialog.setModel(new JSONModel(this._vHMap), "groupCodeVH");
				this._dialog.fireSearch({
					value: sText
				});
				this._dialog.open(sText);
			} else {
				var updateTable = function(result) {
					//had requested data putting in an object to avoid requesting repeatedly.
					//this._vHMap = oResponse;
					this._dialog.setModel(new JSONModel(this._vHMap), "groupCodeVH");
					this._dialog.fireSearch({
						value: sText
					});
					//remove busy Indicator
					this._dialog._oTable.removeStyleClass("sapMSelectDialogListHide");
					this._dialog._oBusyIndicator.$().css("display", "none");
				}.bind(this);
				this._getAllValueHelp(oEvent, updateTable);
				this._dialog.open(sText);

				//set busy Indicator
				this._dialog._oTable.addStyleClass("sapMSelectDialogListHide");
				this._dialog._oBusyIndicator.$().css("display", "inline-block");
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
		_filterByLotIdInternalIdAndChar: function(oSelectedItem) {
			var aFiltersByAnd = [];
			aFiltersByAnd.push(new sap.ui.model.Filter("InspectionLot", sap.ui.model.FilterOperator.EQ, oSelectedItem.Inspectionlot));
			aFiltersByAnd.push(new sap.ui.model.Filter("InspPlanOperationInternalID", sap.ui.model.FilterOperator.EQ, oSelectedItem.Inspplanoperationinternalid));
			aFiltersByAnd.push(new sap.ui.model.Filter("InspectionCharacteristic", sap.ui.model.FilterOperator.EQ, oSelectedItem.Inspectioncharacteristic));
			return aFiltersByAnd;
		},
		_splitCodeAndGroup: function(sValue, sSplitRule) {
			var iIndex = sValue.lastIndexOf(sSplitRule);
			var aValues = [];
			if (iIndex !== -1) {
				// e.g. COLA-A - 1
				// get COLA-A
				aValues.push(sValue.substring(0, iIndex));
				// get 1. +3 to ignore " - "
				aValues.push(sValue.substring(iIndex + sSplitRule.length, sValue.length));
			} else {
				aValues.push(sValue);
			}
			return aValues;
		},

		_getAllValueHelp: function(oEvent, callback) {
			var oSelectedCharItem = this.getBindingContext().getObject();
			this._oDataModel.read("/C_Chargroupcode_Valuehelp", {
				filters: this._filterByLotIdInternalIdAndChar(oSelectedCharItem),
				sorters: [new Sorter("CharacteristicAttributeCode", false)],
				success: (function(oResponse) {
					//had requested data putting in an object to avoid requesting repeatedly.
					this._vHMap = oResponse;

					if (callback) {
						callback();
					}
				}).bind(this)
			});
		},
		_onType: function(oEvent) {
			//var oBindingData = this.getBindingContext().getObject();
			var aSuggestionRows = this.getBinding("suggestionRows").oList;
			var sText = this.getValue().toUpperCase();
			var aValues = this._splitCodeAndGroup(sText, "-");
			var sFormattedValue = "";
			var valuationResult = "";
			var sGroup = aValues[0] || "";
			sGroup = sGroup.trim();
			var sCode = aValues[1] || "";
			sCode = sCode.trim();
			var filterByCodeGroup = function(oRow) {
				return sGroup === oRow[this._bindingPath.codeGroup] &&
					sCode === oRow[this._bindingPath.code];
			};
			var matchedRow = aSuggestionRows.filter(filterByCodeGroup.bind(this))[0];
			if (matchedRow) {
				sFormattedValue = this.formatter.rrGroupCodeDisplay(sGroup, sCode);
				valuationResult = matchedRow.CharcAttributeValuation;
			} else {
				sCode = "";
				sGroup = "";
			}

			this.setValue(sFormattedValue);
			this.setCodeGroup(sGroup);
			this.setCode(sCode);

			this.fireValueChange({
				"codeGroup": sGroup,
				"code": sCode,
				"valuation": valuationResult
			});
		},
		_onSelect: function(oEvent) {
			var oSelected = oEvent.getParameters().selectedRow.getTable().getSelectedContexts()[0].getObject();
			var sGroup = oSelected[this._bindingPath.codeGroup].trim();
			var sCode = oSelected[this._bindingPath.code].trim();
			this.setCodeGroup(sGroup);
			this.setCode(sCode);

			var sFormattedValue = this.formatter.rrGroupCodeDisplay(sGroup, sCode);
			this.setValue(sFormattedValue);
			//oBindingData.Inspectionvaluationresult = oSelected.CharcAttributeValuation;
			this.fireValueChange({
				"codeGroup": sGroup,
				"code": sCode,
				"valuation": oSelected.CharcAttributeValuation
			});
		}
	});
});