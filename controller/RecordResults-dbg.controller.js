/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
/*
 * This controller is used to control Record Result page. 
 * This page has many functions, e.g. display characteristics by passing one or more inspection lots, edit Inspection result, status and remark. 
 * This page only pass those changed data to backend and display all success or failed messages. 
 * If data be changed and haven't save yet, when click back button, will pop up dialog to alert. 
 * This page interacts with other 12 fragment controllers. RecrodResultsRowItem1.controller.js - RecrodResultsRowItem11.controller.js and RecrodResultsRowItemBaseController.js. 
 * Totally characteristics have 11 scenario, we separate them into different controllers to make code has good readability. 
 */
sap.ui.define([
	"i2d/qm/inspresults/records1/controller/BaseController",
	"i2d/qm/inspresults/records1/model/formatter",
	"i2d/qm/inspresults/records1/util/CalculationHelper",
	"i2d/qm/inspresults/records1/util/NumberFormat",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem"
], function(BaseController, formatter, CalculationHelper, NumberFormat, Filter, JSONModel,
	MessageBox, MessagePopover, MessagePopoverItem) {
	"use strict";

	return BaseController.extend("i2d.qm.inspresults.records1.controller.RecordResults", {
		formatter: formatter,
		CalculationHelper: CalculationHelper,
		NumberFormat: NumberFormat,
		oSavePayloadKeys: {
			//Some fields only for displaying, we need to ignore them when saving. 
			ignoreKeys: ["ValuationErrorMessage", "Insporiginresultvaluecount",
				"IsQual", "IsLower", "IsMeasure", "IsSum", "IsUpper", "IsWithCode", "HasTarget", "IsDataChanged",
				"CodeGroupCodeErrorMessage", "TemplateId", "CodeGroupCodeValuation", "RemarkErrorMessage", "IsEditable"
			],
			//Some numbers isn't standard format. e.g. 123.456.789,123 
			formatKeys: ["Inspectionresultmeanvalue"]
		},
		//openStatusKeys is used to display data of table either open status or all status. It means below 4 status when we say open status. 
		//0	Can Be Processed
		//1	Must Be Processed
		//2	Processed
		//3	Valuated
		openStatusKeys: ["0", "1", "2", "3"],

		onInit: function(oEvent) {
			this._oView = this.getView();
			this._oRouter = this.getRouter();
			this._oDataModel = this.getOwnerComponent().getModel();
			this.setModel(this._oDataModel, "serviceModel");
			this._oResourceBundle = this.getResourceBundle();
			this._oResultsTable = this.byId("QR_RR_CHARAC_TABLE");
			this._oSaveBtn = this.byId("QR_SAVE");
			this._oMsgPopoverBtn = this.byId("QR_MSG_POPOVER_BTN");
			this._iInspResultColumnIndex = 2; // the 3rd cell includes different inputs, need to be filled dynamically
			this._iManualValuationColumnIndex = 3; // the 4rd cell includes Manual Valuation Result, need to be filled dynamically			
			this._oRouter.getRoute("recordResults").attachMatched(this.onRecordResultsRouteMatch, this);
			//variable to hold the handler function of Nav-back button.
			this._fnNavBack = undefined;
			// init view model to display fields in table
			var oViewModel = new JSONModel({});
			this.setModel(oViewModel, "recordResultsModel");
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * to refresh messages content and count. 
		 * @private
		 */
		resetMessages: function() {
			this._aCallbackMessages = [];
			this.getModel("recordResultsModel").setProperty("/messageCount", 0);
		},

		/**
		 * recordResults route matched handler
		 * retrieve charac table from from backend
		 * @param  {sap.ui.base.Event} oEvent route matched event
		 * @public
		 */
		onRecordResultsRouteMatch: function(oEvent) {
			// Reset intermediate variables for saving.
			this._oInspectionResultVHMap = {};
			this._oRRRemovedTokenMap = [];
			this._oErrorStatusInputs = [];

			this.replaceHeadNavBack();
			this.resetMessages();
			this._bIsInitDone = false;
			//Define below two i18n items just because 
			//1. we cannot get count when init page.
			//2. When we nav back to worklist page and then go inside another items page. All data number and open data number should display like the first time. 
			this.getModel("recordResultsModel").setProperty("/allDataHeader", this._oResourceBundle.getText("QM_RR_ALL_DATA_HEADER_EMPTY") +
				"  ");
			this.getModel("recordResultsModel").setProperty("/openDataHeader", this._oResourceBundle.getText("QM_RR_OPEN_DATA_HEADER_EMPTY") +
				"  ");
			//When loading page, always display all characteristics. 
			this.oStatusTab = this.byId("QR_RR_STATUS_TAB").setSelectedKey("allData");
			/* selectedModelForRecording structure:
			 * {
			 * 		items:   {Array} - selected inspectionlots/operations/samples/MICs
			 *   	filters: {Array} - filters from worklist page
			 * }
			 */
			this._oSelectedModel = this.getOwnerComponent().getModel("selectedModelForRecording") &&
				this.getOwnerComponent().getModel("selectedModelForRecording").getData() || {
					items: [],
					filters: []
				};

			// get arguments from route url, indentify if it is nav from MIC tab
			var oArgs = oEvent.getParameter("arguments");
			var bFromMICTab = oArgs && oArgs.fromTab && oArgs.fromTab === this.Constants.WorkListTabKey.MIC;

			// if nav from MIC tab, retrieve related characteristic list first
			// if nav from first 3 tabs, retrieve characteristics directly
			if (bFromMICTab) {
				this.retrieveCharacForSelectedMIC(this._oSelectedModel)
					.then(this.onCharInfoRequestSuccess.bind(this));
			} else {
				this.retrieveCharacTableData(this._oSelectedModel)
					.then(this.onCharInfoRequestSuccess.bind(this));
			}

		},

		/**
		 * replacing behavior of shell nav back object. The purpose is to alert message when data is changed. 
		 * @public
		 */
		replaceHeadNavBack: function() {
			var oBackBtn = sap.ui.getCore().byId("backBtn");
			this._fnNavBack = oBackBtn.onclick;

			//publish replaceNavBack event to info worklist controller to cache the ordinary onClick handler.
			var bus = sap.ui.getCore().getEventBus();
			bus.publish("i2d.qm.inspresults.records1.event", "replaceNavBack", {
				navBackHandler: oBackBtn.onclick
			});

			var fFunction = function(oEvent) {
				this.onHeadNavBack(oBackBtn);
			}.bind(this);
			//replacing the default click function with customized function. 
			oBackBtn.onclick = fFunction;
		},

		/**
		 * page navback event handler, triggered by navback button
		 * @public
		 */
		onHeadNavBack: function(oBackBtn) {
			var oResourceBundle = this.getResourceBundle();
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			// When data is changed, display warning message box
			if (this._aInspectionResultSaveMap && this._aInspectionResultSaveMap.length > 0) {
				MessageBox.show(
					oResourceBundle.getText("QM_CHAR_LEAVE_CONFIRM_MSG"), {
						icon: MessageBox.Icon.QUESTION,
						title: oResourceBundle.getText("QM_CHAR_LEAVE_CONFIRM_TITLE"),
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						actions: [oResourceBundle.getText("QM_CHAR_LEAVE_CONFIRM_OK"), oResourceBundle.getText("addSample.form.cancel")],
						initialFocus: oResourceBundle.getText("addSample.form.cancel"),
						onClose: (function(sAction) {
							if (sAction === oResourceBundle.getText("QM_CHAR_LEAVE_CONFIRM_OK")) {
								this._clearAndNavBack();
								//Using function of previously shell nav back object defined. 
								oBackBtn.onclick = this._fnNavBack;
								this._fnNavBack = undefined;
							}
						}).bind(this)
					}
				);
			} else {
				//	sap.ui.getCore().getMessageManager().getMessageModel().destroy();
				this._clearAndNavBack();
				//Using function of previously shell nav back object defined. 
				oBackBtn.onclick = this._fnNavBack;
				this._fnNavBack = undefined;
			}
			//	sap.ui.getCore().getMessageManager().getMessageModel().destroy();
		},
		/**
		 * clear page data and navback
		 * @private
		 */
		_clearAndNavBack: function() {
			this.byId("QR_RR_STATUS_TAB").setEnabled(true);
			this._oResultsTable.removeAllItems();
			this.NavHelper.navBack();
		},

		/**
		 * Refresh binding fields from model. Normally, there fields have a formatter and cannot be automatically refreshed when value changed.
		 * If no fields are specified, will refresh the fields which are changed often.
		 * @param  {sap.ui.model.Model} oModel
		 * @param  {Array} aBindingFields an Array of field names which need to refresh
		 * @private
		 */
		refreshBindingFields: function(oModel, aBindingFields) {
			var aBindingFields = aBindingFields || ["Inspectionvaluationresult", "IsDataChanged", "ValuationErrorMessage",
				"InspRsltAboveToleranceValsNmbr", "InspRsltBelowToleranceValsNmbr", "Inspectionresultmeanvalue",
				"InspResultValidValuesNumber", "InspRsltNonconformingValsNmbr"
			];
			aBindingFields.forEach(function(sField) {
				oModel.aBindings.forEach(function(oBinding) {
					if (oBinding.getPath() === sField) {
						oBinding.refresh();
					}
				});
			});
		},
		/**
		 * Caching changed items for save action. using Inspectionlot, Inspplanoperationinternalid, Inspectioncharacteristic, Inspectionsubsetinternalid as the key. 
		 * If data isn't exist in map, then add this binding data, otherwise just return. 
		 * If change data, enable save button. 
		 * If there are some error status inputs, save button should be disabled. 
		 * @param  {Object} oBindingData
		 * @param  {Object} oRemovedItems - optional
		 * @public
		 */
		handleSaveMap: function(oBindingData, oRemovedItems) {
			oBindingData.IsDataChanged = true;
			var inspectionResultSaveKey = oBindingData.Inspectionlot + oBindingData.Inspplanoperationinternalid + oBindingData.Inspectioncharacteristic +
				oBindingData.Inspectionsubsetinternalid;
			var isExist = false;
			this._aInspectionResultSaveMap.forEach(function(oName) {
				if (oName.key === inspectionResultSaveKey) {
					oName.value = oBindingData;
					isExist = true;
					return;
				}
			});

			//handle the removedItems in multiple input
			//type 3, 4, 7, 9 ,11
			if (oRemovedItems && oRemovedItems.length > 0) {
				this._addRRRemovedTokenMap(inspectionResultSaveKey, oRemovedItems);
			}

			if (!isExist) {
				this._aInspectionResultSaveMap.push({
					key: inspectionResultSaveKey,
					value: oBindingData
				});
			}
			this._oSaveBtn.setEnabled(true);
			this.byId("QR_RR_STATUS_TAB").setEnabled(true);
			// if there are some error status inputs, save button should be disabled
			if (this._oErrorStatusInputs.length > 0) {
				this._oSaveBtn.setEnabled(false);
				this.byId("QR_RR_STATUS_TAB").setEnabled(false);
			}
		},

		/**
		 * Cache the removed tokens. 
		 * No matter removed token displayed get from database or new, all will be cached in map _oRRRemovedTokenMap. Backend will find these tokens are exist or new. 
		 * If field Inspectionresultattribute is '/', it means this is removed token. 
		 * @param  {Object} key
		 * @param  {Object} items - items
		 * @public
		 */
		_addRRRemovedTokenMap: function(key, items) {
			var copiedItems = JSON.parse(JSON.stringify(items));
			copiedItems.forEach(function(item) {
				item.Inspectionresultattribute = "/";
			});
			var keyItem = this._oRRRemovedTokenMap.filter(function(item) {
				return item.key === key;
			})[0];
			//Replacing old items if removed tokens exist in map, otherwise cache this items. 
			if (keyItem) {
				keyItem.value = copiedItems;
			} else {
				this._oRRRemovedTokenMap.push({
					key: key,
					value: copiedItems
				});
			}
		},

		/**
		 * Valuation function for valuation rule 10
		 * @param  {Object} oBindingData
		 * @private
		 */
		applyValuation10: function(oBindingData) {
			var sResult = this.valuationRule10(oBindingData);

			if (sResult === "Accept") {
				oBindingData.Inspectionvaluationresult = "A";
				oBindingData.ValuationErrorMessage = "";
			} else if (sResult === "Reject") {
				oBindingData.Inspectionvaluationresult = "R";
				oBindingData.ValuationErrorMessage = "";
			} else if (sResult) {
				oBindingData.Inspectionvaluationresult = "";
				oBindingData.ValuationErrorMessage = sResult;
			}
			//this.handleSaveMap(oBindingData);
		},

		/**
		 * Valuation function for valuation rule 70,
		 * both for single value and summarized
		 * @param  {Object} oBindingData
		 * @private
		 */
		applyValuation70: function(oBindingData) {
			var bHasValue = false;
			var fValue = oBindingData.Inspectionresultmeanvalue;
			//1.for single value input, if there is any token in input control, 
			//then we need to do the valuation.
			if (!oBindingData.IsSum && oBindingData.to_ResultDetails.results.length > 0) {
				bHasValue = true;
			}
			//2.for summarized input, if current mean value is a valid number
			//then we need to do the valuation.
			if (oBindingData.IsSum && !isNaN(fValue) && fValue !== "") {
				bHasValue = true;
			}

			if (!bHasValue) {
				oBindingData.Inspectionvaluationresult = "";
			} else {
				var bIsAccpet = this.CalculationHelper.checkMeanValue(oBindingData.IsLower, oBindingData.IsUpper,
					oBindingData.Inspspeclowerlimit, oBindingData.Inspspecupperlimit, fValue);
				oBindingData.Inspectionvaluationresult = bIsAccpet ? "A" : "R";
			}
		},
		/**
		 * Valuation function for valuation rule 40,
		 * for summarized Group-Code input
		 * @param  {Object} oBindingData
		 * @private
		 */
		applyValuation40: function(oBindingData) {
			//when Group-Code is changed, Inspectionvaluationresult should be updated base on the selected item.
			oBindingData.Inspectionvaluationresult = oBindingData.CodeGroupCodeValuation;
		},

		/* =========================================================== */
		/* callback functions                                          */
		/* =========================================================== */

		/**
		 * Request error callback function, raise a error messagebox to show error response
		 * @param  {Object} oResponse error response
		 */
		onRequestError: function(oResponse) {
			MessageBox.error(oResponse.responseText, {
				title: this._oResourceBundle.getText("QM_CHAR_ERROR_TITLE")
			});
		},

		/**
		 * CharInfoSet request success callback function
		 * @param  {Object} oResponse response object
		 * @public
		 */
		onCharInfoRequestSuccess: function(oResponse) {
			// bind table with response data
			// use factory function to generate template for each row
			var oResultTableModel = new JSONModel(oResponse);
			oResponse.results.forEach(function(oCharac) {
				// When InspectionResultHasMeanValue is no value, it means there is no mean value,
				// then mean value should set to ""
				if (!oCharac.InspectionResultHasMeanValue) {
					oCharac.Inspectionresultmeanvalue = "";
				}
			});

			// overwrite default size limit (100), need to be determined by PO
			oResultTableModel.setSizeLimit(1000);
			this._oResultsTable.setModel(oResultTableModel);

			var getResultColumnTemplateId = function(bQualitative, bSummarized, bMeasure, bAboveBelow, bWithCode) {
				// Template 1  Quantitative, Summarized, Record measured values, No. Above / Below
				// Template 2  Quantitative, Summarized, Record measured values, no No. Above / Below	
				// Template 3  Quantitative, Single,     Record measured values, No. Above / Below
				// Template 4  Quantitative, Single,     Record measured values, no No. Above / Below
				// Template 5  Quantitative, Summarized, No measured values,     No. Above / Below
				// Template 6  Quantitative, Summarized, No measured values,     no No. Above / Below
				// Template 7  Quantitative, Single,     No measured values
				// Template 8  Qualitative,  Summarized, With code
				// Template 9  Qualitative,  Single,     With code
				// Template 10 Qualitative,  Summarized, Without code
				// Template 11 Qualitative,  Single,     Without code
				if (!bQualitative && bSummarized && bMeasure && bAboveBelow) {
					return 1;
				}
				if (!bQualitative && bSummarized && bMeasure && !bAboveBelow) {
					return 2;
				}
				if (!bQualitative && !bSummarized && bMeasure && bAboveBelow) {
					return 3;
				}
				if (!bQualitative && !bSummarized && bMeasure && !bAboveBelow) {
					return 4;
				}
				if (!bQualitative && bSummarized && !bMeasure && bAboveBelow) {
					return 5;
				}
				if (!bQualitative && bSummarized && !bMeasure && !bAboveBelow) {
					return 6;
				}
				if (!bQualitative && !bSummarized && !bMeasure) {
					return 7;
				}
				if (bQualitative && bSummarized && bWithCode) {
					return 8;
				}
				if (bQualitative && !bSummarized && bWithCode) {
					return 9;
				}
				if (bQualitative && bSummarized && !bWithCode) {
					return 10;
				}
				return 11;
			};
			//refactor the rebinding code to here
			this._oResultsTable.bindItems("/results", function(index, context) {
				var oCharac = context.getObject();
				oCharac.IsEditable = oCharac.Displayonly !== "X";
				//oCharac.IsEditable = false;
				oCharac.ValuationErrorMessage = "";

				// Qualitative and Summarized value indicator
				// Inspspecisquantitative to indicate Qualitative or Quantitative, "0" => Qualitative and "1" => Quantitative
				// Inspspecrecordingtype to indicate Single value or Summarized value, "1" => Single Value and "" => Summarized Value
				oCharac.IsQual = oCharac.Inspspecisquantitative === "0";
				oCharac.IsSum = oCharac.Inspspecrecordingtype === "";

				// Inspspeccontrolindicators to indicate with code or without code,
				// if the 3rd character is "X", then with code, if not, without code
				oCharac.IsWithCode = oCharac.Inspspeccontrolindicators.substr(2, 1) === "X";
				// if InspSpecIsMeasuredValueRqd is "X", then measure value required, if not, not required
				// Inspspechasupperlimit and Inspspechaslowerlimit are the same logic
				oCharac.IsMeasure = oCharac.InspSpecIsMeasuredValueRqd === "X";
				oCharac.IsUpper = oCharac.Inspspechasupperlimit === "X";
				oCharac.IsLower = oCharac.Inspspechaslowerlimit === "X";
				oCharac.HasTarget = oCharac.Inspspechastargetvalue === "X";

				// Parse Inspspeclowerlimit and Inspspecupperlimit to Float
				oCharac.Inspspeclowerlimit = parseFloat(oCharac.Inspspeclowerlimit);
				oCharac.Inspspecupperlimit = parseFloat(oCharac.Inspspecupperlimit);

				var oColumnListTemplate = new sap.ui.xmlfragment(
					"i2d.qm.inspresults.records1.view.fragments.RecordResultsTableItemTemplate", this);

				//Init each items based on different scenarios. 
				var templateId = getResultColumnTemplateId(oCharac.IsQual, oCharac.IsSum, oCharac.IsMeasure,
					oCharac.IsUpper || oCharac.IsLower, oCharac.IsWithCode);
				oCharac.TemplateId = templateId;
				oCharac.RemarkErrorMessage = "";

				var oController = sap.ui.controller("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsRowItem" + templateId);
				oController.oRRController = this;
				oController.getResourceBundle = function() {
					return this.oRRController._oResourceBundle;
				};
				oController._oResourceBundle = this._oResourceBundle;
				oController.formatter._oResourceBundle = this._oResourceBundle;
				if (oController.onInit) {
					oController.onInit();
				}

				var oInspectionResultTemplate = new sap.ui.xmlfragment("i2d.qm.inspresults.records1.view.fragments.RecrodResultsRowItemTemplate" +
					templateId, oController);

				// Add the correct one to the column item
				oColumnListTemplate.getCells()[this._iInspResultColumnIndex].addItem(oInspectionResultTemplate);

				var oMVController = sap.ui.controller("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsManualValuation");
				oMVController.oRRController = this;
				oController.getResourceBundle = function() {
					return this.oRRController._oResourceBundle;
				};
				oMVController._oResourceBundle = this._oResourceBundle;
				oMVController.formatter._oResourceBundle = this._oResourceBundle;
				var oManualValuationTemplate = new sap.ui.xmlfragment("i2d.qm.inspresults.records1.view.fragments.RecordResultsStatusValuation",
					oMVController);
				// Add the Manual Valuation inputs to the column item 
				oColumnListTemplate.getCells()[this._iManualValuationColumnIndex].addItem(oManualValuationTemplate);
				return oColumnListTemplate;
			}.bind(this));

			//Response data includes all status data, not only open status'. Displaying all characteristics and count instead of 'All Characteristics'
			var sAllDataHeader = this._oResourceBundle.getText("QM_RR_ALL_DATA_HEADER", [oResponse.results.length]);
			var recordResultsModel = this.getModel("recordResultsModel");
			recordResultsModel.setProperty("/allDataHeader", sAllDataHeader);

			this.resetOpenStatusCount(oResponse);

			recordResultsModel.setProperty("/resultsTableModel", oResponse);
			//This is used to display saved messages. No matter success or failure. 
			recordResultsModel.setProperty("/messageCount", 0);
			this._bIsInitDone = true;

			this._aInspectionResultSaveMap = [];
			this._oSaveBtn.setEnabled(false);
			this._oResultsTable.setBusy(false);
			this._oView.setBusy(false);
			this._setAriaForMessageButton();
		},

		/**
		 * if not pass parameter iStatusNumber, this function will calculate open status itself. 
		 * @param  {oResultsTableModel} oResultsTableModel: the table model object.
		 * @param  {iStatusNumber} iStatusNumber: the open status count that want to display.  
		 * @private
		 */
		resetOpenStatusCount: function(oResultsTableModel) {
			//Calculating open status count. 
			var iStatusByFilter = 0;
			if (oResultsTableModel) {
				oResultsTableModel.results.forEach(function(oItem) {
					if (this.openStatusKeys.indexOf(oItem.Inspectionresultstatus) >= 0) {
						iStatusByFilter++;
					}
				}.bind(this));
			}

			//Response data includes open status data only, not only open status'. Displaying Open Characteristics and count instead of 'Open Characteristics'
			var sOpenDataHeader = this._oResourceBundle.getText("QM_RR_OPEN_DATA_HEADER", [iStatusByFilter]);
			this.getModel("recordResultsModel").setProperty("/openDataHeader", sOpenDataHeader);
		},

		/**
		 * If key is 'openStatusData', then display data with filters. 
		 * If key is 'allData', then display data with empty filters. 
		 * When init page the first time, display data without filters. 
		 * @param  {Object} oEvent: the change event obejct
		 * @private
		 */
		retrieveDataByFilters: function(oEvent) {
			this._bIsOpenTab = false;
			//Totally have allData and openStatusData value
			if (oEvent.getParameter("key") === "openStatusData") {
				this._bIsOpenTab = true;
				//Get all opened data.
				this.filterbyOpenStatus();
				//If no data, will display no open characteristics
				if (!this._oResultsTable.getItems().length) {
					this.displayNoDataText();
				}
			} else {
				//Here means user select all characteristic tab. 
				if (this._oResultsTable.getBinding("items")) {
					this._oResultsTable.getBinding("items").filter([]);
				} else {
					//If no data, will display no characteristics. 
					this.displayNoDataText();
				}
			}
		},

		/**
		 * Changing display content if no data. 
		 */
		displayNoDataText: function() {
			if (this._bIsOpenTab) {
				this._oResultsTable.setNoDataText(this._oResourceBundle.getText("QM_RR_NO_OPEN_CHAR"));
			} else {
				this._oResultsTable.setNoDataText(this._oResourceBundle.getText("QM_RR_NO_CHAR"));
			}
		},

		/**
		 * Get data by open status. 
		 * @return {Number} count: the size of selected items. 
		 * @private
		 */
		filterbyOpenStatus: function() {
			var aOpenStatus = [];
			//Generating filters with or operation. 
			this.openStatusKeys.forEach(function(sItem) {
				aOpenStatus.push(new Filter("Inspectionresultstatus", sap.ui.model.FilterOperator.EQ, sItem));
			});
			var aItems = this._oResultsTable.getBinding("items");
			if (aItems) {
				aItems.filter([new Filter({
					filters: aOpenStatus,
					and: false
				})]);
			}
		},

		/**
		 * Customizing read out content. 
		 * Attach aria informations for message button control
		 * @private
		 */
		_setAriaForMessageButton: function() {
			//add aria label.
			var oAriaLabel = this.byId("QR_HIDDEN_MSG");
			this._oMsgPopoverBtn.rerender();
			$("#" + this._oMsgPopoverBtn.getId()).attr("aria-label", oAriaLabel.getText());
		},
		/**
		 * Add input into _oErrorStatusInputs which has error message,
		 * and not existing in the _oErrorStatusInputs.
		 * @param  {sap.m.Input} oInput input which has error message
		 * @public
		 */
		addErrorInputIntoErrorStatusInputs: function(oInput) {
			var iIndex = this._oErrorStatusInputs.indexOf(oInput);
			if (iIndex < 0) {
				this._oErrorStatusInputs.push(oInput);
			}
		},

		/**
		 * Remove input from _oErrorStatusInputs which has no error message.
		 * @param  {sap.m.Input} oInput input which has no error message
		 * @public
		 */
		removeNoErrorInputFromErrorStatusInputs: function(oInput) {
			var iIndex = this._oErrorStatusInputs.indexOf(oInput);
			if (iIndex < 0) {
				return;
			}
			this._oErrorStatusInputs.splice(iIndex, 1);
		},
		/**
		 * Valation rule 10
		 * Please refer to Backend function QEBR_NONCONFORM_UNIT_VALUATION
		 *
		 * @param  {Object} oBindingData
		 * @return {String} valuation result
		 * @public
		 */
		valuationRule10: function(oBindingData) {
			var iInspectedCount = parseInt(oBindingData.InspResultValidValuesNumber || 0, 10);
			var iInspectedNonconformCount = parseInt(oBindingData.InspRsltNonconformingValsNmbr || 0, 10);
			var iInspSampleAcceptanceNumber = parseInt(oBindingData.Inspsampleacceptancenumber, 10);
			var iInspSampleRejectionNumber = parseInt(oBindingData.Inspsamplerejectionnumber, 10);
			var iInspectionSampleSize = parseInt(oBindingData.Inspectionsamplesize, 10);
			var bIsSummarized = oBindingData.IsSum;

			// If the inspected nonconforming count is less than or equal to the acceptance number,
			// and inspected count is more than or equal to the sample size,
			// the result is Accept
			if (iInspectedNonconformCount <= iInspSampleAcceptanceNumber && iInspectedCount >= iInspectionSampleSize) {
				return "Accept";
			}

			// If the inspected nonconforming count is more than or equal to the rejectoin number
			// and the inspected count is less than or equal to the sample size
			// the result is Reject
			if (iInspectedNonconformCount >= iInspSampleRejectionNumber && iInspectedCount <= iInspectionSampleSize) {
				return "Reject";
			}

			// define a count which means uninspedted count plus nonconforming count
			var iUninspectedAndNonconforming = iInspectionSampleSize - iInspectedCount + iInspectedNonconformCount;
			if (iInspectedCount === iInspectionSampleSize) {
				return "Accept";
			}

			if (iInspectedCount < iInspectionSampleSize) {
				if (iUninspectedAndNonconforming <= iInspSampleAcceptanceNumber) {
					return "Accept";
				}
				if (iUninspectedAndNonconforming < iInspSampleRejectionNumber && iInspectedNonconformCount > iInspSampleAcceptanceNumber) {
					return "Accept";
				}
				if (bIsSummarized) {
					return this._oResourceBundle.getText("QM_RESULT_NOT_ENOUGH_INSPECTED");
				}
				return this._oResourceBundle.getText("QM_RESULT_NOT_ENOUGH_INSPECTED_SINGLE_VALUE");
			}

			if (iUninspectedAndNonconforming >= iInspSampleRejectionNumber) {
				return "Reject";
			}
			if (iUninspectedAndNonconforming > iInspSampleAcceptanceNumber && iInspectedNonconformCount < iInspSampleRejectionNumber) {
				return "Accept";
			}
			if (bIsSummarized) {
				return this._oResourceBundle.getText("QM_RESULT_TOO_MANY_INSPECTED");
			}
			return this._oResourceBundle.getText("QM_RESULT_TOO_MANY_INSPECTED_SINGLE_VALUE");
		},

		/**
		 * retrieve characteristic list for selected MICs
		 * only used when nav from MIC tab
		 * @param  {Array} aSelectedMICs selected MIC array
		 * @return {Promise}             batch request promise
		 * @public
		 */
		retrieveCharacForSelectedMIC: function(oSelectedModel) {
			var oDataModel = this.getNewODataModel();
			var prefixWithZeros = this.formatter.fillZeroFront;
			this._oView.setBusy(true);
			var aSelectedCharacs = [];

			// used for MIC tab
			var retrieveCharacTableBy = function(oMICItem) {
				oMICItem.InspectionMethodVersion = oMICItem.InspectionMethodVersion && prefixWithZeros(oMICItem.InspectionMethodVersion, 6);
				// encode URI parameters which is a text or description and may contain symbols(comma, space, etc.)
				var sUrl = [
					"/InspectionCharacteristicSet(InspectionSpecificationPlant='", oMICItem.InspectionSpecificationPlant,
					"',InspectionSpecification='", encodeURIComponent(oMICItem.InspectionSpecification),
					"',InspectionSpecificationVersion='", prefixWithZeros(oMICItem.InspectionSpecificationVersion, 6),
					"')"
				].join("");

				oDataModel.read(sUrl, {
					filters: oSelectedModel.filters,
					urlParameters: "$select=MastCharNavRR&$expand=MastCharNavRR/to_ResultDetails",
					success: function(oRes) {
						aSelectedCharacs = aSelectedCharacs.concat(oRes.MastCharNavRR && oRes.MastCharNavRR.results || []);

						// Copy details results as binding data for Multiinput.
						// This is to fix the problem that the size of tokens increases automatically after changing any fields of model
						aSelectedCharacs.forEach(function(item) {
							if (!item.to_ResultDetails) {
								item.to_ResultDetails = {
									results: []
								};
							}
							item.to_ResultDetails.results4Binding = [];
							// Copy results array to results4Binding
							Array.prototype.push.apply(item.to_ResultDetails.results4Binding,
								item.to_ResultDetails.results.filter(function(oResult) {
									return oResult.Inspectionvaluationresult !== "F";
								}));
						});
					}
				});
			};

			return new Promise((function(resolve, reject) {
				// determine which iterate function to use based on if comes from MIC tab
				//var iterateFunc = iterateInspLotLevel;
				oSelectedModel.items.forEach(retrieveCharacTableBy, this);

				// call resolve or reject callback when the batch request for oTableDataModel is all completed or failed once
				oDataModel.attachBatchRequestCompleted(function(oEvent) {
					resolve({
						results: aSelectedCharacs,
						hasFilter: false
					});
				});
				oDataModel.attachBatchRequestFailed(reject);
			}).bind(this));
		},

		onChangeForValuationByBindingData: function(oBindingData, sAction) {

			// if no valuation rule, will not do the valuation
			if (!oBindingData.InspSampleValuationRule) {
				oBindingData.ValuationErrorMessage = "";
				return;
			}

			if (oBindingData.InspSampleValuationRule === "10") {
				this.applyValuation10(oBindingData);
				return;
			}

			if (oBindingData.InspSampleValuationRule === "70") {
				this.applyValuation70(oBindingData);
				return;
			}

			if (oBindingData.InspSampleValuationRule === "40") {
				this.applyValuation40(oBindingData);
				return;
			}
		},
		/**
		 * when user change text for the remark text area,
		 * add this record to save map.
		 * @param  {Object} oEvent: the change event obejct
		 * @public
		 */
		onRemarkChange: function(oEvent) {
			var oBindingData = oEvent.getSource().getBindingContext().getObject();
			this.handleSaveMap(oBindingData);
		},
		/**
		 * validate the remark for a Characteristic
		 * @param  {Object} oBindingData: data of current Characteristic
		 * @return {Boolean} a flag indicates whether the remark is valid
		 * @public
		 */
		validateRemark: function(oBindingData) {
			var bIsRequired = false;
			var sValuationResult = oBindingData.Inspectionvaluationresult;
			switch (oBindingData.Inspresultisdocumentationrqd) {
				//".": remark is required when rejected.
				case ".":
					bIsRequired = sValuationResult === "R";
					break;
					//"+": remark is required no matter accepted or rejected.
				case "+":
					bIsRequired = sValuationResult === "R" || sValuationResult === "A";
					break;
					//empty string: remark is not required
				default:
					break;
			}

			//if remark is requeied, but without value, add an error message for it, and highlight the textarea.
			var sErrorMessage = (oBindingData.Inspectionresulttext.trim() === "" && bIsRequired) ?
				this.getModel("i18n").getResourceBundle().getText("QM_INSPECTION_ENTER_A_REMARK") : "";
			oBindingData.RemarkErrorMessage = sErrorMessage;
			return !sErrorMessage;
		},
		/**
		 * retrieve RR page Charac table data
		 * use two ODataModel to send request in the same time for table
		 * @param  {Array} aSelectedModel selected model array (Inspectionlots or Operations or Samples or Characteristics)
		 * @return {Promise}              table request batch request promise
		 * @public
		 */
		retrieveCharacTableData: function(aSelectedModel) {
			var oTableDataModel = this.getNewODataModel();

			// model to concat charac table batch calls' response data
			var oConcatedResponse = {
				results: []
			};

			// used for InspectionLot, Operation, Sample tab
			var retrieveCharacTableBy = function(oItem) {
				// make filters from each item
				var aFilters = [];
				var oInspLotFilter = oItem.InspectionLot &&
					new Filter("Inspectionlot", sap.ui.model.FilterOperator.EQ, oItem.InspectionLot);
				aFilters.push(oInspLotFilter);
				var oOperationFilter = oItem.InspectionOperation &&
					new Filter("Inspectionoperation", sap.ui.model.FilterOperator.EQ, oItem.InspectionOperation);
				if (oOperationFilter) {
					aFilters.push(oOperationFilter);
				}
				var oSampleFilter = oItem.MaterialSample &&
					new Filter("Materialsample", sap.ui.model.FilterOperator.EQ, oItem.MaterialSample);
				if (oSampleFilter) {
					aFilters.push(oSampleFilter);
				}
				// retrieve characteristic table data batch request function with this args
				// set result table busy indicator befor request
				this._oResultsTable.setBusy(true);
				oTableDataModel.read("/CharInfoSet", {
					filters: aFilters,
					urlParameters: "$expand=to_ResultDetails",
					success: function(oRes) {
						oConcatedResponse.results = oConcatedResponse.results.concat(oRes.results);

						// Copy details results as binding data for Multiinput.
						// This is to fix the problem that the size of tokens increases automatically after changing any fields of model
						oConcatedResponse.results.forEach(function(item) {
							if (!item.to_ResultDetails) {
								item.to_ResultDetails = {
									results: []
								};
							}
							item.to_ResultDetails.results4Binding = [];
							// Copy results array to results4Binding
							Array.prototype.push.apply(item.to_ResultDetails.results4Binding,
								item.to_ResultDetails.results.filter(function(oResult) {
									return oResult.Inspectionvaluationresult !== "F";
								}));
						});
					}
				});
			};

			return new Promise((function(resolve, reject) {
				// determine which iterate function to use based on if comes from MIC tab
				//var iterateFunc = iterateInspLotLevel;
				aSelectedModel.items.forEach(retrieveCharacTableBy, this);

				// call resolve or reject callback when the batch request for oTableDataModel is all completed or failed once
				oTableDataModel.attachBatchRequestCompleted(function(oEvent) {
					resolve(oConcatedResponse);
				});
				oTableDataModel.attachBatchRequestFailed(reject);
			}).bind(this));
		},

		/**
		 * Characteristic link in charac table press handler
		 * create a pop over fragment showing the information
		 * @param  {sap.ui.base.Event} oEvent link press event
		 * @public
		 */
		handleCharPopoverPress: function(oEvent) {
			// create popover
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("i2d.qm.inspresults.records1.view.fragments.RecordResultsPopover", this);
				this.getView().addDependent(this._oPopover);
			}

			var oCharac = oEvent.getSource().getBindingContext().getObject() || {};
			this._oPopover.setModel(new JSONModel(oCharac));

			this._oPopover.openBy(oEvent.getSource());
		},
		/**
		 * callback success and error methods when clicking save button.
		 * pop over a dialog showing the information
		 * @param  {sap.ui.base.Event} oEvent link press event
		 * @public
		 */
		onPressShowSavedMessage: function(oEvent) {
			this._showSavedMessage();
		},
		/**
		 * Open a Popover dialog showing the information
		 * @private
		 */
		_showSavedMessage: function() {
			var oModel = new JSONModel();
			oModel.setData(this._aCallbackMessages);
			if (!this.oMessagePopover) {
				var oMessageTemplate = new MessagePopoverItem({
					type: "{type}",
					title: "{title}",
					description: "{description}"
				});
				this.oMessagePopover = new MessagePopover({
					items: {
						path: "/",
						template: oMessageTemplate
					}
				});
			}
			this.oMessagePopover.destroyItems();
			this.oMessagePopover.setModel(oModel);
			this.oMessagePopover.openBy(this._oMsgPopoverBtn);
		},

		/**
		 * generate saving payload for CharInfoSet POST method
		 * @param  {Object} oModel      model object
		 * @return {Object}              payload object
		 * @private
		 */
		_generateSavePayload: function(oModel) {
			var that = this;
			var oPayload = {
				"d": {}
			};
			oPayload.d = JSON.parse(JSON.stringify(oModel));
			//Removing display-only fields. 
			this.oSavePayloadKeys.ignoreKeys.forEach(function(sName) {
				delete oPayload.d[sName];
			});
			// When mean value is "", set Inspectionresultmeanvalue to 0 to match DB data type,
			// and set InspectionResultHasMeanValue to empty
			// Otherwise, set InspectionResultHasMeanValue to "X"
			if (oPayload.d["Inspectionresultmeanvalue"] === "") {
				oPayload.d["Inspectionresultmeanvalue"] = 0;
				oPayload.d["InspectionResultHasMeanValue"] = "";
			} else {
				oPayload.d["InspectionResultHasMeanValue"] = "X";
			}
			//Update numbers to standard format. standard means 123,456,789.01
			this.oSavePayloadKeys.formatKeys.forEach(function(sName) {
				oPayload.d[sName] = that.formatter.toStandardNumber(oPayload.d[sName]);

			});
			//Add all tokens to to_ResultDetails, including removed tokens. 
			if (oModel.to_ResultDetails.results) {
				var inspectionResultSaveKey = oPayload.d.Inspectionlot + oPayload.d.Inspplanoperationinternalid + oPayload.d.Inspectioncharacteristic +
					oPayload.d.Inspectionsubsetinternalid;
				oPayload.d.to_ResultDetails = oModel.to_ResultDetails.results;
				this._oRRRemovedTokenMap.forEach(function(oItem) {
					if (oItem.key === inspectionResultSaveKey) {
						//oItem.value is an array. 
						Array.prototype.push.apply(oPayload.d.to_ResultDetails, oItem.value);
					}
				});
			}
			oPayload.d.InspectionNonconformingRatio = parseFloat(oModel.InspectionNonconformingRatio);
			return oPayload;
		},

		/**
		 * Giving a chance to cancel for misoperation if already change some records. 
		 * @param  {Object} oModel      model object
		 * @return {Object}              payload object
		 * @private
		 */
		handleCancelButtonPress: function(oEvent) {
			var oResourceBundle = this.getResourceBundle();
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			// When data is changed, display warning message box
			if (this._aInspectionResultSaveMap && this._aInspectionResultSaveMap.length > 0) {
				MessageBox.show(
					oResourceBundle.getText("QM_CHAR_DISCARD_CONFIRM_MSG"), {
						icon: MessageBox.Icon.QUESTION,
						title: oResourceBundle.getText("QM_CHAR_DISCARD_CONFIRM_TITLE"),
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						actions: [oResourceBundle.getText("QM_CHAR_DISCARD_CONFIRM_OK"), oResourceBundle.getText("addSample.form.cancel")],
						initialFocus: oResourceBundle.getText("addSample.form.cancel"),
						onClose: function(sAction) {
							if (sAction === oResourceBundle.getText("QM_CHAR_DISCARD_CONFIRM_OK")) {
								history.go(-1);
							}
						}
					}
				);
			} else {
				history.go(-1);
			}
		},

		/**
		 * save button press event handler
		 * save edited Characteristic data by calling OData
		 * @param {sap.ui.base.Event} button press event
		 */
		handleSaveButtonPress: function(oEvent) {
			var digitalSignaturePopUp = false;
			if (this.oMessagePopover) {
				this.oMessagePopover.close();
			}

			//validate remarks for the save map 
			var bRmarkValid = true;
			this._aInspectionResultSaveMap.forEach(
				function(oSaveItem) {
					if (!this.validateRemark.call(this, oSaveItem.value)) {
						bRmarkValid = false;
					}
				}.bind(this));
			this.refreshBindingFields(this._oResultsTable.getModel(), ["RemarkErrorMessage"]);

			//if any remark is invalid(required but has no value), do not save data.
			if (!bRmarkValid) {
				return;
			}

			this._iMessageCount = 0;
			var oPayload = null;

			var oModel = this.getNewODataModel();
			oModel.setUseBatch(true);

			var oMessage = {};
			for (var i = 0; i < this._aInspectionResultSaveMap.length; i++) {
				var oResult = this._aInspectionResultSaveMap[i].value;
				// generate payload and call odata to save
				oPayload = this._generateSavePayload(oResult);
				//If all records saved successfully, re-save function should work the same as first time access this page.
				//If all records saved failed, all failed records should count as unsaved data. When doing re-save function, the unsaved data need to save again.
				//If part records saved successfully, part records are failed, the failed records need to count as unsaved data. When doing re-save function, the unsaved data need to save again.
				var that = this;
				oModel.create("/CharInfoSet", oPayload, {
					changeSetId: i,
					success: (function(oRes, oMsg) {
						var messageShown = false;
						this.inspectionLot = oRes.Inspectionlot;
						this.operation = oRes.Inspectionoperation;
						this.characteristic = oRes.Inspectioncharacteristic;
						this.refreshResultData(oRes); //auto completion 
						
						for (i = 0; i < sap.ui.getCore().getMessageManager().getMessageModel().getData().length; i++) {
							var message = sap.ui.getCore().getMessageManager().getMessageModel().oData[i].message;
							if (message.search(this.inspectionLot) !== -1) {
								if (digitalSignaturePopUp === false) {
									if (sap.ui.getCore().getMessageManager().getMessageModel().oData[i].code != undefined && sap.ui.getCore().getMessageManager()
										.getMessageModel().oData[i].code === "Q5/043") {

										MessageBox.warning(this.getResourceBundle().getText("QM_DIGITAL_SIGNATURE_REQUIRED"), {
											actions: [sap.m.MessageBox.Action.OK],
										});
										this._iMessageCount++;
										digitalSignaturePopUp = true;
										if (messageShown === false) {
											oMessage = {
												type: sap.ui.core.MessageType.Warning,
												title: this.getResourceBundle().getText("QM_DIGITAL_SIGNATURE_MESSAGE"),
												description: this.getResourceBundle().getText("QM_DIGITAL_SIGNATURE", [this.inspectionLot, this.operation, this.characteristic])
											};
											this._aCallbackMessages.push(oMessage);
											messageShown = true;
										}
									}
								} else {

									if (messageShown === false) {
										this._iMessageCount++;
										oMessage = {
											type: sap.ui.core.MessageType.Warning,
											title: this.getResourceBundle().getText("QM_DIGITAL_SIGNATURE_MESSAGE"),
											description: this.getResourceBundle().getText("QM_DIGITAL_SIGNATURE", [this.inspectionLot, this.operation, this.characteristic])
										};
										this._aCallbackMessages.push(oMessage);
										messageShown = true;
									}
								}
							}
						}

						this._iMessageCount++;
						oMessage = {
							type: sap.ui.core.MessageType.Success,
							title: this.getResourceBundle().getText("QM_CHAR_SAVE_SUCCEEDED"),
							description: this.getResourceBundle().getText("QM_RR_DETAIL_FIELD_COLON", [this.getResourceBundle().getText("QM_LOTS_TEXT"),
								oRes.Inspectionlot
							]) + "\n" + this.getResourceBundle().getText("QM_RR_DETAIL_FIELD_COLON", [this.getResourceBundle().getText(
								"QM_OPERATION_TEXT"), oRes.Inspectionoperation]) + "\n" + this.getResourceBundle().getText("QM_RR_DETAIL_FIELD_BRACKETS", [
								oRes.Inspectionspecificationtext, oRes.Inspectioncharacteristic
							])
						};
						//Just remove success items from _aInspectionResultSaveMap and remove all related removed tokens.  
						this._aCallbackMessages.push(oMessage);
						var inspectionResultSaveKey = oRes.Inspectionlot + oRes.Inspplanoperationinternalid + oRes.Inspectioncharacteristic + oRes.Inspectionsubsetinternalid;
						this.removeMapElement(this._aInspectionResultSaveMap, inspectionResultSaveKey);
						this.removeMapElement(this._oRRRemovedTokenMap, inspectionResultSaveKey);
					}).bind(this),
					error: (function(oErr) {
						this._iMessageCount++;
						if (oErr && oErr.statusCode === "400") {
							try {
								var responseText = JSON.parse(oErr.responseText);
								var sMsg = responseText.error.innererror.errordetails[0] && responseText.error.innererror.errordetails[0].message;
								oMessage = {
									type: sap.ui.core.MessageType.Error,
									title: this.getResourceBundle().getText("QM_CHAR_SAVE_FAILED"),
									description: sMsg
								};
							} catch (e) {
								jQuery.sap.error(e);
							}
						} else {
							oMessage = {
								type: sap.ui.core.MessageType.Error,
								title: this.getResourceBundle().getText("QM_CHAR_SAVE_FAILED"),
								description: oErr.responseText
							};
						}
						this._aCallbackMessages.push(oMessage);
					}).bind(this)
				});
			}
			//Clear messages before transfer data to server. 
			this.resetMessages();
			oModel.submitChanges();
			//set message count after get all callbacks and pop up message dialog directly if get error. 
			oModel.attachBatchRequestCompleted(function() {
				this.getModel("recordResultsModel").setProperty("/messageCount", this._iMessageCount);
				this._oView.setBusy(false);
				// show Message Popover when there are errors
				this._showMessagePopover();
				//We need to re-calculate open status count if data is changed.
				//Here will refresh open status data and count. 
				if (this._bIsOpenTab) {
					this.filterbyOpenStatus();
				}
				this.resetOpenStatusCount(this.getModel("recordResultsModel").getProperty("/resultsTableModel"));
				this._setAriaForMessageButton();
			}.bind(this));
			this._oSaveBtn.setEnabled(false);
			this._oView.setBusy(true);
		},

		/**
		 * we need to remove those data which are saved successfully. 
		 * @param  {Map} save map
		 * @param  {String} the key combined with 4 keys. 
		 * @private
		 */
		removeMapElement: function(aMap, skey) {
			for (var i = 0; i < aMap.length; i++) {
				if (aMap[i].key == skey) {
					aMap.splice(i, 1);
				}
			}
		},

		/**
		 * Show Message Popover only when there are errors or all saved successfully.
		 * @private
		 */
		_showMessagePopover: function() {
			var bExistFailed = this._aCallbackMessages.some(function(oMsg) {
				if (oMsg.type === sap.ui.core.MessageType.Error) {
					// Show message Popover when an error is found
					this._showSavedMessage();
					return true;
				}
			}.bind(this));
			if (!bExistFailed) {
				var sMsg = this.getResourceBundle().getText("QM_CHAR_SAVE_SUCCEEDED");
				sap.m.MessageToast.show(sMsg);
			}
		},

		/**
		 * To update the result status text after save successfully for each record
		 * @param  {Objec} Response
		 * @public
		 */
		refreshResultData: function(oRes) {
			//find out row index of editing characteristic.
			var results = this._oResultsTable.getModel().oData.results;
			var position = -1;
			var aCharItems = this._oResultsTable.getItems();
			aCharItems.forEach(function(charInfoItem, index) {
				var oCharItemBindingContext = charInfoItem.getBindingContext();
				if (oCharItemBindingContext.getProperty("Inspectionlot") == oRes.Inspectionlot &&
					oCharItemBindingContext.getProperty("Inspplanoperationinternalid") == oRes.Inspplanoperationinternalid &&
					oCharItemBindingContext.getProperty("Inspectioncharacteristic") == oRes.Inspectioncharacteristic &&
					oCharItemBindingContext.getProperty("Inspectionsubsetinternalid") == oRes.Inspectionsubsetinternalid) {

					oCharItemBindingContext.getObject().Inspectionresultstatustext = oRes.Inspectionresultstatustext;
					oCharItemBindingContext.getObject().Inspectionresultstatus = oRes.Inspectionresultstatus;
					oCharItemBindingContext.getObject().IsDataChanged = false;
					position = index;
				}
			});
			if (position === -1) {
				return;
			}

			//refresh the valuation status text
			var context = aCharItems[position].getBindingContext();
			var oBindingIsDataChanged;
			var oBindingStatusText;
			this._oResultsTable.getModel().aBindings.forEach(function(oBinding) {
				if (oBinding.getPath() === "Inspectionresultstatustext" && oBinding.oContext === context) {
					oBindingStatusText = oBinding;
				}
				if (oBinding.getPath() === "IsDataChanged" && oBinding.oContext === context) {
					oBindingIsDataChanged = oBinding;
				}
			});
			oBindingIsDataChanged.refresh(); //refresh the IsDataChanged firstly
			oBindingStatusText.refresh();

			//refresh tokens of MultiInput control.
			var sBasePath = context.getPath();
			var oModel = context.getModel();
			if (oRes.Inspspecrecordingtype) {
				oRes.to_ResultDetails = oRes.to_ResultDetails || {
					"results": []
				};

				var aResults4Binding = [];
				Array.prototype.push.apply(aResults4Binding,
					oRes.to_ResultDetails.results.filter(function(oResult) {
						return oResult.Inspectionvaluationresult !== "F";
					}));
				oModel.setProperty(sBasePath + "/to_ResultDetails/results4Binding", aResults4Binding);
				oModel.setProperty(sBasePath + "/to_ResultDetails/results", oRes.to_ResultDetails.results);
				oModel.setProperty(sBasePath + "/Inspresultvaluecount", oRes.Inspresultvaluecount);
				this._oResultsTable.getItems()[position].getCells()[2].getItems()[0].getContent()[0].getContent()[1].reset();
			}
		},

		navToOtherApp: function(sSemanticObject, sAction, oPara) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sHref = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: sSemanticObject,
					action: sAction
				},
				params: oPara
			}));

			if (sHref) {
				sap.m.URLHelper.redirect(sHref, false);
			} else {
				// Navigate back to FLP home
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#"
					}
				});
			}
		}
	});
});