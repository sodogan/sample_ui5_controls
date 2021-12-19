/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
// Template 2  Quantitative, Summarized, Record measured values, no No. Above / Below	
sap.ui.define([
	"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController",
	"i2d/qm/inspresults/records1/model/formatter"
], function(RecrodResultsRowItemBaseController, formatter) {
	"use strict";

	return RecrodResultsRowItemBaseController.extend("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsRowItem2", {
		formatter: formatter,

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