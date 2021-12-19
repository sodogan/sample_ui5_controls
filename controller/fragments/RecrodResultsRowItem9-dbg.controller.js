/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
//Template 9  Qualitative,  Single,     With code
sap.ui.define([
	"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController",
	"i2d/qm/inspresults/records1/model/formatter"
], function(RecrodResultsRowItemBaseController, formatter) {
	"use strict";

	return RecrodResultsRowItemBaseController.extend("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsRowItem9", {
		formatter: formatter,
		onValueChange: function(oEvent) {
			var aRemovedItems = oEvent.getParameter("removedItems");
			var oBindingData = oEvent.getSource().getBindingContext().getObject();
			oBindingData.InspResultValidValuesNumber = oBindingData.to_ResultDetails.results4Binding.length;

			var InspRsltNonconformingValsNmbr = 0;
			oBindingData.to_ResultDetails.results4Binding.forEach(function(item) {
				if (item.Inspectionvaluationresult === "R") {
					InspRsltNonconformingValsNmbr++;
				}
			});
			oBindingData.InspRsltNonconformingValsNmbr = InspRsltNonconformingValsNmbr; 

			//oBindingData.to_ResultDetails.results = oBindingData.to_ResultDetails.results4Binding;
			oBindingData.to_ResultDetails.results.splice(0, oBindingData.to_ResultDetails.results.length);
			Array.prototype.push.apply(oBindingData.to_ResultDetails.results, oBindingData.to_ResultDetails.results4Binding);

			this.precheckAndDataHandleForValuation(oBindingData, this.oRRController.Constants.ActionElement.SingleCode);
			this.oRRController.handleSaveMap(oBindingData, aRemovedItems);
			// refresh fields which are changed and cannot be automatically refreshed
			this.oRRController.refreshBindingFields(oEvent.getSource().getModel());
		}
	});
});