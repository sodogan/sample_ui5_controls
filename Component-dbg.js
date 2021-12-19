/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
/*
 * The Component.js file holds the app setup. The init function of the component is automatically started by SAPUI5 when the component is instantiated.
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"i2d/qm/inspresults/records1/model/models",
	"i2d/qm/inspresults/records1/controller/ErrorHandler",
	"i2d/qm/inspresults/records1/customcontrol/viz/Comparison",
	"i2d/qm/inspresults/records1/customcontrol/viz/StackedBar",
	"i2d/qm/inspresults/records1/customcontrol/CodeGroupInput",
	"i2d/qm/inspresults/records1/customcontrol/NumericInput",
	"i2d/qm/inspresults/records1/customcontrol/CodeGroupMultiInput",
	"i2d/qm/inspresults/records1/customcontrol/NumericMultiInput",
	"i2d/qm/inspresults/records1/customcontrol/ValuationMultiInput",
	"i2d/qm/inspresults/records1/customcontrol/ToggleButtonExt"
], function(UIComponent, Device, models, ErrorHandler) {
	"use strict";
	//return an component extends UIComponent to make sure we call the init function of UIComponent and initialize the router afterwards.
	return UIComponent.extend("i2d.qm.inspresults.records1.Component", {
		//When the component is instantiated, the descriptor is loaded and parsed automatically.
		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the FLP and device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set the FLP model. FLP means Fiori launchpad. 
			this.setModel(models.createFLPModel(), "FLP");

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler are destroyed.
		 * @public
		 * @override
		 */
		destroy: function() {
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});
