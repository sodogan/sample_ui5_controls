/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
/**
 * i2d.qm.inspresults.records1.util.Constants
 * Constants used in application
 * @type {Object}
 */
sap.ui.define([], {

    // tab keys in worklist view IconTabBar
    WorkListTabKey: {
        "InspLot": "InspectionLot",
        "Operation": "Operation",
        "PhysicalSample": "PhysicalSample",
        "MIC": "MasterCharacteristics"
    },

    // Action elements for Valuation indicator
	ActionElement: {
		"SummarizedCode":              "SummarizedCode",
		"SingleCode":                  "SingleCode",
		"SummarizedNumber":            "SummarizedNumber",
		"SingleNumber":                "SingleNumber",
		"SummarizedValuation":         "SummarizedValuation",
		"SingleValuation":             "SingleValuation",
		"NoAbove":                     "NoAbove",
		"NoBelow":                     "NoBelow",
		"Inspected":                   "Inspected",
		"Nonconforming":               "Nonconforming"
		// "SingleCodeValueChange":       "SingleCodeValueChange",
		// "SingleNumberValueChange":     "SingleNumberValueChange",
		// "SingleValuationValueChange":  "SingleValuationValueChange"
	}

});
