/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
// Template 10 Qualitative,  Summarized, Without code
sap.ui.define([
	"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController",
	"i2d/qm/inspresults/records1/model/formatter"
], function(RecrodResultsRowItemBaseController, formatter) {
	"use strict";

	return RecrodResultsRowItemBaseController.extend("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsRowItem10", {		
		formatter: formatter,
		
		/**
		 * Valuation function for summaried Inspected and Noncomformaing fields
		 * @param  {sap.ui.base.Event} oEvent
		 * @public
		 */
		onChangeForSummValuation: function(oEvent) {
			var oSource = oEvent.getSource();
			var oBindingData = oSource.getBindingContext().getObject();
			oBindingData.Inspectionvaluationresult = oSource.getSelectedKey();
			this.oRRController.handleSaveMap(oBindingData);
		}
		
	});
});
