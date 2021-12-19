/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
/*WorkList Controller provides an overview of
 a) Inspection Lots
 b) Operations
 c) Physical Samples
 d) Inspection Characteristics and there settings and filters implementation .
 User can use filter selection to filter the work list, effective for all tabs
 */
sap.ui.define([
	"i2d/qm/inspresults/records1/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"i2d/qm/inspresults/records1/model/formatter",
	"sap/m/Table",
	"sap/m/MessageBox",
	"sap/ui/generic/app/navigation/service/NavigationHandler"
], function (BaseController, JSONModel, formatter, Table, MessageBox, NavigationHandler) {
	"use strict";
	return BaseController.extend("i2d.qm.inspresults.records1.controller.Worklist", {

		formatter: formatter,
		//This method will be called only once when loading this page.
		onInit: function () {
			// --- Helper attributes that are initialized during onInit and never changed afterwards
			// _oList: the master list
			// _oItemTemplate: template of one list item. Used for modifying the list binding.
			// _oSearchField: the search field
			// _oApplicationController: the controller of the App
			// _oApplicationProperties: json model containing the App state
			// _oResourceBundle: the resource bundle to retrieve texts from
			// --- Initialization
			// Use 'local' event bus of component for communication between views
			this._oResourceBundle = this.getResourceBundle();
			this._oRouter = this.getOwnerComponent().getRouter();
			//Declare table ids.
			//Get a reference to the UI element, Select to bind data
			this._oSelectedTab = this.Constants.WorkListTabKey.InspLot;
			this._oFilterBar = this.byId("qr_filterBar");
			this._oStatusText = this.byId("statusText");
			this._oOperationsTable = this.byId("operationsTable");
			this._oOperationsSmartTable = this.byId("inspLotByOperationSmartTable");
			this._oSelectedTable = this.byId("inspectionLotTable");
			this._oInspectionLotTable = this.byId("inspectionLotTable");
			this._oInspectionLotSmartTable = this.byId("inspectionLotSmartTable");
			this._oPhysicalSampleTable = this.byId("physicalSampleTable");
			this._oPhysicalSampleSmartTable = this.byId("inspLotByMtrSmplSmartTable");
			this._oMasterCharacteristics = this.byId("masterCharacteristics");
			this._oMasterCharacteristicsSmartTable = this.byId("masterCharacteristicsSmartTable");
			this._oMassRecordButton = this.byId("QR_MASS_RECORD_BUTTON");
			//Declare view level models.
			var oIconTabCountModel = new JSONModel();
			this.setModel(oIconTabCountModel, "workListView");
			//Declare variables .
			this._oOperation = "";
			this._oInspectionLot = "";
			this._oInspSubsetFieldCombination = "";
			//Call init methods.
			this._initSmartTables();
			this._oRouter.getRoute("worklist").attachMatched(this.onRouteMatch.bind(this), this);
			//variable to hold the handler function of Nav-back button.
			this._fnNavBack = undefined;
			var bus = sap.ui.getCore().getEventBus();
			bus.subscribe("i2d.qm.inspresults.records1.event", "replaceNavBack", this.setNavBack, this);
			//Initialize a map for Free Text Fields and corresponding length. This map is used for free text search.
			this._initFreeTextFieldsMetadata();
			//Call initAppState to fill the data which is before navigation.
			this._oFilterBar.attachInitialized(this.onFilterBarInitialized.bind(this));
			var oServiceMetadata = this.getOwnerComponent().getModel().getServiceMetadata();
			if (!oServiceMetadata) {
				this.getOwnerComponent().getModel().attachMetadataLoaded(this._ignoreDigitalSignatureFields, this);
			} else {
				this._ignoreDigitalSignatureFields();
			}
			this._oStatusText.attachBrowserEvent("click", this.setHeaderExpanded.bind(this));
			this.initAppState();
		},
		/*
		 * when user click the filter text, expend the page header.
		 * */
		setHeaderExpanded: function (oEvent) {
			this.byId("qr_WorkList_Page").setHeaderExpanded(true);
		},
		_ignoreDigitalSignatureFields: function (oMetadata) {
			var that = this;
			var oMetaModelPromise = this.getOwnerComponent().getModel().getMetaModel().loaded();
			oMetaModelPromise.then(function () {
				var oMetaModel = that.getOwnerComponent().getModel().getMetaModel();
				var digitalSignatureProperty = oMetaModel.getODataEntityType("QM_RR_SRV.C_Qm_Inspectlot_FilterbarType").property.filter(function (
					arr) {
					return arr.name == 'InspLotDigitalSgntrInUsgeDcsn';
				})[0];
				if (digitalSignatureProperty === undefined) {
					if (that._oInspectionLotSmartTable !== undefined) {
						that._oInspectionLotSmartTable.setIgnoreFromPersonalisation("InspLotDigitalSgntrInUsgeDcsn,InspLotDigitalSgntrResultsRecg");
						that._oPhysicalSampleSmartTable.destroy();
					}
				}
			}, function (oError) {
				//sap.ui.core.BusyIndicator.hide();
			});

		},
		/**
		 * Cache the onClick handler passed from RecordResults Controller by EventBus.
		 **/
		setNavBack: function (sChannelId, sEventId, oData) {
			this._fnNavBack = oData.navBackHandler;
		},

		/**
		 * When current page is worklist page, revert the onClick handler which replaced in RecordResults Controller.
		 **/
		onRouteMatch: function () {
			if (this._fnNavBack) {
				var oBackBtn = sap.ui.getCore().byId("backBtn");
				oBackBtn.onclick = this._fnNavBack;
				this._fnNavBack = undefined;
				this._oSelectedTable.getModel().refresh();
			}

			if (this._oSelectedTable) {
				this.onInspectionLotChange();
			}
		},
		/**
		 * Recover the click handler of back button.
		 * Unsubscribe the EventBus handler to ensure controllers can be destroyed as expected
		 **/
		onExit: function () {
			if (this._fnNavBack) {
				var oBackBtn = sap.ui.getCore().byId("backBtn");
				oBackBtn.onclick = this._fnNavBack;
				this._fnNavBack = undefined;
			}
			var bus = sap.ui.getCore().getEventBus();
			bus.unsubscribe("i2d.qm.inspresults.records1.event", "replaceNavBack", this.setNavBack, this);
		},

		/**
		 * Update datas in filter bar
		 * @param  {object} oCustomData: current custom data for filters information
		 **/
		updateFilters: function (oCustomData) {
			var aVisibleProperty = ["InspectionLot", "Plant", "Material", "InspectionLotOrigin",
					"InspectionLotEndDate", "InspLotRsltRecgStatus"
				],
				aAdvancedAreaFilters = oCustomData.displayFilters,
				oFilterData = oCustomData.filterData;
			this._oFilterBar.setCurrentVariantId(oCustomData.variantId);
			//Get the key of controlConfiguration which shows in _BASIC group
			var aDisplayItems = jQuery.grep(aAdvancedAreaFilters, function (item, i) {
				return jQuery.inArray(item, aVisibleProperty) !== -1;
			});
			//Get the key of controlConfiguration shows in additional group
			var aAdditionalFilters = jQuery.grep(aAdvancedAreaFilters, function (n, i) {
				return jQuery.inArray(n, aVisibleProperty) === -1;
			});
			//Hide the controlConfiguration in _BASIC group whose key is not in aDisplayItems
			var aFilters = this._oFilterBar.getFilterItems();
			for (var i = 0; i < aFilters.length; i++) {
				if (jQuery.inArray(aFilters[i].getName(), aDisplayItems) === -1) {
					aFilters[i].setVisibleInFilterBar(false);
				}
			}
			//Shows the controlConfiguration in additional group whose key is in aAddItems
			for (var i = 0; i < aAdditionalFilters.length; i++) {
				this._oFilterBar.addFieldToAdvancedArea(aAdditionalFilters[i]);
			}

			//Set the filter which has value but not shown in advanced area in current variant
			var aFilter = [];
			for (var oItem in oFilterData) {
				aFilter.push(oItem);
			}
			var aAllFilterItems = this._oFilterBar.getFilterGroupItems();
			for (var i = 0; i < aAllFilterItems.length; i++) {
				if (jQuery.inArray(aAllFilterItems[i].getName(), aFilter) !== -1) {
					aAllFilterItems[i].setPartOfCurrentVariant(true);
				}
			}
			//Get data in filter before navigation
			this._oFilterBar.setFilterData(oFilterData, true);

		},

		/**
		 * Initialize the page with data saved in app state before navigation
		 * @public
		 */
		initAppState: function () {
			this.oNavigationHandler = new NavigationHandler(this);
			var oParseNavigationPromise = this.oNavigationHandler.parseNavigation();
			this.customDataForRefresh = null;
			this.customDataForCrossApp = null;

			oParseNavigationPromise.done(function (oAppData, oURLParameters, sNavType) {

				//Back navigation with sap-iapp-state parameter
				if (sNavType === sap.ui.generic.app.navigation.service.NavType.iAppState) {
					if (!jQuery.isEmptyObject(oAppData.customData)) {
						var oIconTabBar = this.byId("QR_ICONTABBAR");
						this.updateFilters(oAppData.customData);

						//if this function is called after page refershing,
						//should reset filter datas on event "Initialized" for smart filter bar.
						if (this._oFilterBar.getFilterData() === null &&
							oAppData.customData.filterData) {
							this.customDataForRefresh = oAppData.customData;
						}

						//If we selected tab "Sample" before navigation, when nav back we should show the "Sample" tab at first
						if (oAppData.customData.tabSelectedKey === this.Constants.WorkListTabKey.PhysicalSample) {
							this.byId("qrWorkListId-PhysicalSample").setVisible(true);
						}
						oIconTabBar.setSelectedKey(oAppData.customData.tabSelectedKey);
						oIconTabBar.fireSelect();

						//Set personalization setting saved to four table
						this._oInspectionLotSmartTable.setCurrentVariantId(oAppData.customData.lotTableVariantId);
						this._oInspectionLotSmartTable.applyVariant(oAppData.customData.lotTableVariant);
						this._oOperationsSmartTable.setCurrentVariantId(oAppData.customData.operationTableVariantId);
						this._oOperationsSmartTable.applyVariant(oAppData.customData.operationTableVariant);
						this._oPhysicalSampleSmartTable.setCurrentVariantId(oAppData.customData.sampleTableVariantId);
						this._oPhysicalSampleSmartTable.applyVariant(oAppData.customData.sampleTableVariant);
						this._oMasterCharacteristicsSmartTable.setCurrentVariantId(oAppData.customData.micTableVariantId);
						this._oMasterCharacteristicsSmartTable.applyVariant(oAppData.customData.micTableVariant);

						//Show items displayed before navigation in Inspection Lot table
						//	this._oInspectionLotTable.setGrowingThreshold(oAppData.customData.lotTableItemsCount);
						//Get all marked items in Inspection Lot table before navigation 
						this._aSelectedLotItems = oAppData.customData.lotTableSelectedItems;

						//Show items displayed before navigation in Operation table
						//	this._oOperationsTable.setGrowingThreshold(oAppData.customData.operationTableItemsCount);
						//Get all marked items in Operation table before navigation 
						this._aSelectedOperationItems = oAppData.customData.operationTableSelectedItems;

						//Show items displayed before navigation in Sample table
						//		this._oPhysicalSampleTable.setGrowingThreshold(oAppData.customData.sampleTableItemsCount);
						//Get all marked items in Sample table before navigation 
						this._aSelectedSampleItems = oAppData.customData.sampleTableSelectedItems;

						//Show items displayed before navigation in MIC table
						//	this._oMasterCharacteristics.setGrowingThreshold(oAppData.customData.micTableItemsCount);
						//Get all marked items in MIC table before navigation 
						this._aSelectedMICItems = oAppData.customData.micTableSelectedItems;

						//Clear app state
						//var oInnerAppData = {};
						//this.oNavigationHandler.storeInnerAppState(oInnerAppData);
					}
					//Cross-app navigation with sap-xapp-state parameter
				} else if (sNavType === sap.ui.generic.app.navigation.service.NavType.xAppState) {
					var oSelectionVariant = oAppData.oSelectionVariant;

					//Set InspectionLotEndDate filter value from URL
					var oTodayDate = new Date();
					var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
					oTodayDate = new Date(oTodayDate.getFullYear(), oTodayDate.getMonth(), oTodayDate.getDate());
					var oTomorrowDate = new Date(oTodayDate.getTime() + oneDay);
					var OTwoDaysLaterDate = new Date(oTodayDate.getTime() + oneDay * 2);
					var sTodayDate = oTodayDate.toISOString();
					var sTomorrowDate = oTomorrowDate.toISOString();
					var sTwoDaysLaterDate = OTwoDaysLaterDate.toISOString();

					if (oSelectionVariant.getSelectOption("InspLotEndDateGrp")) {
						oSelectionVariant.getSelectOption("InspLotEndDateGrp").forEach(function (item, index) {
							if (item.Low === "1") {
								oSelectionVariant.addSelectOption("InspectionLotEndDate", "I", "LT", sTodayDate, null);
							} else if (item.Low === "2") {
								oSelectionVariant.addSelectOption("InspectionLotEndDate", "I", "EQ", sTodayDate, null);
							} else if (item.Low === "3") {
								oSelectionVariant.addSelectOption("InspectionLotEndDate", "I", "EQ", sTomorrowDate, null);
							} else if (item.Low === "4") {
								oSelectionVariant.addSelectOption("InspectionLotEndDate", "I", "EQ", sTwoDaysLaterDate, null);
							} else if (item.Low === "5") {
								oSelectionVariant.addSelectOption("InspectionLotEndDate", "I", "GT", sTwoDaysLaterDate, null);
							}
						});
						oSelectionVariant.removeSelectOption("InspLotEndDateGrp");
					}

					// Set InspLotIsTaskListRequired filter value from URL
					var aInspLotIsTaskListRequired = oSelectionVariant.getSelectOption("InspLotIsTaskListRequired");
					if (aInspLotIsTaskListRequired) {
						aInspLotIsTaskListRequired.forEach(function (item, index) {
							if (item.Low === "true" || item.Low === "X") {
								item.Low = "true";
							} else if (item.Low === "false" || item.Low === "") {
								item.Low = "false";
							}
						});
						oSelectionVariant.removeSelectOption("InspLotIsTaskListRequired");
						oSelectionVariant.massAddSelectOption("InspLotIsTaskListRequired", aInspLotIsTaskListRequired);
					}

					oAppData.selectionVariant = oSelectionVariant.toJSONString();

					var customDataForCrossApp = {
						variantId: "",
						filterOptions: oAppData.oSelectionVariant.getPropertyNames(),
						selectionVariant: oAppData.selectionVariant
					};
					if (customDataForCrossApp) {
						var aAllFilterItems = this._oFilterBar.getFilterGroupItems(),
							aFilterOptions = customDataForCrossApp.filterOptions;
						//Set the variant to standard variant
						this._oFilterBar.setCurrentVariantId(customDataForCrossApp.variantId);
						for (var i = 0; i < aAllFilterItems.length; i++) {
							if (jQuery.inArray(aAllFilterItems[i].getName(), aFilterOptions) !== -1) {
								aAllFilterItems[i].setPartOfCurrentVariant(true);
							}
						}
						this._oFilterBar.setDataSuiteFormat(customDataForCrossApp.selectionVariant, true);
					}

					this.customDataForCrossApp = customDataForCrossApp;
				}
			}.bind(this));
		},

		onAfterRendering: function () {
			this._oSelectedTable.destroyHeaderToolbar();
			this._oOperationsTable.destroyHeaderToolbar();
			this._oPhysicalSampleTable.destroyHeaderToolbar();
			this._oMasterCharacteristics.destroyHeaderToolbar();
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * InspectionLot tab smart table before rebind event handler
		 * set select and expand parameter for binding service
		 * @param  {sap.ui.base.Event} oEvent rebind event
		 * @public
		 */
		onInspLotSMTableBeforeRebind: function (oEvent) {
			this._oInspectionLotTable.setGrowingThreshold(20);
			var mBindingParams = oEvent.getParameter("bindingParams");
			var sRequiredField = "InspectionLot,InspLotQuantityUnitDecPlaces,InspLotSampleQtyUnitDecPlaces,InspLotContainerUnitDecPlaces";

			//Add related field, such as description text
			var oOptionalField = {
				InspectionLotOrigin: "InspectionLotOriginText",
				InspectionLotType: "InspectionLotTypeText",
				MatlQualityAuthorizationGroup: 'MatlQltyAuthorizationGrpText',
				BillOfOperationsType: 'BillOfOperationsTypeName',
				BillOfOperationsUsage: 'BillOfOperationsUsageDesc'
			};
			for (var e in oOptionalField) {
				if (mBindingParams.parameters.select.indexOf(e) !== -1) {
					sRequiredField = sRequiredField.concat(',', oOptionalField[e]);
				}
			}

			mBindingParams.parameters.select = [mBindingParams.parameters.select, sRequiredField].join(",");
			mBindingParams.parameters.expand = "ChPrgsItems,OpPrgsItems,OpCmptItems";
		},

		/**
		 * This event is fired after the filter bar was initialized
		 * and the standard variant was obtained.
		 * @public
		 */
		onFilterBarInitialized: function () {
			if (this.customDataForRefresh) {
				//update the values of filter bar from custom data
				this.updateFilters(this.customDataForRefresh);
			}

			if (this.customDataForCrossApp) {
				var aAllFilterItems = this._oFilterBar.getFilterGroupItems(),
					aFilterOptions = this.customDataForCrossApp.filterOptions;
				//Set the variant to standard variant
				this._oFilterBar.setCurrentVariantId(this.customDataForCrossApp.variantId);
				for (var i = 0; i < aAllFilterItems.length; i++) {
					if (jQuery.inArray(aAllFilterItems[i].getName(), aFilterOptions) !== -1) {
						aAllFilterItems[i].setPartOfCurrentVariant(true);
					}
				}
				this._oFilterBar.setDataSuiteFormat(this.customDataForCrossApp.selectionVariant, true);
			}
		},

		/**
		 * Operation tab smart table before rebind event handler
		 * set select and expand parameter for binding service
		 * @param  {sap.ui.base.Event} oEvent rebind event
		 * @public
		 */
		onOperationSMTableBeforeRebind: function (oEvent) {
			this._oOperationsTable.setGrowingThreshold(20);
			var mBindingParams = oEvent.getParameter("bindingParams");
			var sRequiredField =
				"InspectionLot,InspectionOperation,InspCharAcceptedCount,InspCharRejectedCount,InspCharOpenCount,InspOpUsageDecisionValuation";

			//Add related field, such as description text
			var oOptionalField = {
				InspectionLotOrigin: "InspectionLotOriginText",
				InspectionLotType: "InspectionLotTypeText",
				InspectionLotQuantity: "InspLotQuantityUnitDecPlaces"
			};
			for (var e in oOptionalField) {
				if (mBindingParams.parameters.select.indexOf(e) !== -1) {
					sRequiredField = sRequiredField.concat(',', oOptionalField[e]);
				}
			}

			mBindingParams.parameters.select = [mBindingParams.parameters.select, sRequiredField].join(",");
			mBindingParams.parameters.expand = "ChPrgsItemsByOp";
		},
		/**
		 * Operation tab smart table before rebind event handler
		 * set select and expand parameter for binding service
		 * @param  {sap.ui.base.Event} oEvent rebind event
		 * @public
		 */
		onMtrSmplSMTableBeforeRebind: function (oEvent) {
			this._oPhysicalSampleTable.setGrowingThreshold(20);
			var mBindingParams = oEvent.getParameter("bindingParams");
			var sRequiredField = "InspectionLot,MaterialSample,InspCharAcceptedCount,InspCharRejectedCount,InspCharOpenCount";

			//Add related field, such as description text
			var oOptionalField = {
				InspectionLotOrigin: "InspectionLotOriginText",
				InspectionLotType: "InspectionLotTypeText",
				InspectionLotQuantity: 'InspLotQuantityUnitDecPlaces'
			};
			for (var e in oOptionalField) {
				if (mBindingParams.parameters.select.indexOf(e) !== -1) {
					sRequiredField = sRequiredField.concat(',', oOptionalField[e]);
				}
			}

			mBindingParams.parameters.select = [mBindingParams.parameters.select, sRequiredField].join(",");
			mBindingParams.parameters.expand = "ChPrgsItemsByMs";
		},
		/**
		 * Master Characteristics tab smart table before rebind event handler
		 * set select and expand parameter for binding service
		 * @param  {sap.ui.base.Event} oEvent rebind event
		 * @public
		 */
		onMICSMTableBeforeRebind: function (oEvent) {
			this._oMasterCharacteristics.setGrowingThreshold(20);
			var mBindingParams = oEvent.getParameter("bindingParams");
			var sRequiredField =
				"InspectionSpecificationPlant,InspectionSpecificationText,InspectionSpecification,InspectionSpecificationVersion," +
				"InspectionMethod,InspectionMethodPlant,InspectionMethodText,InspectionMethodVersion,ProdnRsceToolCategory," +
				"ProductionResourceToolDesc,ProductionResourceTool,InspectorQualification";
			mBindingParams.parameters.select = [mBindingParams.parameters.select, sRequiredField].join(",");

			mBindingParams.parameters.expand = "MastCharPgItem";
		},
		/**
		 * Triggered by the table's 'updateFinished' event: after new table.
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var iTotalItems = oEvent.getParameter("total");

			if (oEvent.getSource().getId().indexOf("inspectionLotTable") > -1) {
				//this.getModel("workListView").setProperty("/inspectionLotCount", iTotalItems);
				this.updateTableData(this._oInspectionLotTable, this._aSelectedLotItems);
				this._aSelectedLotItems = [];
			} else if (oEvent.getSource().getId().indexOf("operationsTable") > -1) {
				//this.getModel("workListView").setProperty("/operationsLotCount", iTotalItems);
				this.updateTableData(this._oOperationsTable, this._aSelectedOperationItems);
				this._aSelectedOperationItems = [];
			} else if (oEvent.getSource().getId().indexOf("physicalSampleTable") > -1) {
				//this.getModel("workListView").setProperty("/PhysicalSampleLotCount", iTotalItems);
				this.byId("qrWorkListId-PhysicalSample").setVisible(iTotalItems > 0);
				this.updateTableData(this._oPhysicalSampleTable, this._aSelectedSampleItems);
				this._aSelectedSampleItems = [];
			} else {
				//this.getModel("workListView").setProperty("/MastercharacteristicCount", iTotalItems);
				this.updateTableData(this._oMasterCharacteristics, this._aSelectedMICItems);
				this._aSelectedMICItems = [];
			}
			this.onInspectionLotChange();

		},

		/**
		 * Update table visible items and selected items according to the data saved in app state
		 * @param {object} oTable the table need to update display of items
		 * @param {array} aSelectedItems the items data saved in app state
		 * @public
		 */
		updateTableData: function (oTable, aSelectedItems) {
			//Set the growingThreshold property of the table to default value 20
			oTable.setGrowingThreshold(20);
			//Mark the items selected before navigation according to data saved in app state
			if (aSelectedItems && aSelectedItems.length > 0) {
				oTable.getItems().forEach(function (oItem) {
					if (aSelectedItems.indexOf(oItem.getBindingContextPath()) !== -1) {
						oItem.setSelected(true);
					}
				}, this);
			}
		},

		/**
		 * When press the inspection lot number, we navigate to the inspection lot detail page
		 * And put this page informations into the local storage.
		 * @public
		 */
		onInspectionLotPress: function (oEvent) {
			var sInspectionLot = oEvent.getSource().getProperty("title"),
				sSemanticObject = "InspectionLot",
				sAction = "display",
				oParameter = {
					InspectionLot: sInspectionLot
				},
				oInnerAppData = this.getAppData();
			this.oNavigationHandler.navigate(sSemanticObject, sAction, oParameter, oInnerAppData);
		},

		/**
		 * When press the material ID, we navigate to the material factsheet page
		 * And put this page informations into the local storage.
		 * @public
		 */
		onMaterialPress: function (oEvent) {
			var sMaterialId = oEvent.getSource().getProperty("title"),
				sSemanticObject = "Material",
				sAction = "displayFactSheet",
				oParameter = {
					Material: sMaterialId
				},
				oInnerAppData = this.getAppData();
			this.oNavigationHandler.navigate(sSemanticObject, sAction, oParameter, oInnerAppData);
		},

		/**
		 * Save the page data into app state, including filters data, tab icon selected, items displayed in four tables
		 * @public
		 */
		getAppData: function () {
			var aOtherFilters = this._oFilterBar.getFilterGroupItems(),
				aAddItems = [];
			//Get the key of the controlConfiguration shows in advanced area
			for (var i = 0; i < aOtherFilters.length; i++) {
				if (aOtherFilters[i].getVisibleInAdvancedArea()) {
					aAddItems.push(aOtherFilters[i].getName());
				}
			}
			//Get the variant id of filter bar and data in filter
			var sVariantId = this._oFilterBar.getCurrentVariantId();
			var oFilterData = this._oFilterBar.getFilterData();
			//Get visible items and table variant of four table
			var aLotTableItems = this._oInspectionLotTable.getItems(),
				aOperationTableItems = this._oOperationsTable.getItems(),
				aSampleTableItems = this._oPhysicalSampleTable.getItems(),
				aMicTableItems = this._oMasterCharacteristics.getItems(),
				oLotTableVariant = this._oInspectionLotSmartTable.fetchVariant(),
				oOperationTableVariant = this._oOperationsSmartTable.fetchVariant(),
				oSampleTableVariant = this._oPhysicalSampleSmartTable.fetchVariant(),
				oMicTableVariant = this._oMasterCharacteristicsSmartTable.fetchVariant();
			//Save the app data before navigation in app state 
			var oInnerAppData = {
				customData: {
					displayFilters: aAddItems,
					tabSelectedKey: this._oSelectedTab,
					lotTableItemsCount: this.getVisibleItemsCount(aLotTableItems, oLotTableVariant),
					lotTableSelectedItems: this._oInspectionLotTable.getSelectedContextPaths(),
					operationTableItemsCount: this.getVisibleItemsCount(aOperationTableItems, oOperationTableVariant),
					operationTableSelectedItems: this._oOperationsTable.getSelectedContextPaths(),
					sampleTableItemsCount: this.getVisibleItemsCount(aSampleTableItems, oSampleTableVariant),
					sampleTableSelectedItems: this._oPhysicalSampleTable.getSelectedContextPaths(),
					micTableItemsCount: this.getVisibleItemsCount(aMicTableItems, oMicTableVariant),
					micTableSelectedItems: this._oMasterCharacteristics.getSelectedContextPaths(),
					filterData: oFilterData,
					variantId: sVariantId,
					lotTableVariant: oLotTableVariant,
					lotTableVariantId: this._oInspectionLotSmartTable.getCurrentVariantId(),
					operationTableVariant: oOperationTableVariant,
					operationTableVariantId: this._oOperationsSmartTable.getCurrentVariantId(),
					sampleTableVariant: oSampleTableVariant,
					sampleTableVariantId: this._oPhysicalSampleSmartTable.getCurrentVariantId(),
					micTableVariant: oMicTableVariant,
					micTableVariantId: this._oMasterCharacteristicsSmartTable.getCurrentVariantId()
				}
			};
			return oInnerAppData;
		},

		/**
		 * Get count of visible items in table without group header
		 * @param {array} aItems Visible items in table
		 * @param {object} oVariant Table variant
		 * @public
		 */
		getVisibleItemsCount: function (aItems, oVariant) {
			var iCount = 0;
			if (oVariant.group) {
				aItems.forEach(function (oItem) {
					if (!oItem.isGroupHeader()) {
						iCount++;
					}
				});
				return iCount;
			} else {
				return aItems.length;
			}
		},

		/**
		 * When press the Operation, we navigate to the Operation page
		 * And put this page informations into the local storage.
		 * @public
		 */
		onOperationPress: function (oEvent) {
			var sInspectionLot = oEvent.getSource().getBindingContext().getObject().InspectionLot,
				sOperation = oEvent.getSource().getProperty("title"),
				sAction = "display",
				sSemanticObject = "InspectionOperation",
				oParameter = {
					InspectionLot: sInspectionLot,
					InspectionOperation: sOperation
				},
				oInnerAppData = this.getAppData();
			this.oNavigationHandler.navigate(sSemanticObject, sAction, oParameter, oInnerAppData);
		},

		/**
		 * Navigate to another APP page
		 * @param {string} sSemanticObject Semantic Object of the APP navigated to
		 * @param {string} sAction Action of the APP navigated to
		 * @param {object} oPara parameters of the APP navigated to
		 * @public
		 */
		navToOtherApp: function (sSemanticObject, sAction, oPara) {
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
		},

		/**
		 * Event handler when a icon tab gets pressed.
		 * Check to allow addCharecterstic based on the tab selection.
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onIconTabBarPressed: function (oEvent) {
			var selectedTabKey = oEvent.getSource().getSelectedKey();
			switch (selectedTabKey) {
			case this.Constants.WorkListTabKey.InspLot:
				this._oSelectedTab = this.Constants.WorkListTabKey.InspLot;
				this._oSelectedTable = this._oInspectionLotTable;
				break;
			case this.Constants.WorkListTabKey.Operation:
				this._oSelectedTab = this.Constants.WorkListTabKey.Operation;
				this._oSelectedTable = this._oOperationsTable;
				break;
			case this.Constants.WorkListTabKey.PhysicalSample:
				this._oSelectedTab = this.Constants.WorkListTabKey.PhysicalSample;
				this._oSelectedTable = this._oPhysicalSampleTable;
				break;
			case this.Constants.WorkListTabKey.MIC:
				this._oSelectedTab = this.Constants.WorkListTabKey.MIC;
				this._oSelectedTable = this._oMasterCharacteristics;
				break;
			}
			//Update the model on tab change to get the latest data related to selected tab.
			this.onInspectionLotChange();
		},
		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * Every time fresh model to be created to update the change on list item select .
		 * @public
		 */
		onInspectionLotChange: function () {
			var oSelectedInspectionLots = this._oSelectedTable.getSelectedItems(),
				oSelectedLotModel = new JSONModel();
			oSelectedLotModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			if (oSelectedInspectionLots.length !== 0) {
				var oSelectedFirstInspectionLot = oSelectedInspectionLots[0].getBindingContext().getObject();
				this._oInspectionLot = oSelectedFirstInspectionLot.InspectionLot;
				oSelectedLotModel.setData(oSelectedFirstInspectionLot);
				this.getOwnerComponent().setModel(oSelectedLotModel, "selectedLotModel");
				this._oOperation = oSelectedFirstInspectionLot.InspectionOperation;
				// set selected items model for RecordResults page
				this.setRecordResultsInspectionLotsModel(oSelectedInspectionLots);
				// toggle mass record buttom
				if (this._oSelectedTable.getMode() == sap.m.ListMode.MultiSelect) {
					this._oMassRecordButton.setEnabled(true);
				}
			} else {

				this.getOwnerComponent().setModel(oSelectedLotModel, "selectedLotModel");
				this._oInspectionLot = "";
				this._oOperation = "";
				// set a empty model for RecordResults page
				this.setRecordResultsInspectionLotsModel([]);
				// toggle mass record buttom
				this._oMassRecordButton.setEnabled(false);

			}
			this.getModel("selectedLotModel").setProperty("/selectedTab", this._oSelectedTab);
		},

		/**
		 * table item press event handler
		 * trigger: when table mode is SingleSelect and item is pressed
		 * behave: navigate to record result page
		 * @param  {sap.ui.base.Event} oEvent press event
		 * @public
		 */
		onWorkListItemPress: function (oEvent) {
			var oSelectedItem = oEvent.getSource();
			this.setRecordResultsInspectionLotsModel([oSelectedItem]);
			// navigation
			this.onRecordResults();
		},

		/**
		 * Navigate to RecordResult.view.xml page
		 * triggered by onWorkListItemPress or Mass Record Results button pressed
		 * @param {sap.ui.base.Event} oEvent.
		 * @public
		 */
		onRecordResults: function () {
			// use NavHelper to do navigate
			this.NavHelper.navTo(this._oRouter, "recordResults", {
				fromTab: this._oSelectedTab
			});
		},

		/**
		 * Triggered by applyFilterChanges,clearFilters methods.
		 * Updates the WorkList page and tables based on the Filters events.
		 * a) Inspection Lot.
		 * b) Operations Tab.
		 * c) Samples.
		 * d) Master Characteristics.
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		setWorkListData: function (oFilters) {
			//Collne all tabs items annd apply user selectd filter
			//@ Filters used to set all selected filter values and associated fileds .
			this._oMasterCharacteristics.bindItems({
				path: "/InspectionCharacteristicSet",
				parameters: {
					expand: "MastCharPgItem"
				},
				template: this.byId("masterCharacteristicsItems").clone(),
				templateShareable: true,
				filters: oFilters
			});
		},
		/**
		 * Create Dailog box based on the success or error messages.
		 * @param {String,String,String}.Get the message type ,title,oMessage to show Message Box according to the senario.
		 * @public
		 */
		onCreateMessageDialog: function (oTitle, oStatus, oMessage) {
			var oIcon = "";
			if (oStatus === "Success") {
				oIcon = MessageBox.Icon.SUCCESS;
			} else {
				oIcon = MessageBox.Icon.ERROR;
			}
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(oMessage, {
				icon: oIcon,
				title: oTitle,
				actions: [MessageBox.Action.OK],
				styleClass: bCompact ? "sapUiSizeCompact" : ""
			});
		},

		/**
		 * set selected items model for record resulting page
		 * @param {Array} aSelectedInspectionLotItems selected list items array
		 */
		setRecordResultsInspectionLotsModel: function (aSelectedInspectionLotItems) {
			var oSelectedInspLotsModel = new JSONModel();
			oSelectedInspLotsModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			// get an array of selected object array

			var aSelectedInspLots = aSelectedInspectionLotItems.map(function (oItem) {
				return oItem.getBindingContext().getObject();
			});
			oSelectedInspLotsModel.setData({
				items: aSelectedInspLots,
				filters: this._oFilterBar.getFilters()
			});
			this.getOwnerComponent().setModel(oSelectedInspLotsModel, "selectedModelForRecording");

		},
		/**
		 * Search Free Text the user specifies. This functionality combines Samrt Filter Bar filters and Free Text Filters.
		 * @param  {String} sQuery Search value that the user inputs
		 * @param  {Array} aFreeTextFields Free Text Field Names
		 * @private
		 */
		_searchFreeText: function (sQuery, aFreeTextFields) {
			//Filter for Free Text, using 'or' between filter field
			var oFreeTextFilter = null;
			if (sQuery && aFreeTextFields && aFreeTextFields.length > 0) {
				var aFreeTextFilters = aFreeTextFields.filter((function (e) {
					// ignore those fields whose date element length are less than the given query value
					// , in order to avoid the backend Open Sql Error: SAPSQL_LIKE_PATTERN_TOO_LONG
					return sQuery.length <= this._oFreeTextFieldMap[e];
				}).bind(this)).map(function (e) {
					return new sap.ui.model.Filter(e, sap.ui.model.FilterOperator.Contains, sQuery);
				});

				// When there are no filters created for the given query(this happens when user input is too long for any free text fields),
				// no result should be found. So just create a filter which will get nothing.
				if (aFreeTextFilters.length === 0) {
					aFreeTextFilters.push(new sap.ui.model.Filter("InspectionLot", sap.ui.model.FilterOperator.EQ, '0'));
				}

				oFreeTextFilter = new sap.ui.model.Filter(aFreeTextFilters, false);
			}

			//Filter for smart filter bar, using 'and' between filter fields
			var oBarFilter = null;
			if (this._oFilterBar.getFilters().length > 0) {
				oBarFilter = new sap.ui.model.Filter(this._oFilterBar.getFilters(), true);
			}

			//Filter combining SmartFilterBar filters and FreeText filters, using 'and' between these 2 kinds of filters
			var oFilter = null;
			if (oBarFilter && oFreeTextFilter) {
				oFilter = new sap.ui.model.Filter([oBarFilter, oFreeTextFilter], true);
			} else if (oBarFilter) {
				oFilter = oBarFilter;
			} else if (oFreeTextFilter) {
				oFilter = oFreeTextFilter;
			}

			// update list binding of currently selected table
			this._oSelectedTable.getBinding("items").filter(oFilter, "Application");
		},
		/**
		 * Initialize all smart tables of work list page
		 * @private
		 */
		_initSmartTables: function () {
			this._initInspLotSmartTable();
			this._initInspLotByOperationSmartTable();
			this._initInspLotByMtrSmplSmartTable();
			this._initMasterCharacteristicsSmartTable();
		},
		/**
		 * Initialize ignore columns for inspection lots list
		 * @private
		 */
		_initInspLotSmartTable: function () {
			var oSmTable = this.byId("inspectionLotSmartTable");
			// don't display those fields which are used for filters only
			var sIgnoredFields =
				"InspLotIsStockPostingCompleted,InspectionLotIsSkipped,InspectionLotIsFullInspection,InspLotIsSerialNmbrPossible,NumberOfSerialNumbers,MatlQltyAuthorizationGrpText" +
				"SmplDrwgProcedIsConfRequired,InspectionDynamicStage,InspectionSeverity,InspectionLotHasPartialLots,InspLotIsAutomUsgeDcsnPossible,InspLotHasConfignSpecification," +
				"InspLotIsTaskListRequired,InspLotHasManualSampleSize,InspLotHasMaterialSpec,InspLotDigitalSgntrResultsRecg,InspLotIsBatchRequired,InspectionLotHasUsageDecision," +
				"InspectionOperation,InspectionOperationPlant,OperationControlProfile,OperationText,InspectionSubSystem,OperationConfirmation,WorkCenter,InspectionCharacteristic," +
				"InspectionCharacteristicStatus,InspectionMethodPlant,InspectionMethod,InspectionSpecificationPlant,InspectionSpecification,InspSpecImportanceCode,InspectionCharacteristicText," +
				"InspectorQualification,InspSpecInformationField1,InspSpecInformationField2,InspSpecInformationField3,InspectionSubsetSortKey,Equipment,FunctionalLocation,MaterialSample," +
				"InspectionSubsetLongCharKey,InspectionSubsetShortCharKey,InspSubsetLongNumericKey,InspSubsetShortNumericKey,InspectionSubsetDate,InspectionSubsetTime,InspSubsetUsageDcsnCodeGroup," +
				"InspSubsetUsageDcsnCode,InspSubsetUsageDcsnValuation,MaterialSampleType,MaterialSampleCategory,StorageLocation,MaterialSampleStorageLocation,MaterialSampleChangedOn," +
				"MaterialSampleDrawingLocation,MatlSmplDrawingLocDescription,MaterialSampleDrawingOnDate,MaterialSampleDrawingOnTime,MaterialSampleResponsibleName,InspLotCostCollectorSalesOrder," +
				"InspLotCostCollectorSlsOrdItem,StorageBin,InspectionLotStartTime,InspectionLotEndTime,SalesOperationsPlanningOrder,Warehouse,StorageType,InspectionLotOriginText," +
				"InspectionLotTypeText,InspLotAcctAssgmtKey,InspLotQuantityUnitDecPlaces,InspLotSampleQtyUnitDecPlaces,InspLotContainerUnitDecPlaces,InspLotIsDocumentationRequired," +
				"InspectionLotStartTime,InspCharOpenCount,InspCharAcceptedCount,InspOpOpenCmpltCount,InspCharRejectedCount,InspOpOpenCount,InspOpRjctdCount,InspOpAcceptCount,InspOpAcceptCmpltCount,InspOpRjctdCmpltCount,InspectionLotEndTime,SmplDrawingProcedure,Warehouse,StorageType,StorageBin,BillOfOperationsTypeName,BillOfOperationsUsageDesc,MaterialName,InspLotUsageDecisionCatalog,InspLotRsltRecgStatus";

			oSmTable.setIgnoredFields(sIgnoredFields);
		},
		/**
		 * Initialize smart table binding and ignore columns for inspection lots by operation list
		 * @private
		 */
		_initInspLotByOperationSmartTable: function () {
			var oSmTable = this.byId("inspLotByOperationSmartTable");
			// don't display those fields which are used for filters only
			var sIgnoredFields =
				"BatchBySupplier,InspLotIsStockPostingCompleted,InspectionLotIsSkipped,InspectionLotIsFullInspection,InspLotIsSerialNmbrPossible,NumberOfSerialNumbers," +
				"SmplDrawingProcedure,SmplDrwgProcedIsConfRequired,InspectionDynamicStage,InspectionSeverity,InspectionLotHasPartialLots,InspLotIsAutomUsgeDcsnPossible,InspLotHasConfignSpecification," +
				"InspLotIsTaskListRequired,InspLotHasManualSampleSize,InspLotHasMaterialSpec,InspLotDigitalSgntrResultsRecg,InspLotIsBatchRequired,InspectionLotHasUsageDecision," +
				"SalesOrder,InspectionOperation,InspectionOperationPlant,OperationControlProfile,InspectionSubSystem,OperationConfirmation,InspectionCharacteristic,InspectionCharacteristicStatus," +
				"InspectionMethodPlant,InspectionMethod,InspectionSpecificationPlant,InspectionSpecification,InspSpecImportanceCode,InspectionCharacteristicText,InspectorQualification," +
				"InspSpecInformationField1,InspSpecInformationField2,InspSpecInformationField3,InspectionSubsetSortKey,Equipment,FunctionalLocation,MaterialSample,InspectionSubsetLongCharKey," +
				"InspectionSubsetShortCharKey,InspSubsetLongNumericKey,InspSubsetShortNumericKey,InspectionSubsetDate,InspectionSubsetTime,InspSubsetUsageDcsnCodeGroup,InspSubsetUsageDcsnCode," +
				"InspSubsetUsageDcsnValuation,MaterialSampleType,MaterialSampleCategory,StorageLocation,MaterialSampleStorageLocation,MaterialSampleChangedOn,MaterialSampleDrawingLocation," +
				"MatlSmplDrawingLocDescription,MaterialSampleDrawingOnDate,MaterialSampleDrawingOnTime,MaterialSampleResponsibleName,InspCharAcceptedCount,InspCharRejectedCount,InspCharOpenCount,WorkCenter," +
				"GoodsReceiptIsMovedToBlkdStock,InspectionLotHasQuantity,InspectionLotHasPartialLots,InspLotIsDocumentationRequired,InspectionLotApproval,InspLotDigitalSgntrResultsRecg," +
				"InspLotDigitalSgntrResultsRecg,InspectionLotIsFullInspection,InspectionLotStartTime,InspectionLotEndTime,BillOfOperationsType,BillOfOperationsGroup,BillOfOperationsUsage," +
				"BillOfOperationsVariant,InspSubsetFieldCombination,SmplDrawingProcedure,SmplDrwgProcedIsConfRequired,InspLotSelectionValidFromDate,ManufacturerPartNmbr,MaterialIsBatchManaged," +
				"MaterialCompIsSpecialStock,PurchasingOrganization,MatlDocLatestPostgDate,GoodsMovementType,InspectionLotPlant,InspectionLotStorageLocation,Warehouse,StorageType,StorageBin," +
				"DeliveryCategory,Route,BillToPartyCountry,SoldToParty,SalesOrganization,MaterialByCustomer,InspLotNmbrAddlRecordedCharc,InspLotNmbrOpenShortTermCharc,InspLotNmbrOpenLongTermCharc," +
				"InspectionDynamicStage,InspectionSeverity,CostCenter,SalesOrdStockWBSElement,ProfitCenter,BusinessArea,GLAccount,ControllingArea,CompanyCode,SerialNumberProfile," +
				"InspOpUsgeDcsnDynValuation,InspLotDigitalSgntrInUsgeDcsn,InspOpUsageDecisionCatalog,MaterialName,InspCharAcceptedCount,InspCharRejectedCount,InspCharOpenCount," +
				"InspectionLotStartTime,InspectionLotEndTime,Warehouse,StorageType,StorageBin,InspectionLotOriginText,InspectionLotTypeText,InspLotQuantityUnitDecPlaces," +
				"InspLotUsageDecisionCodeGroup,InspectionLotUsageDecisionCode,SalesOperationsPlanningOrder,InspLotRsltRecgStatus";

			oSmTable.setIgnoredFields(sIgnoredFields);
		},
		/**
		 * Initialize smart table binding and ignore columns for inspection lots by Physical sample list
		 * @private
		 */
		_initInspLotByMtrSmplSmartTable: function () {
			var oSmTable = this.byId("inspLotByMtrSmplSmartTable");
			// don't display those fields which are used for filters only
			var sIgnoredFields =
				"BatchBySupplier,InspLotIsStockPostingCompleted,InspectionLotIsSkipped,InspectionLotIsFullInspection,InspLotIsSerialNmbrPossible," +
				"NumberOfSerialNumbers,SmplDrawingProcedure,SmplDrwgProcedIsConfRequired,InspectionDynamicStage,InspectionSeverity," +
				"InspectionLotHasPartialLots,InspLotIsAutomUsgeDcsnPossible,InspLotHasConfignSpecification,InspLotIsTaskListRequired," +
				"InspLotHasManualSampleSize,InspLotHasMaterialSpec,InspLotDigitalSgntrResultsRecg,InspLotIsBatchRequired,InspectionLotHasUsageDecision," +
				"SerialNumberProfile,MaterialIsBatchManaged,PurchasingOrganization,GoodsMovementType,ManufacturerPartNmbr,GoodsReceiptIsMovedToBlkdStock," +
				"InspectionLotHasQuantity,Warehouse,StorageType,StorageBin,MaterialCompIsSpecialStock,InspectionLotStorageLocation,SoldToParty,DeliveryCategory," +
				"Route,BillToPartyCountry,SalesOrganization,MaterialByCustomer,BillOfOperationsType,BillOfOperationsGroup,BillOfOperationsUsage,BillOfOperationsVariant," +
				"InspLotNmbrAddlRecordedCharc,InspLotNmbrOpenShortTermCharc,InspLotNmbrOpenLongTermCharc,CostCenter,SalesOrdStockWBSElement,QualityCostCollector," +
				"ProfitCenter,BusinessArea,GLAccount,ControllingArea,CompanyCode,InspLotDigitalSgntrInUsgeDcsn,WorkCenter,InspLotUsageDecisionCodeGroup," +
				"InspectionLotUsageDecisionCode,StorageLocation,InspectionOperation,InspectionOperationPlant,OperationControlProfile,InspectionSubSystem," +
				"OperationConfirmation,OperationText,InspectionCharacteristic,InspectionCharacteristicStatus,InspectionMethodPlant,InspectionMethod," +
				"InspectionSpecificationPlant,InspectionSpecification,InspSpecImportanceCode,InspectionCharacteristicText,InspectorQualification," +
				"InspSpecInformationField1,InspSpecInformationField2,InspSpecInformationField3,InspectionSubsetSortKey,Equipment,FunctionalLocation," +
				"InspectionSubsetLongCharKey,InspectionSubsetShortCharKey,InspSubsetLongNumericKey,InspSubsetShortNumericKey,InspectionSubsetDate," +
				"InspectionSubsetTime,InspSubsetUsageDcsnCodeGroup,InspSubsetUsageDcsnCode,InspSubsetUsageDcsnValuation,InspCharAcceptedCount," +
				"InspCharRejectedCount,InspCharOpenCount,InspectionLotOriginText,InspectionLotTypeText,InspLotAcctAssgmtKey,InspLotQuantityUnitDecPlaces," +
				"InspLotIsDocumentationRequired,InspSubsetFieldCombination,SalesOperationsPlanningOrder,MatlDocLatestPostgDate,MaterialName," +
				"InspCharCount,InspLotRsltRecgStatus";

			oSmTable.setIgnoredFields(sIgnoredFields);
		},
		onAssignedFiltersChanged: function (oEvent) {
			if (this._oStatusText && this._oFilterBar) {
				var sText = this._oFilterBar.retrieveFiltersWithValuesAsText();
				this._oStatusText.setText(sText);
			}
		},
		/**
		 * Initialize smart table ignore columns for Master Characteristics list
		 * @private
		 */
		_initMasterCharacteristicsSmartTable: function () {
			var oSmTable = this.byId("masterCharacteristicsSmartTable");
			// don't display those fields which are used for filters only
			var sIgnoredFields =
				"InspCharCount,InspectionOperation,AccountAssignmentCategory,AccountingDocumentType,Batch,BatchBySupplier,BatchStorageLocation,BillOfOperationsGroup,BillOfOperationsType,BillOfOperationsUsage," +
				"BillOfOperationsVariant,BillToPartyCountry,BusinessArea,CompanyCode,ControllingArea,CostCenter,Customer,DeliveryCategory,DeliveryDocument,DeliveryDocumentItem,Equipment,FunctionalLocation," +
				"GLAccount,GoodsMovementType,GoodsReceiptIsMovedToBlkdStock,InspectionCharacteristic,InspectionCharacteristicStatus,InspectionCharacteristicText,InspectionDynamicStage,InspectionLot," +
				"InspectionLotActualQuantity,InspectionLotApproval,InspectionLotChangeDate,InspectionLotChangedBy,InspectionLotChangeTime,InspectionLotContainer,InspectionLotContainerUnit,InspectionLotCreatedBy," +
				"InspectionLotCreatedOn,InspectionLotCreatedOnTime,InspectionLotDefectiveQuantity,InspectionLotEndDate,InspectionLotEndTime,InspectionLotHasPartialLots,InspectionLotHasQuantity,InspectionLotHasUsageDecision," +
				"InspectionLotIsFullInspection,InspectionLotIsSkipped,InspectionLotObjectText,InspectionLotOrigin,InspectionLotPlant,InspectionLotQualityScore,InspectionLotQuantity,InspectionLotQuantityUnit," +
				"InspectionLotSampleQuantity,InspectionLotSampleUnit,InspectionLotScrapRatio,InspectionLotStartDate,InspectionLotStartTime,InspectionLotStorageLocation,InspectionLotText,InspectionLotType,InspectionLotUsageDecidedBy," +
				"InspectionLotUsageDecidedOn,InspectionLotUsageDecisionCode,InspectionOperationPlant,InspectionSeverity,InspectionSubsetDate,InspectionSubsetLongCharKey,InspectionSubsetShortCharKey," +
				"InspectionSubsetSortKey,InspectionSubsetTime,InspectionSubSystem,InspectorQualification,InspLotAcctAssgmtKey,InspLotBatchTransferredTo,InspLotCreatedOnLocalDate,InspLotCostCollectorSlsOrdItem,InspLotCreatedOnLocalTime," +
				"InspLotDigitalSgntrInUsgeDcsn,InspLotCostCollectorSalesOrder,InspLotDigitalSgntrResultsRecg,InspLotExternalNumber,InspLotHasConfignSpecification,InspLotHasManualSampleSize,InspLotHasMaterialSpec,InspLotIsAutomUsgeDcsnPossible," +
				"InspLotIsBatchRequired,InspLotIsDocumentationRequired,InspLotIsSerialNmbrPossible,InspLotIsStockPostingCompleted,InspLotIsTaskListRequired,InspLotMaterialPostedTo,InspLotNmbrAddlRecordedCharc,InspLotNmbrOpenLongTermCharc," +
				"InspLotNmbrOpenShortTermCharc,InspLotQtyDestroyed,InspLotQtyInspected,InspLotQtyReturnedToSupplier,InspLotQtyToAnotherMaterial,InspLotQtyToBePosted,InspLotQtyToBlocked,InspLotQtyToFree,InspLotQtyToOtherStock,InspLotQtyToReserves," +
				"InspLotQtyToSample,InspLotQtyToScrap,InspLotQtyToSpecialStock,InspLotSelectionValidFromDate,InspLotSmplQtyForLongTermChar,InspLotUsageDecisionCatalog,InspLotUsageDecisionChangedBy,InspLotUsageDecisionChangedOn," +
				"InspLotUsageDecisionCodeGroup,InspLotUsageDecisionLevel,InspLotUsageDecisionTime,InspLotUsageDecisionValuation,InspLotUsgeDcsnChangedTime,InspLotUsgeDcsnDynValuation,InspLotUsgeDcsnFollowUpAction,InspLotUsgeDcsnSelectedSet," +
				"InspSpecImportanceCode,InspSpecInformationField1,InspSpecInformationField2,InspSpecInformationField3,InspSubsetLongNumericKey,InspSubsetShortNumericKey,InspSubsetUsageDcsnCode,InspSubsetUsageDcsnCodeGroup,InspSubsetUsageDcsnValuation," +
				"Manufacturer,ManufacturerPartNmbr,ManufacturingOrder,Material,MaterialByCustomer,MaterialCompIsSpecialStock,MaterialDocument,MaterialDocumentItem,MaterialDocumentYear,MaterialIsBatchManaged,MaterialName,MaterialRevisionLevel,MaterialSample," +
				"MaterialSampleCategory,MaterialSampleChangedOn,MaterialSampleCount,MaterialSampleDrawingLocation,MaterialSampleDrawingOnDate,MaterialSampleDrawingOnTime,MaterialSampleResponsibleName,MaterialSampleStorageLocation,MaterialSampleType," +
				"MatlDocLatestPostgDate,MatlQualityAuthorizationGroup,MatlSmplDrawingLocDescription,NumberOfSerialNumbers,ObjectInternalID,NetworkActivityInternalID,OperationConfirmation,OperationControlProfile,OperationText,Plant,ProductionVersion," +
				"ProfitCenter,PurchasingDocument,PurchasingDocumentItem,PurchasingOrganization,QltyCostOrderForAppraisalCost,Route,SalesOperationsPlanningOrder,SalesOrder,SalesOrderItem,SalesOrdStockWBSElement,SalesOrganization,ScheduleLine," +
				"SerialNumberProfile,SmplDrawingProcedure,SmplDrwgProcedIsConfRequired,SoldToParty,StorageBin,StorageLocation,StorageType,Supplier,Warehouse,WorkCenter,InspLotAcctAssgmtKey,BillOfOperations,InspectionMethod,InspectionMethodPlant," +
				"InspectionMethodVersion,InspectionSpecification,InspectionSpecificationPlant,InspectionSpecificationVersion,Operation,ProdnRsceToolCategory,ProductionResourceTool,InspectionMethodText,InspectionSpecificationText,InspLotRsltRecgStatus";

			oSmTable.setIgnoredFields(sIgnoredFields);
		},
		/**
		 * Initialize a map for Free Text Fields and corresponding length. This map is used for free text search.
		 * This map should be maintained when new free text field is needed or any free text field has date element length changed(normally doesn't happen)
		 * @private
		 */
		_initFreeTextFieldsMetadata: function () {
			var oMap = {};

			oMap['InspectionLot'] = 12;
			oMap['InspectionLotPlant'] = 4;
			oMap['InspectionLotObjectText'] = 40;
			oMap['InspectionLotCreatedBy'] = 12;
			oMap['InspectionLotChangedBy'] = 12;
			oMap['Customer'] = 10;
			oMap['Supplier'] = 10;
			oMap['Manufacturer'] = 10;
			oMap['Material'] = 40;
			oMap['MaterialName'] = 40;
			oMap['Batch'] = 10;
			oMap['MaterialDocument'] = 10;
			oMap['SalesOrder'] = 10;
			oMap['DeliveryDocument'] = 10;
			oMap['SoldToParty'] = 10;
			oMap['CostCenter'] = 10;
			oMap['InspectionOperation'] = 4;
			oMap['OperationText'] = 40;
			oMap['WorkCenter'] = 8;
			oMap['InspectionOperationPlant'] = 4;
			oMap['InspectionLotText'] = 40;
			oMap['SalesOrdStockWBSElement'] = 8;
			oMap['MaterialSample'] = 12;
			oMap['InspectionSpecification'] = 8;
			oMap['InspectionSpecificationPlant'] = 4;
			oMap['InspectionSpecificationText'] = 40;
			oMap['InspectionMethod'] = 8;
			oMap['InspectionMethodPlant'] = 4;
			oMap['InspectionMethodSearchField'] = 40;
			oMap['InspectionSpecificationSrchTxt'] = 40;

			this._oFreeTextFieldMap = oMap;
		}
	});
});