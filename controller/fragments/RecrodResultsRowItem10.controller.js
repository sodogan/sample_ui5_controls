/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["i2d/qm/inspresults/records1/controller/fragments/RecrodResultsRowItemBaseController","i2d/qm/inspresults/records1/model/formatter"],function(R,f){"use strict";return R.extend("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsRowItem10",{formatter:f,onChangeForSummValuation:function(e){var s=e.getSource();var b=s.getBindingContext().getObject();b.Inspectionvaluationresult=s.getSelectedKey();this.oRRController.handleSaveMap(b);}});});
