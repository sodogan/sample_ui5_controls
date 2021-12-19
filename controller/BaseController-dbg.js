/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel",
	"i2d/qm/inspresults/records1/util/NavHelper",
	"i2d/qm/inspresults/records1/util/Constants"
], function(Controller, V2ODataModel, NavHelper, Constants) {
	"use strict";
	return Controller.extend("i2d.qm.inspresults.records1.controller.BaseController", {
		NavHelper: NavHelper,
		Constants: Constants,
		/**
		 * Convenience method for accessing the router.
		 *
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		/**
		 * Convenience method for getting the view model by name.
		 *
		 * @public
		 * @param {string}
		 *            [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},
		/**
		 * Convenience method for setting the view model.
		 *
		 * @public
		 * @param {sap.ui.model.Model}
		 *            oModel the model instance
		 * @param {string}
		 *            sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 *
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of
		 *          the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 *
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			sap.m.URLHelper.triggerEmail(null, oViewModel.getProperty("/shareSendEmailSubject"), oViewModel.getProperty("/shareSendEmailMessage"));
		},
		
		/**
		 * create a new ODataModel instance
		 * @return {sap.ui.model.odata.v2.ODataModel} created ODataModel instance
		 */
		getNewODataModel: function() {
			var oDataModel = new V2ODataModel("/sap/opu/odata/SAP/QM_RR_SRV/");
			return oDataModel;
		}
	});
});