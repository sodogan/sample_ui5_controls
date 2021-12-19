/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
// Template 5  Quantitative, Summarized, No measured values,     No. Above / Below
sap.ui.define([
	"i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController",
	"i2d/qm/inspresults/records1/model/formatter"
], function(RecrodResultsRowItemBaseController, formatter) {
	"use strict";

	return RecrodResultsRowItemBaseController.extend("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsRowItem5", {
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
		},
		
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
		}
		
	});
});
