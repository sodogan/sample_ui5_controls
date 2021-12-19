/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController","i2d/qm/inspresults/records1/model/formatter"],function(R,f){"use strict";return R.extend("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsRowItem5",{formatter:f,onChangeForSummValuation:function(e){var s=e.getSource();var b=s.getBindingContext().getObject();b.Inspectionvaluationresult=s.getSelectedKey();this.oRRController.handleSaveMap(b);},onChangeForNoAbove:function(e){this.onChangeForAboveBelow(e,this.oRRController.Constants.ActionElement.NoAbove);},onChangeForNoBleow:function(e){this.onChangeForAboveBelow(e,this.oRRController.Constants.ActionElement.NoBelow);},onChangeForAboveBelow:function(e,a){var b=e.getSource().getBindingContext().getObject();b.InspRsltAboveToleranceValsNmbr=parseInt(b.InspRsltAboveToleranceValsNmbr||0);b.InspRsltBelowToleranceValsNmbr=parseInt(b.InspRsltBelowToleranceValsNmbr||0);b.InspRsltNonconformingValsNmbr=b.InspRsltAboveToleranceValsNmbr+b.InspRsltBelowToleranceValsNmbr;this.precheckAndDataHandleForValuation(b,a);this.oRRController.handleSaveMap(b);}});});