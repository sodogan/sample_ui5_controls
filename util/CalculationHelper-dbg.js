/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([], function() {
	"use strict";

	return {
		calculateMeanValue : function(aValues, iDecimalPlace) {
			if (!aValues || aValues.length === 0) {
				return 0;
			}
			var fTotal = 0;
			aValues.forEach(function(value) {
				fTotal += value;
			});
			return (fTotal / aValues.length).toFixed(iDecimalPlace);
		},
		
		/**
		 * Check mean value
		 * @param  {boolean}  Has lower limit flag
		 * @param  {boolean}  Has upper limit flag
		 * @param  {Number}   Lower limit number
		 * @param  {Number}   Upper limit number
		 * @param  {Number}   Mean value number
		 * @param  {boolean}  If mean value is accepted.
		 * @public
		 */		
		checkMeanValue: function(hasLower,hasUpper,lowerLimit,upperLimit,meanValue){
			var bRejectLower = hasLower && lowerLimit > meanValue;
			var bReject2Upper = hasUpper && meanValue > upperLimit;
			return !bRejectLower && !bReject2Upper;
		}
		
	};
});
