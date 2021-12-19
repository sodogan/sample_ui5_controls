/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
/*
 * The App.controller.js file defines the root view of the app. In most cases, it contains an App view as a root control.
 * This is generated file when you create Fiori project. 
 */
sap.ui.define(["i2d/qm/inspresults/records1/controller/BaseController", "sap/ui/model/json/JSONModel"], 
function(BaseController, JSONModel) {
	"use strict";
	return BaseController.extend("i2d.qm.inspresults.records1.controller.App", {
		onInit: function() {
			var oViewModel,
				fnSetAppNotBusy;
			oViewModel = new JSONModel({
				busy: true,				//When loading view model, page is in busy state. In this status, user can do nothing. 
				bAsync: false,
				delay: 0
			});
			this.setModel(oViewModel, "appView");
			fnSetAppNotBusy = function() {
				//After metadata loaded, loading will disappear and user could click or edit page element. 
				oViewModel.setProperty("/busy", false);
				//The delay in 1000 milliseconds, after which the busy indicator will show up for this control.
				oViewModel.setProperty("/delay", this.getView().getBusyIndicatorDelay());
			}.bind(this);
			this.getOwnerComponent().getModel().metadataLoaded().
			then(fnSetAppNotBusy);
			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});
});