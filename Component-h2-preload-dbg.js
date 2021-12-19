/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine('i2d/qm/inspresults/records1/Component',["sap/ui/core/UIComponent","sap/ui/Device","i2d/qm/inspresults/records1/model/models","i2d/qm/inspresults/records1/controller/ErrorHandler","i2d/qm/inspresults/records1/customcontrol/viz/Comparison","i2d/qm/inspresults/records1/customcontrol/viz/StackedBar","i2d/qm/inspresults/records1/customcontrol/CodeGroupInput","i2d/qm/inspresults/records1/customcontrol/NumericInput","i2d/qm/inspresults/records1/customcontrol/CodeGroupMultiInput","i2d/qm/inspresults/records1/customcontrol/NumericMultiInput","i2d/qm/inspresults/records1/customcontrol/ValuationMultiInput","i2d/qm/inspresults/records1/customcontrol/ToggleButtonExt"],function(U,D,m,E){"use strict";return U.extend("i2d.qm.inspresults.records1.Component",{metadata:{manifest:"json"},init:function(){U.prototype.init.apply(this,arguments);this._oErrorHandler=new E(this);this.setModel(m.createDeviceModel(),"device");this.setModel(m.createFLPModel(),"FLP");this.getRouter().initialize();},destroy:function(){this._oErrorHandler.destroy();U.prototype.destroy.apply(this,arguments);},getContentDensityClass:function(){if(this._sContentDensityClass===undefined){if(jQuery(document.body).hasClass("sapUiSizeCozy")||jQuery(document.body).hasClass("sapUiSizeCompact")){this._sContentDensityClass="";}else if(!D.support.touch){this._sContentDensityClass="sapUiSizeCompact";}else{this._sContentDensityClass="sapUiSizeCozy";}}return this._sContentDensityClass;}});});
sap.ui.require.preload({
	"i2d/qm/inspresults/records1/manifest.json":'{"_version":"1.4.0","sap.app":{"_version":"1.2.0","id":"i2d.qm.inspresults.records1","type":"application","resources":"resources.json","i18n":"i18n/i18n.properties","title":"{{appTitle}}","description":"{{appDescription}}","applicationVersion":{"version":"6.0.13"},"ach":"QM-FIO-IM","dataSources":{"mainService":{"uri":"/sap/opu/odata/SAP/QM_RR_SRV/","type":"OData","settings":{"annotations":["mainAnnotations"],"odataVersion":"2.0","localUri":"localService/metadata.xml"}},"mainAnnotations":{"uri":"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName=\'QM_RR_ANNO_MDL\',Version=\'0001\')/$value/","type":"ODataAnnotation","settings":{"localUri":"localService/annotations.xml"}}},"sourceTemplate":{"id":"sap.ui.ui5-template-plugin.1worklist","version":"1.34.1"}},"sap.copilot":{"_version":"1.0.0","contextAnalysis":{"allowAddingObjectsFromAppScreenToCollection":false}},"sap.fiori":{"_version":"1.1.0","registrationIds":["F1685"],"archeType":"transactional"},"sap.ui":{"_version":"1.2.0","technology":"UI5","icons":{"icon":"sap-icon://task","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true},"supportedThemes":["sap_hcb","sap_bluecrystal"]},"sap.ui5":{"_version":"1.1.0","rootView":"i2d.qm.inspresults.records1.view.App","dependencies":{"minUI5Version":"1.56.3","libs":{"sap.ui.core":{"lazy":false},"sap.m":{"lazy":false},"sap.ui.layout":{"lazy":false},"sap.ui.comp":{"lazy":false},"sap.uxap":{"lazy":true},"sap.suite.ui.microchart":{"lazy":false},"sap.ui.generic.app":{"lazy":false}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"i2d.qm.inspresults.records1.i18n.i18n"}},"":{"preload":true,"dataSource":"mainService","settings":{"defaultCountMode":"None"}},"@i18n":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/i18n.properties"}},"resources":{"css":[{"uri":"css/style.css"}]},"config":{"fullWidth":true,"resourceBundle":"i18n/messageBundle.properties","serviceConfig":{"name":"","serviceUrl":"/model/model.json"}},"routing":{"config":{"async":true,"routerClass":"sap.m.routing.Router","viewType":"XML","viewPath":"i2d.qm.inspresults.records1.view","controlId":"app","controlAggregation":"pages","bypassed":{"target":"notFound"}},"routes":[{"pattern":":?sapAppState:","name":"worklist","target":"worklist"},{"pattern":"C_QM_InspectionLots/{objectId}","name":"object","target":"object"},{"pattern":"Record?from={fromTab}","name":"recordResults","target":"recordResults"}],"targets":{"worklist":{"viewName":"Worklist","viewId":"worklist","viewLevel":1},"recordResults":{"viewName":"RecordResults","viewLevel":1,"viewId":"recordResults"},"object":{"viewName":"Object","viewId":"object","viewLevel":3},"objectNotFound":{"viewName":"ObjectNotFound","viewId":"objectNotFound"},"notFound":{"viewName":"NotFound","viewId":"notFound"}}}}}'
},"i2d/qm/inspresults/records1/Component-h2-preload"
);
sap.ui.loader.config({depCacheUI5:{
"i2d/qm/inspresults/records1/Component.js":["i2d/qm/inspresults/records1/controller/ErrorHandler.js","i2d/qm/inspresults/records1/customcontrol/CodeGroupInput.js","i2d/qm/inspresults/records1/customcontrol/CodeGroupMultiInput.js","i2d/qm/inspresults/records1/customcontrol/NumericInput.js","i2d/qm/inspresults/records1/customcontrol/NumericMultiInput.js","i2d/qm/inspresults/records1/customcontrol/ToggleButtonExt.js","i2d/qm/inspresults/records1/customcontrol/ValuationMultiInput.js","i2d/qm/inspresults/records1/customcontrol/viz/Comparison.js","i2d/qm/inspresults/records1/customcontrol/viz/StackedBar.js","i2d/qm/inspresults/records1/model/models.js","sap/ui/Device.js","sap/ui/core/UIComponent.js"],
"i2d/qm/inspresults/records1/controller/App.controller.js":["i2d/qm/inspresults/records1/controller/BaseController.js","sap/ui/model/json/JSONModel.js"],
"i2d/qm/inspresults/records1/controller/BaseController.js":["i2d/qm/inspresults/records1/util/Constants.js","i2d/qm/inspresults/records1/util/NavHelper.js","sap/ui/core/mvc/Controller.js","sap/ui/model/odata/v2/ODataModel.js"],
"i2d/qm/inspresults/records1/controller/ErrorHandler.js":["sap/m/MessageBox.js","sap/ui/base/Object.js"],
"i2d/qm/inspresults/records1/controller/NotFound.controller.js":["i2d/qm/inspresults/records1/controller/BaseController.js"],
"i2d/qm/inspresults/records1/controller/Object.controller.js":["i2d/qm/inspresults/records1/controller/BaseController.js","i2d/qm/inspresults/records1/model/formatter.js","sap/ui/core/routing/History.js","sap/ui/model/json/JSONModel.js"],
"i2d/qm/inspresults/records1/controller/RecordResults.controller.js":["i2d/qm/inspresults/records1/controller/BaseController.js","i2d/qm/inspresults/records1/model/formatter.js","i2d/qm/inspresults/records1/util/CalculationHelper.js","i2d/qm/inspresults/records1/util/NumberFormat.js","sap/m/MessageBox.js","sap/m/MessagePopover.js","sap/m/MessagePopoverItem.js","sap/ui/model/Filter.js","sap/ui/model/json/JSONModel.js"],
"i2d/qm/inspresults/records1/controller/Worklist.controller.js":["i2d/qm/inspresults/records1/controller/BaseController.js","i2d/qm/inspresults/records1/model/formatter.js","sap/m/MessageBox.js","sap/m/Table.js","sap/ui/generic/app/navigation/service/NavigationHandler.js","sap/ui/model/json/JSONModel.js"],
"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsManualValuation.controller.js":["i2d/qm/inspresults/records1/model/formatter.js","sap/ui/core/mvc/Controller.js"],
"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItem1.controller.js":["i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController.js","i2d/qm/inspresults/records1/model/formatter.js"],
"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItem10.controller.js":["i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController.js","i2d/qm/inspresults/records1/model/formatter.js"],
"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItem11.controller.js":["i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController.js","i2d/qm/inspresults/records1/model/formatter.js"],
"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItem2.controller.js":["i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController.js","i2d/qm/inspresults/records1/model/formatter.js"],
"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItem3.controller.js":["i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController.js","i2d/qm/inspresults/records1/model/formatter.js","i2d/qm/inspresults/records1/util/CalculationHelper.js","i2d/qm/inspresults/records1/util/NumberFormat.js"],
"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItem4.controller.js":["i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController.js","i2d/qm/inspresults/records1/model/formatter.js","i2d/qm/inspresults/records1/util/CalculationHelper.js","i2d/qm/inspresults/records1/util/NumberFormat.js"],
"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItem5.controller.js":["i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController.js","i2d/qm/inspresults/records1/model/formatter.js"],
"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItem6.controller.js":["i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController.js","i2d/qm/inspresults/records1/model/formatter.js"],
"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItem7.controller.js":["i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController.js","i2d/qm/inspresults/records1/model/formatter.js"],
"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItem8.controller.js":["i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController.js","i2d/qm/inspresults/records1/model/formatter.js"],
"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItem9.controller.js":["i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController.js","i2d/qm/inspresults/records1/model/formatter.js"],
"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController.js":["sap/ui/core/mvc/Controller.js"],
"i2d/qm/inspresults/records1/customcontrol/CodeGroupInput.js":["i2d/qm/inspresults/records1/model/formatter.js","sap/m/Input.js","sap/ui/model/Filter.js","sap/ui/model/Sorter.js","sap/ui/model/json/JSONModel.js","sap/ui/model/odata/v2/ODataModel.js"],
"i2d/qm/inspresults/records1/customcontrol/CodeGroupMultiInput.js":["i2d/qm/inspresults/records1/model/formatter.js","sap/m/MultiInput.js","sap/m/Token.js","sap/ui/model/Filter.js","sap/ui/model/Sorter.js","sap/ui/model/json/JSONModel.js"],
"i2d/qm/inspresults/records1/customcontrol/NumericInput.js":["i2d/qm/inspresults/records1/model/formatter.js","i2d/qm/inspresults/records1/util/NumberFormat.js","sap/m/Input.js"],
"i2d/qm/inspresults/records1/customcontrol/NumericMultiInput.js":["i2d/qm/inspresults/records1/model/formatter.js","i2d/qm/inspresults/records1/util/CalculationHelper.js","i2d/qm/inspresults/records1/util/NumberFormat.js","sap/m/MultiInput.js","sap/m/Token.js"],
"i2d/qm/inspresults/records1/customcontrol/ToggleButtonExt.js":["sap/m/ToggleButton.js"],
"i2d/qm/inspresults/records1/customcontrol/ValuationMultiInput.js":["i2d/qm/inspresults/records1/model/formatter.js","sap/m/MultiInput.js","sap/m/Token.js","sap/ui/model/Filter.js","sap/ui/model/Sorter.js","sap/ui/model/json/JSONModel.js","sap/ui/model/odata/v2/ODataModel.js"],
"i2d/qm/inspresults/records1/customcontrol/viz/Comparison.js":["sap/ui/core/Control.js","sap/ui/thirdparty/d3.js"],
"i2d/qm/inspresults/records1/customcontrol/viz/StackedBar.js":["sap/suite/ui/microchart/StackedBarMicroChart.js","sap/ui/core/Control.js"],
"i2d/qm/inspresults/records1/model/formatter.js":["i2d/qm/inspresults/records1/util/NumberFormat.js","sap/ui/core/format/FileSizeFormat.js"],
"i2d/qm/inspresults/records1/model/models.js":["sap/ui/Device.js","sap/ui/model/json/JSONModel.js"],
"i2d/qm/inspresults/records1/util/NavHelper.js":["sap/ui/core/routing/History.js","sap/ui/core/routing/Router.js"],
"i2d/qm/inspresults/records1/util/NumberFormat.js":["sap/ui/core/format/NumberFormat.js"],
"i2d/qm/inspresults/records1/view/App.view.xml":["i2d/qm/inspresults/records1/controller/App.controller.js","sap/m/App.js","sap/ui/core/mvc/XMLView.js"],
"i2d/qm/inspresults/records1/view/NotFound.view.xml":["i2d/qm/inspresults/records1/controller/NotFound.controller.js","sap/m/Link.js","sap/m/MessagePage.js","sap/ui/core/mvc/XMLView.js"],
"i2d/qm/inspresults/records1/view/RecordResults.view.xml":["i2d/qm/inspresults/records1/controller/RecordResults.controller.js","sap/m/Button.js","sap/m/Column.js","sap/m/Label.js","sap/m/Page.js","sap/m/SegmentedButton.js","sap/m/SegmentedButtonItem.js","sap/m/Table.js","sap/m/Toolbar.js","sap/m/ToolbarSpacer.js","sap/ui/core/CustomData.js","sap/ui/core/InvisibleText.js","sap/ui/core/mvc/XMLView.js"],
"i2d/qm/inspresults/records1/view/Worklist.view.xml":["i2d/qm/inspresults/records1/controller/Worklist.controller.js","i2d/qm/inspresults/records1/customcontrol/viz/StackedBar.js","sap/f/DynamicPage.js","sap/f/DynamicPageHeader.js","sap/f/DynamicPageTitle.js","sap/m/Button.js","sap/m/Column.js","sap/m/ColumnListItem.js","sap/m/FlexBox.js","sap/m/FlexItemData.js","sap/m/IconTabBar.js","sap/m/IconTabFilter.js","sap/m/ObjectIdentifier.js","sap/m/ObjectStatus.js","sap/m/OverflowToolbar.js","sap/m/Table.js","sap/m/Text.js","sap/m/Title.js","sap/m/Toolbar.js","sap/m/ToolbarSpacer.js","sap/suite/ui/microchart/ColumnMicroChart.js","sap/suite/ui/microchart/ColumnMicroChartData.js","sap/suite/ui/microchart/StackedBarMicroChartBar.js","sap/ui/comp/smartfilterbar/ControlConfiguration.js","sap/ui/comp/smartfilterbar/SmartFilterBar.js","sap/ui/comp/smarttable/SmartTable.js","sap/ui/comp/smartvariants/SmartVariantManagement.js","sap/ui/core/CustomData.js","sap/ui/core/mvc/XMLView.js","sap/ui/layout/Grid.js","sap/ui/layout/VerticalLayout.js"],
"i2d/qm/inspresults/records1/view/fragments/InspectionPointSettings.fragment.xml":["sap/m/ViewSettingsDialog.js","sap/m/ViewSettingsItem.js","sap/ui/core/Fragment.js"],
"i2d/qm/inspresults/records1/view/fragments/InspectionlotNumberValueHelp.fragment.xml":["sap/m/SelectDialog.js","sap/m/StandardListItem.js","sap/ui/core/Fragment.js"],
"i2d/qm/inspresults/records1/view/fragments/MICMethodsValueHelpDialog.fragment.xml":["sap/m/Column.js","sap/m/ColumnListItem.js","sap/m/ObjectIdentifier.js","sap/m/TableSelectDialog.js","sap/m/Text.js","sap/ui/core/Fragment.js"],
"i2d/qm/inspresults/records1/view/fragments/MasterInspectionCharacteristic.fragment.xml":["sap/m/SelectDialog.js","sap/m/StandardListItem.js","sap/ui/core/Fragment.js"],
"i2d/qm/inspresults/records1/view/fragments/RecordResultsCodeGroupDialog.fragment.xml":["sap/m/Column.js","sap/m/ColumnListItem.js","sap/m/ObjectIdentifier.js","sap/m/ObjectStatus.js","sap/m/TableSelectDialog.js","sap/m/Text.js","sap/ui/core/Fragment.js"],
"i2d/qm/inspresults/records1/view/fragments/RecordResultsPopover.fragment.xml":["sap/m/Label.js","sap/m/ResponsivePopover.js","sap/m/Text.js","sap/m/VBox.js","sap/ui/core/Fragment.js"],
"i2d/qm/inspresults/records1/view/fragments/RecordResultsStatusValuation.fragment.xml":["i2d/qm/inspresults/records1/customcontrol/ToggleButtonExt.js","sap/m/FlexBox.js","sap/m/Label.js","sap/m/ObjectStatus.js","sap/ui/core/Fragment.js","sap/ui/layout/Grid.js","sap/ui/layout/GridData.js"],
"i2d/qm/inspresults/records1/view/fragments/RecordResultsTableItemTemplate.fragment.xml":["sap/m/ColumnListItem.js","sap/m/FlexBox.js","sap/m/Link.js","sap/m/ObjectStatus.js","sap/m/Text.js","sap/m/TextArea.js","sap/m/VBox.js","sap/ui/core/Fragment.js"],
"i2d/qm/inspresults/records1/view/fragments/RecordResultsValuationDialog.fragment.xml":["sap/m/SelectDialog.js","sap/m/StandardListItem.js","sap/ui/core/Fragment.js"],
"i2d/qm/inspresults/records1/view/fragments/RecrodResultsRowItemTemplate1.fragment.xml":["i2d/qm/inspresults/records1/customcontrol/NumericInput.js","sap/m/Input.js","sap/m/Label.js","sap/m/ObjectAttribute.js","sap/ui/core/Fragment.js","sap/ui/layout/Grid.js","sap/ui/layout/GridData.js"],
"i2d/qm/inspresults/records1/view/fragments/RecrodResultsRowItemTemplate10.fragment.xml":["sap/m/Input.js","sap/m/Label.js","sap/m/ObjectAttribute.js","sap/m/Select.js","sap/ui/core/Fragment.js","sap/ui/core/Item.js","sap/ui/layout/Grid.js","sap/ui/layout/GridData.js"],
"i2d/qm/inspresults/records1/view/fragments/RecrodResultsRowItemTemplate11.fragment.xml":["i2d/qm/inspresults/records1/customcontrol/ValuationMultiInput.js","sap/m/Input.js","sap/m/Label.js","sap/m/ObjectAttribute.js","sap/m/Token.js","sap/ui/core/Fragment.js","sap/ui/core/Item.js","sap/ui/layout/Grid.js","sap/ui/layout/GridData.js"],
"i2d/qm/inspresults/records1/view/fragments/RecrodResultsRowItemTemplate2.fragment.xml":["i2d/qm/inspresults/records1/customcontrol/NumericInput.js","sap/m/Input.js","sap/m/Label.js","sap/m/ObjectAttribute.js","sap/ui/core/Fragment.js","sap/ui/layout/Grid.js","sap/ui/layout/GridData.js"],
"i2d/qm/inspresults/records1/view/fragments/RecrodResultsRowItemTemplate3.fragment.xml":["i2d/qm/inspresults/records1/customcontrol/NumericMultiInput.js","sap/m/Input.js","sap/m/Label.js","sap/m/ObjectAttribute.js","sap/m/ObjectNumber.js","sap/m/Token.js","sap/ui/core/Fragment.js","sap/ui/layout/Grid.js","sap/ui/layout/GridData.js"],
"i2d/qm/inspresults/records1/view/fragments/RecrodResultsRowItemTemplate4.fragment.xml":["i2d/qm/inspresults/records1/customcontrol/NumericMultiInput.js","sap/m/Input.js","sap/m/Label.js","sap/m/ObjectAttribute.js","sap/m/ObjectNumber.js","sap/m/Token.js","sap/ui/core/Fragment.js","sap/ui/layout/Grid.js","sap/ui/layout/GridData.js"],
"i2d/qm/inspresults/records1/view/fragments/RecrodResultsRowItemTemplate5.fragment.xml":["sap/m/Input.js","sap/m/Label.js","sap/m/ObjectAttribute.js","sap/m/Select.js","sap/ui/core/Fragment.js","sap/ui/core/Item.js","sap/ui/layout/Grid.js","sap/ui/layout/GridData.js"],
"i2d/qm/inspresults/records1/view/fragments/RecrodResultsRowItemTemplate6.fragment.xml":["sap/m/Input.js","sap/m/Label.js","sap/m/ObjectAttribute.js","sap/m/Select.js","sap/ui/core/Fragment.js","sap/ui/core/Item.js","sap/ui/layout/Grid.js","sap/ui/layout/GridData.js"],
"i2d/qm/inspresults/records1/view/fragments/RecrodResultsRowItemTemplate7.fragment.xml":["i2d/qm/inspresults/records1/customcontrol/ValuationMultiInput.js","sap/m/Input.js","sap/m/Label.js","sap/m/ObjectAttribute.js","sap/m/Token.js","sap/ui/core/Fragment.js","sap/ui/core/Item.js","sap/ui/layout/Grid.js","sap/ui/layout/GridData.js"],
"i2d/qm/inspresults/records1/view/fragments/RecrodResultsRowItemTemplate8.fragment.xml":["i2d/qm/inspresults/records1/customcontrol/CodeGroupInput.js","sap/m/Column.js","sap/m/ColumnListItem.js","sap/m/Input.js","sap/m/Label.js","sap/m/ObjectAttribute.js","sap/m/ObjectIdentifier.js","sap/m/ObjectStatus.js","sap/m/Text.js","sap/ui/core/Fragment.js","sap/ui/layout/Grid.js","sap/ui/layout/GridData.js"],
"i2d/qm/inspresults/records1/view/fragments/RecrodResultsRowItemTemplate9.fragment.xml":["i2d/qm/inspresults/records1/customcontrol/CodeGroupMultiInput.js","sap/m/Column.js","sap/m/ColumnListItem.js","sap/m/Input.js","sap/m/Label.js","sap/m/ObjectAttribute.js","sap/m/ObjectIdentifier.js","sap/m/ObjectStatus.js","sap/m/Text.js","sap/m/Token.js","sap/ui/core/Fragment.js","sap/ui/layout/Grid.js","sap/ui/layout/GridData.js"],
"i2d/qm/inspresults/records1/view/fragments/SampleUnitofMeasure.fragment.xml":["sap/m/SelectDialog.js","sap/m/StandardListItem.js","sap/ui/core/Fragment.js"],
"i2d/qm/inspresults/records1/view/fragments/SamplesValueHelp.fragment.xml":["sap/m/SelectDialog.js","sap/m/StandardListItem.js","sap/ui/core/Fragment.js"],
"i2d/qm/inspresults/records1/view/fragments/SamplingProcedure.fragment.xml":["sap/m/SelectDialog.js","sap/m/StandardListItem.js","sap/ui/core/Fragment.js"]
}});
