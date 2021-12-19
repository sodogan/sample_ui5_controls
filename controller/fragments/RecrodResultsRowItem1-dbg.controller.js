/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
// Template 1  Quantitative, Summarized, Record measured values, No. Above / Below
sap.ui.define([
	"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController",
	"i2d/qm/inspresults/records1/model/formatter"
], function(RecrodResultsRowItemBaseController, formatter) {
	"use strict";

	return RecrodResultsRowItemBaseController.extend("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsRowItem1", {
		formatter: formatter,

		/**
		 * No. Above onchange function
		 *
		 * @param  {sap.ui.base.Event} oEvent
		 * @public
		 */
		onChangeForNoAbove: function(oEvent) {
			this.onChangeForAboveBelow(oEvent, this.oRRController.Constants.ActionElement.NoAbove);
		},

		/**
		 * No. Below onchange function
		 *
		 * @param  {sap.ui.base.Event} oEvent
		 * @public
		 */
		onChangeForNoBleow: function(oEvent) {
			this.onChangeForAboveBelow(oEvent, this.oRRController.Constants.ActionElement.NoBelow);
		},

		/**
		 * Automatically update nonconforming value based on No. Above or No. Below Changes
		 * nonconforming value = No. Above + No. Below
		 * @param  {sap.ui.base.Event} oEvent
		 * @public
		 */
		onChangeForAboveBelow: function(oEvent, sActionFrom) {
			var oBindingData = oEvent.getSource().getBindingContext().getObject();
			oBindingData.InspRsltAboveToleranceValsNmbr = parseInt(oBindingData.InspRsltAboveToleranceValsNmbr || 0);
			oBindingData.InspRsltBelowToleranceValsNmbr = parseInt(oBindingData.InspRsltBelowToleranceValsNmbr || 0);
			oBindingData.InspRsltNonconformingValsNmbr = oBindingData.InspRsltAboveToleranceValsNmbr + oBindingData.InspRsltBelowToleranceValsNmbr;
			this.precheckAndDataHandleForValuation(oBindingData, sActionFrom);
			this.oRRController.handleSaveMap(oBindingData);
		},

		/**
		 * Numeric Valuation
		 * @param  {sap.ui.base.Event} oEvent
		 * @public
		 */
		onChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var oContext = oInput.getBindingContext();
			var oBindingData = oContext.getObject();

			//don't need to do valuation if mean value is invalid.
			var bIsMeanValueEmpty = oEvent.getParameter("value") === "";
			if (bIsMeanValueEmpty) {
				this.oRRController.addErrorInputIntoErrorStatusInputs(oInput);
			} else {
				this.oRRController.removeNoErrorInputFromErrorStatusInputs(oInput);
				//If input is found in value list and inspected is empty or zero, set inspected value to inspection sample size by default.
				if (!oBindingData.InspResultValidValuesNumber) {
					oBindingData.InspResultValidValuesNumber = oBindingData.Inspectionsamplesize;
					this.onChangeForInspected(oEvent);
				}
				if (oContext.getProperty("InspSampleValuationRule") === "70") {
					//this.oRRController.onValuation70SumChange(oEvent);
					this.precheckAndDataHandleForValuation(oBindingData, this.oRRController.Constants.ActionElement.SummarizedNumber);
				}
			}

			this.oRRController.handleSaveMap(oBindingData);
			// refresh fields which are changed and cannot be automatically refreshed
			this.oRRController.refreshBindingFields(oInput.getModel(), ["Inspectionresultmeanvalue", "InspResultValidValuesNumber",
				"ValuationErrorMessage", "Inspectionvaluationresult", "IsDataChanged"
			]);
		}
	});
});