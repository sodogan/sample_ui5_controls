/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller, JSONModel, formatter, NumberFormat) {
	"use strict";

	return Controller.extend("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsRowItemBaseController", {
		/**
		 * Inspected onchange function
		 *
		 * @param  {sap.ui.base.Event} oEvent
		 * @public
		 */
		onChangeForInspected: function(oEvent) {
			var oInput = oEvent.getSource();
			var oBindingData = oInput.getBindingContext().getObject();
			var bInspectedError = oBindingData.InspResultValidValuesNumber <= 0;

			//if inspected count is zero or negative, should show error message
			//and do not allow saving
			if (bInspectedError) {
				oBindingData.ValuationErrorMessage = this._oResourceBundle.getText("QM_RESULT_NOT_VALID_INSPECTED");
				this.oRRController.addErrorInputIntoErrorStatusInputs(oInput);
			} else {
				oBindingData.ValuationErrorMessage = "";
				this.precheckAndDataHandleForValuation(oBindingData, this.oRRController.Constants.ActionElement.Inspected);
				this.oRRController.removeNoErrorInputFromErrorStatusInputs(oInput);
			}
			this.oRRController.handleSaveMap(oBindingData);
		},


		/**
		 * Nonconforming onchange function
		 * @param  {sap.ui.base.Event} oEvent
		 * @public
		 */
		onChangeForNonconforming: function(oEvent) {
			var oBindingData = oEvent.getSource().getBindingContext().getObject();
			this.precheckAndDataHandleForValuation(oBindingData, this.oRRController.Constants.ActionElement.Nonconforming);
			this.oRRController.handleSaveMap(oBindingData);
		},

		/**
		 * Precheck whether this action need to go through valuation function
		 * And set changed data to the data mode
		 *
		 * @param  {Object} oBindingData
		 * @param  {String} sActionFrom
		 * @public
		 */
		precheckAndDataHandleForValuation: function(oBindingData, sActionFrom) {
			oBindingData.InspResultValidValuesNumber = parseInt(oBindingData.InspResultValidValuesNumber || 0, 10);
			oBindingData.InspRsltNonconformingValsNmbr = parseInt(oBindingData.InspRsltNonconformingValsNmbr || 0, 10);
			var sValuationRule = oBindingData.InspSampleValuationRule;
			//If Valuation rule is 10, and there is no Inspected value or no Nonconforming value,
			//no need to move forward.
			//Add ineligible conditions
			if (sValuationRule === "10" &&
				(oBindingData.InspResultValidValuesNumber === "" ||
					oBindingData.InspRsltNonconformingValsNmbr === "")) {
				return;
			}

			//Valaution rule 10 needs to do valuation with all action
			//Valuation rule 40 needs to do valuation with summarized code group
			//Valuation rule 70 needs to do valuation with summarized number and single number 
			if (sValuationRule === "10" ||
				(sValuationRule === "40" &&
					sActionFrom === this.oRRController.Constants.ActionElement.SummarizedCode) ||
				(sValuationRule === "70" &&
					(sActionFrom === this.oRRController.Constants.ActionElement.SummarizedNumber ||
						sActionFrom === this.oRRController.Constants.ActionElement.SingleNumber))) {
				this.oRRController.onChangeForValuationByBindingData(oBindingData);
			}
		},

		onLiveChangeOnNumericInput: function(oEvent) {
			var oNewValue;
			oNewValue = oEvent.getParameter("newValue");
			if (parseInt(oNewValue, 10) > 999999999999999) {
				oEvent.getSource().setValueState("Error");
				oEvent.getSource().setValueStateText(this._oResourceBundle.getText("MEAN_VALUE_TOO_LARGE"));
			} else {
				oEvent.getSource().setValueState("None");
				oEvent.getSource().setValueStateText("");
			}
		}
	});
});