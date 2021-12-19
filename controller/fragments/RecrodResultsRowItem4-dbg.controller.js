/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
// Template 4  Quantitative, Single,     Record measured values, no No. Above / Below
sap.ui.define([
	"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController",
	"i2d/qm/inspresults/records1/util/CalculationHelper",
	"i2d/qm/inspresults/records1/util/NumberFormat",
	"i2d/qm/inspresults/records1/model/formatter"
], function(RecrodResultsRowItemBaseController, CalculationHelper, NumberFormat, formatter) {
	"use strict";

	return RecrodResultsRowItemBaseController.extend("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsRowItem4", {
		formatter: formatter,
		NumberFormat: NumberFormat,
		/**
		 * Single value MultiInput tokenChange handler
		 * change inspected number in binding model
		 * @param  {sap.ui.base.Event} oEvent tokenChange event
		 * @public
		 */
		onSingleValueMultiInputTokenChange: function(oEvent) {
			var oFloatFormatter, index, oStringValueForItem;
			var oSingleValueMultiInput = oEvent.getSource();
			var oBindingData = oSingleValueMultiInput.getBindingContext().getObject() || {};
			var inputValues = oEvent.getParameter("values");
			// To delete the token from the list of all the tokens
			if (oEvent.getParameter("type") === "removed") {
				// formatter to convert the String into the desired string so that it can be used for matching	
				oFloatFormatter = NumberFormat.getFloatInstance({
					decimals: oBindingData.Inspspecdecimalplaces
				});
				// To get the index of the deleted Token	
				index = inputValues.findIndex(function(item) {
					oStringValueForItem = item.toString();
					item = oFloatFormatter.format(oFloatFormatter.parse(oStringValueForItem));
					return item === oEvent.getParameter("item").formattedValue;
				});
				oEvent.getParameter("values").splice(index, 1);
			}
			// when chenged token exist and charac categroy is quantitative, calculate meanvalue
			if (inputValues.length) {
				// change mean value in binding data
				var sMeanValue = CalculationHelper.calculateMeanValue(
					inputValues, oBindingData.Inspspecsummarizeddcmlplaces);
				oBindingData.Inspectionresultmeanvalue = Number(sMeanValue);
			} else {
				oBindingData.Inspectionresultmeanvalue = "";
			}
			// update inspected number in binding data
			oBindingData.InspResultValidValuesNumber = inputValues.length;

			oBindingData.to_ResultDetails.results.splice(0, oBindingData.to_ResultDetails.results.length);
			Array.prototype.push.apply(oBindingData.to_ResultDetails.results, oBindingData.to_ResultDetails.results4Binding);

			this.precheckAndDataHandleForValuation(oBindingData, this.oRRController.Constants.ActionElement.SingleNumber);

			this.oRRController.handleSaveMap(oBindingData, oSingleValueMultiInput.getRemovedItems());
			// refresh fields which are changed and cannot be automatically refreshed
			this.oRRController.refreshBindingFields(oSingleValueMultiInput.getModel());
		},

		onLiveChange: function(oEvent) {
			var oNewValue;
			oNewValue = oEvent.getParameter("newValue");
			if (oNewValue > 999999999.99) {
				oEvent.getSource().setValueState("Error");
			} else {
				oEvent.getSource().setValueState("None");
			}
		}
	});
});