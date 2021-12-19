/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
/*
 * This controller is used to to control part of the behavior of column Status / Valuation only. 
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"i2d/qm/inspresults/records1/model/formatter"
], function(Controller, formatter) {
	"use strict";

	return Controller.extend("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsManualValuation", {
		formatter: formatter,
		/**
		 * Accept button pressed. Accept and Reject Buttons to relate each other. 
		 * If valuation rule is 50 or A1, display both buttons, and the initial status should be all unpressed
		 * If both buttons are unpressed, click one of the buttons, it should be pressed, the valuation result and status should be changed.
	 	 * If Accept button is pressed, click Reject button, the Accept button should be unpressed, and the Reject button should be pressed, and the valuation result and status should be changed
		 * If Accept button is pressed, click Accept button, both Accept button and Reject button should be unpressed, and the valuation result and status should be changed 
		 * @param  {sap.ui.base.Event} oEvent
		 * @public
		 */
		onAcceptPress: function(oEvent) {
			var oBtn = oEvent.getSource();
			var oBindingData = oBtn.getBindingContext().getObject();
			var aButtons = oBtn.getParent().findAggregatedObjects(false);
			var oDecline;
			aButtons.forEach(
				function(oButton) {
					if (oBtn !== oButton && oDecline == undefined) {
						oDecline = oButton;
					}
				}
			);
			var sNewValuationResult = "";
			if (oBtn.getPressed()) {
				//set Accept button to green color. 
				oBtn.setType("Accept");
				//set Reject button to unpress status and remove red color.
				oDecline.setType("Default");
				oDecline.setPressed(false);
				oDecline.$().children().first().removeClass("sapMBtnReject");
				//By default, toggle button will display blue color when press. Also need to remove this color. 
				oDecline.$().children().first().removeClass("sapMToggleBtnPressed");
				sNewValuationResult = "A";
			} else {
				oBtn.setType("Default");
				oBtn.$().children().first().removeClass("sapMBtnAccept");
				oBtn.$().children().first().removeClass("sapMToggleBtnPressed");
			}
			//var sPath = oBtn.getBindingContext().getPath() + "/Inspectionvaluationresult";
			oBindingData.Inspectionvaluationresult = sNewValuationResult;
			
			//This flag is used to notice container data changed. Impact save and leave page functions. 
			oBindingData.IsDataChanged = true;
			this.oRRController.refreshBindingFields(oBtn.getBindingContext().getModel());
			this.oRRController.handleSaveMap(oBindingData);
		},

		/**
		 * Accept button pressed. Accept and Reject Buttons to relate each other. 
		 * If valuation rule is 50 or A1, display both buttons, and the initial status should be all unpressed
		 * If both buttons are unpressed, click one of the buttons, it should be pressed, the valuation result and status should be changed.
	 	 * If Reject button is pressed, click Accept button, the Reject button should be unpressed, and the Accept button should be pressed, and the valuation result and status should be changed
		 * If Reject button is pressed, click Reject button, both Accept button and Reject button should be unpressed, and the valuation result and status should be changed 
		 * @param  {sap.ui.base.Event} oEvent
		 * @public
		 */
		onDeclinePress: function(oEvent) {
			var oBtn = oEvent.getSource();
			var oBindingData = oEvent.getSource().getBindingContext().getObject();
			var aButtons = oBtn.getParent().findAggregatedObjects(false);
			var oAccept;
			aButtons.forEach(
				function(oButton) {
					if (oBtn !== oButton && oAccept == undefined) {
						oAccept = oButton;
					}
				}
			);
			var sNewValuationResult = "";
			if (oBtn.getPressed()) {
				//set Reject button to red color. 
				oBtn.setType("Reject");
				//set Accept button to unpress status and remove green color.
				oAccept.setType("Default");
				oAccept.setPressed(false);
				oAccept.$().children().first().removeClass("sapMBtnAccept");
				//By default, toggle button will display blue color when press. Also need to remove this color. 
				oAccept.$().children().first().removeClass("sapMToggleBtnPressed");
				sNewValuationResult = "R";
			} else {
				oBtn.setType("Default");
				oBtn.$().children().first().removeClass("sapMBtnReject");
				oBtn.$().children().first().removeClass("sapMToggleBtnPressed");
			}
			oBindingData.Inspectionvaluationresult = sNewValuationResult;
			//This flag is used to notice container data changed. Impact save and leave page functions. 
			oBindingData.IsDataChanged = true;
			this.oRRController.refreshBindingFields(oBtn.getBindingContext().getModel());
			this.oRRController.handleSaveMap(oBindingData);
		}

	});
});