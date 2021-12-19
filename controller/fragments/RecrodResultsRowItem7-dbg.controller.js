/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
// Template 7  Quantitative, Single,     No measured values
sap.ui.define([
	"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController",
	"i2d/qm/inspresults/records1/model/formatter"
], function(RecrodResultsRowItemBaseController, formatter) {
	"use strict";

	return RecrodResultsRowItemBaseController.extend("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsRowItem7", {
		formatter: formatter,
		/**
		 * Single - Qualitative value input token change event handler
		 * @param  {sap.ui.base.Event} oEvent value help confirm event
		 * @public
		 */
		onSingleTokenChange: function(oEvent) {
			var oSource = oEvent.getSource();
			var sEventType = oEvent.getParameter("type");
			var oBindingData = oSource.getBindingContext().getObject() || {};

			var oResourceBundle = this.oRRController.getResourceBundle();
			var aValuationResults = [{
				ValuationKey: "A",
				ValuationName: oResourceBundle.getText("QM_ACCEPTED")
			}, {
				ValuationKey: "R",
				ValuationName: oResourceBundle.getText("QM_REJECTED")
			}];
			
			var oItem = oEvent.getParameter("item");
			
			// set Insepcted and Nonconforming value
			var iNonconformingNumber = 0;
			var allValues = oEvent.getParameter("values");
			var getNumbers = function(value) {
				aValuationResults.some(function(result) {
					if (value === result.ValuationName) {
						if (result.ValuationKey === "R") {
							iNonconformingNumber++;
						}
						return true;
					}
				});
			};
			allValues.forEach(getNumbers);
			oBindingData.InspRsltNonconformingValsNmbr = iNonconformingNumber;
			oBindingData.InspResultValidValuesNumber = oSource.getValidCount();
			
			oBindingData.to_ResultDetails.results.splice(0, oBindingData.to_ResultDetails.results.length);
			Array.prototype.push.apply(oBindingData.to_ResultDetails.results, oBindingData.to_ResultDetails.results4Binding);

			this.precheckAndDataHandleForValuation(oBindingData, this.oRRController.Constants.ActionElement.SingleValuation);
			this.oRRController.handleSaveMap(oBindingData,oSource.getRemovedItems());
			
			// refresh fields which are changed and cannot be automatically refreshed
			this.oRRController.refreshBindingFields(oSource.getModel());
		}
	});
});