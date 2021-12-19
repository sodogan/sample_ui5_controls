/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/routing/Router",
	"sap/ui/core/routing/History"
], function(Router, History) {
	"use strict";

	return {
		/**
		 * wrap Router.navTo method, persist the history hash before navigate
		 * @param  {sap.ui.core.routing.Router} oRouter     Router instance
		 * @param  {string} sName       Name of the route
		 * @param  {object} oParameters Parameters for the route
		 * @param  {boolean} bReplace    Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
		 * @public
		 */
		navTo: function(oRouter, sName, oParameters, bReplace) {
			if (oRouter && oRouter instanceof Router) {
				oRouter.navTo(sName, oParameters, bReplace);
			}
		},
		/**
		 * navBack based on different previous page
		 * if page is navigated from fiori app or refresh, let browser handle navback
		 * if page is navigated from outside a fiori app, navigate back to Fiori Launchpad Home
		 * @public
		 */
		navBack: function() {
			var oHistory = History.getInstance(),
			    sPreviousHash = oHistory.getPreviousHash();
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined) {
			    // The history contains a previous entry
			    history.go(-1);
			} else {
				// Navigate back to FLP home
				history.go(-1);
				// oCrossAppNavigator.toExternal({
				// 	target: {
				// 	    shellHash: "#"
				// 	}
				// });
			}
		}
	};
});