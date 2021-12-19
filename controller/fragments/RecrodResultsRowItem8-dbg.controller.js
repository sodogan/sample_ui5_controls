/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
// Template 8  Qualitative,  Summarized, With code
sap.ui.define([
	"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController",
	"i2d/qm/inspresults/records1/model/formatter"
], function(RecrodResultsRowItemBaseController, formatter) {
	"use strict";

	return RecrodResultsRowItemBaseController.extend("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsRowItem8", {
		formatter: formatter,
		/**
		 * the event when user change code and code group
		 * @param  {sap.ui.base.Event} oEvent link change event
		 * @private
		 */
		onCodeGroupChange: function(oEvent) {
			//qualSumValueInputValidator
			var oInput = oEvent.getSource();
			var oBindingData = oInput.getBindingContext().getObject();
			var sCodeGroup = oEvent.getParameter("codeGroup");
			var sCode = oEvent.getParameter("code");
			oBindingData.CodeGroupCodeValuation = oEvent.getParameter("valuation");
			if (sCode === "" && sCodeGroup === "") {
				oBindingData.Inspectionvaluationresult = "";
				oBindingData.CodeGroupCodeErrorMessage = this.oRRController._oResourceBundle.getText("QM_REQUIRE_CODE");
				this.oRRController.addErrorInputIntoErrorStatusInputs(oInput);
			} else {
				if (!oBindingData.InspResultValidValuesNumber) {
					oBindingData.InspResultValidValuesNumber = oBindingData.Inspectionsamplesize;
					this.onChangeForInspected(oEvent);
				}
				if (oBindingData.InspSampleValuationRule === "40") {
					this.precheckAndDataHandleForValuation(oBindingData, this.oRRController.Constants.ActionElement.SummarizedCode);
				}
				oBindingData.CodeGroupCodeErrorMessage = "";
				this.oRRController.removeNoErrorInputFromErrorStatusInputs(oInput);
			}

			this.oRRController.handleSaveMap(oBindingData);

			// refresh fields which are changed and cannot be automatically refreshed
			this.oRRController.refreshBindingFields(oInput.getModel(), ["Inspectionvaluationresult",
				"InspResultValidValuesNumber", "ValuationErrorMessage",
				"IsDataChanged", "CodeGroupCodeErrorMessage"
			]);
		}

	});
});