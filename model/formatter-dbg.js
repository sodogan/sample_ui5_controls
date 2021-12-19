/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"i2d/qm/inspresults/records1/util/NumberFormat",
	"sap/ui/core/format/FileSizeFormat"
], function(NumberFormat, FileSizeFormat) {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		// numberUnit: function(sValue) {
		// 	if (!sValue) {
		// 		return "";
		// 	}
		// 	return parseFloat(sValue).toFixed(2);
		// },
 
		/**
		 * Converts string type of Boolean String to Booleann type.
		 * @public
		 * @param {string} value the Boolean string to be rounded
		 * @returns {Booleann} value with Booleann type
		 */
		// parseBoolean: function(bValue) {
		// 	switch (bValue) {
		// 		case true:
		// 		case 'true':
		// 		case 1:
		// 		case 7:
		// 		case '7':
		// 		case '1':
		// 		case 'on':
		// 		case 'yes':
		// 			bValue = true;
		// 			break;
		// 		case false:
		// 		case 'false':
		// 		case 0:
		// 		case '0':
		// 		case 'off':
		// 		case 'no':
		// 			bValue = false;
		// 			break;
		// 		default:
		// 			bValue = false;
		// 			break;
		// 	}
		// 	return bValue;
		// },

		/**
		 * Receive Date Object and caluclate the number of days between two dates .
		 * @public
		 * @param {object} value the Date string to be converted.
		 * @returns {String} value with number of days.
		 */
		oLotNumberOfDays: function(oEndDate) {
			this._oResourceBundle = this.getResourceBundle();
			if (!oEndDate || typeof oEndDate === "string") {
				return this._oResourceBundle.getText("QM_LOTENDDATE_DATE_NOT_AVIL");
			}

			var iTotalnumberOfDays;
			var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;

			oEndDate = new Date(oEndDate.getTime() + TZOffsetMs);
			var oToday = new Date();

			//ignore the hours/minutes/seconds informations, 
			//only use year/month/day for calculating time span.
			oEndDate = new Date(oEndDate.getFullYear(), oEndDate.getMonth(), oEndDate.getDate());
			oToday = new Date(oToday.getFullYear(), oToday.getMonth(), oToday.getDate());

			var iNumberOfDays = parseInt((oEndDate.getTime() - oToday.getTime()) / (oneDay), 10);
			switch (iNumberOfDays) {
				case 0:
					iTotalnumberOfDays = this._oResourceBundle.getText("QM_LOTENDDATE_TODAY");
					break;
				case 1:
					iTotalnumberOfDays = this._oResourceBundle.getText("QM_LOTENDDATE_TOMORROW");
					break;
				case -1:
					iTotalnumberOfDays = this._oResourceBundle.getText("QM_LOTENDDATE_YESTERDAY");
					break;
				default:
					if (iNumberOfDays > 0) {
						iTotalnumberOfDays = this.getResourceBundle().getText("QM_LOTENDDATE_DAYSTOGO", [iNumberOfDays]);
					} else {
						iTotalnumberOfDays = this.getResourceBundle().getText("QM_LOTENDDATE_DAYSAGO", [Math.abs(iNumberOfDays)]);
					}
			}
			return iTotalnumberOfDays;
		},

		/**
		 * Receive Date Object and caluclate the number of days between two dates .
		 * @public
		 * @param {object} value the Date string to be converted.
		 * @returns {String} status of the Date to be displyed based on the conditions.
		 */
		lotEndDateStatus: function(oEndDate) {
			if (!oEndDate || typeof oEndDate === "string") {
				return "None";
			}
			var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;

			oEndDate = new Date(oEndDate.getTime() + TZOffsetMs);
			var oToday = new Date();

			//ignore the hours/minutes/seconds informations, 
			//only use year/month/day for calculating time span.
			oEndDate = new Date(oEndDate.getFullYear(), oEndDate.getMonth(), oEndDate.getDate());
			oToday = new Date(oToday.getFullYear(), oToday.getMonth(), oToday.getDate());

			var iNumberOfDays = parseInt((oEndDate.getTime() - oToday.getTime()) / (oneDay), 10);
			var status;
			switch (iNumberOfDays) {
				case 0:
					status = "None";
					break;
				case 1:
					status = "None";
					break;
				case -1:
					status = "Error";
					break;
				default:
					if (iNumberOfDays > 0) {
						status = "None";
					} else {
						status = "Error";
					}
			}
			return status;
		},
		/**
		 * Concatenate string to required format oText + "(" + oId + " /" + oPlant + " /" + oVersion + ")" .
		 * @public
		 * @param {string} value tring to be Concationateed.
		 * @returns {String} Concationateed String .
		 */
		micColoumConcatenation: function(oText, oId, oPlant, oVersion) {
			if (oText && oId && oPlant && oVersion) {
				return oText + " (" + oId + "/" + oPlant + "/" + oVersion + ")";
			} else {
				return " ";
			}
		},
		/**
		 * Concatenate string to required format oText + "(" + oId + " /" + oPlant + " /" + oVersion + ")" .
		 * @public
		 * @param {string} value tring to be Concationateed.
		 * @returns {String} Concationateed String .
		 */
		methodColoumConcatenation: function(sText, iId, sPlant, sVersion) {
			if (sText && iId && sPlant && sVersion) {
				return sText + " (" + iId + "/" + sPlant + "/" + sVersion + ")";
			} else {
				return " ";
			}
		},
		/**
		 * Concatenate string to required format oText + "(" + oId + ")" .
		 * @public
		 * @param {string} value tring to be Concatenated.
		 * @returns {String} Concatenated String .
		 */
		textIdConcatenation: function(sText, iId) {
			if (sText && iId) {
				return sText + " (" + iId + ")";
			} else {
				return " ";
			}
		},
		/**
		 * Formatter for Valuation Code: "A" for "Accepted", "R" for "Rejected", blank for blank..
		 * @public
		 * @param {string} sValuationCode string to be valuated.
		 * @returns {String} sValuationString string after formatting.
		 */
		codeValuation: function(sValuationCode) {
			this._oResourceBundle = this.getResourceBundle();
			var sValuationString;
			switch (sValuationCode) {
				case "A":
					sValuationString = this._oResourceBundle.getText("QM_ACCEPTED");
					break;
				case "R":
					sValuationString = this._oResourceBundle.getText("QM_REJECTED");
					break;
				default:
					sValuationString = "";
			}
			return sValuationString;
		},

		/**
		 * Formatter for Valuation Code: "Good" for "Accepted", "Error" for "Rejected", "Neutral" for "Open". 
		 * @public
		 * @param {string} sOperationStatus string to be transformed.
		 * @returns {String} sOperStatus string after formatting.
		 */
		// operationStatus: function(sOperationStatus) {
		// 	this._oResourceBundle = this.getResourceBundle();
		// 	var sOperStatus = this._oResourceBundle.getText("QM_FIELD_PROGRESS_OF_OPERATION") + " ";
		// 	switch (sOperationStatus) {
		// 		case "Good":
		// 			sOperStatus += this._oResourceBundle.getText("QM_ACCEPTED");
		// 			break;
		// 		case "Error":
		// 			sOperStatus += this._oResourceBundle.getText("QM_REJECTED");
		// 			break;
		// 		default:
		// 			sOperStatus += this._oResourceBundle.getText("QM_OPEN");
		// 	}
		// 	return sOperStatus;
		// },
		// operationCompleteStatus: function(sOperationStatus) {
		// 	this._oResourceBundle = this.getResourceBundle();
		// 	var sOperStatus = this._oResourceBundle.getText("QM_FIELD_OPERATION_COMPLETION") + " ";
		// 	switch (sOperationStatus) {
		// 		case "Good":
		// 			sOperStatus += this._oResourceBundle.getText("QM_ACCEPTED");
		// 			break;
		// 		case "Error":
		// 			sOperStatus += this._oResourceBundle.getText("QM_REJECTED");
		// 			break;
		// 		default:
		// 			sOperStatus += this._oResourceBundle.getText("QM_OPEN");
		// 	}
		// 	return sOperStatus;
		// },
		/**
		 * Change status for Valuation: Red for Rejected, Green for Approved.
		 * @public
		 * @param {string} sValuationCode string to be valuated.
		 * @returns {String} sValuationStatus status of the filed.
		 */
		codeValuationStatus: function(sValuationCode) {
			var sValuationStatus;
			switch (sValuationCode) {
				case "A":
					sValuationStatus = "Success";
					break;
				case "R":
					sValuationStatus = "Error";
					break;
				default:
					sValuationStatus = "None";
			}
			return sValuationStatus;
		},
		/**
		 * text formatter for text like: Text1 (Text2)
		 * @param  {String} sText           text in the front
		 * @param  {String} sTextInBrackets text description in brackets
		 * @return {String}                  formatted text
		 */
		textWithBrackets: function(sText, sTextInBrackets) {
			sText = sText || "";
			sTextInBrackets = sTextInBrackets || "";
			if (!sTextInBrackets) {
				return sText;
			}
			return this.getResourceBundle().getText("QM_CHAR_DETAIL_HEADER_TITLE", [sText, sTextInBrackets]);
		},
		/**
		 * text formatter for text like: Text1 (Text2) / Text3: Text4
		 * @param  {String} sText           text in the front
		 * @param  {String} sTextInBrackets text description in brackets
		 * @param  {String} sTextAfterSlash text after slash
		 * @return {String}                  formatted text
		 */
		// textWithBracketsAndSlash: function(sText, sTextInBrackets, sTextAfterSlash) {
		// 	sText = sText || "";
		// 	sTextInBrackets = sTextInBrackets || "";
		// 	sTextAfterSlash = sTextAfterSlash || "";
		// 	var sBeforeSlash = "",
		// 		sAfterSlash = "",
		// 		sTitleAfterSlash = this.getResourceBundle().getText("QM_CHAR_DETAIL_BATCH");
		// 	if (!sTextInBrackets) {
		// 		sBeforeSlash = sText;
		// 	} else {
		// 		sBeforeSlash = this.getResourceBundle().getText("QM_CHAR_DETAIL_HEADER_TITLE", [sText, sTextInBrackets]);
		// 	}
		// 	if (sTextAfterSlash) {
		// 		sAfterSlash = this.getResourceBundle().getText("QM_RR_DETAIL_FIELD_COLON", [sTitleAfterSlash, sTextAfterSlash]);
		// 		return this.getResourceBundle().getText("QM_RR_CONCAT_BY_SLASH", [sBeforeSlash, sAfterSlash]);
		// 	}
		// 	return sBeforeSlash;
		// },
		
		/**
		 * text formatter for text like: sCount
		 * @param  {String} sCount           message count
		 * @return {String}                  formatted text
		 */
		readSaveMessages: function(sCount) {
			return this.getResourceBundle().getText("QM_RR_TOKEN_MESSAGE", [sCount]);
		},

		/**
		 * text formatter for text like: Text1, Text2
		 * @param  {String} sText           text in the front
		 * @param  {String} sTextAfterComma text behind comma
		 * @return {String}                 formatted text
		 */
		// textDivideByComma: function(sText, sTextAfterComma) {
		// 	sText = sText || "";
		// 	sTextAfterComma = sTextAfterComma || "";
		// 	if (!sText || !sTextAfterComma) {
		// 		return sText ? sText : sTextAfterComma;
		// 	} else {
		// 		return this.getResourceBundle().getText("QM_CHAR_DETAIL_STATE_TEXT", [sText, sTextAfterComma]);
		// 	}
		// },

		/**
		 * text formatter for text like Text1 .. Text2
		 * @param  {String} sText         text in the front
		 * @param  {String} sTextAfterDot text behind dot
		 * @param  {String} sUnit         unit text for return text
		 * @return {String}               formatted text
		 */
		// textDivideByDot: function(sText, sTextAfterDot, sUnit) {
		// 	sText = sText || "";
		// 	sTextAfterDot = sTextAfterDot || "";
		// 	sUnit = sText || sTextAfterDot ? sUnit || "" : "";
		// 	if (sText && sTextAfterDot) {
		// 		return this.getResourceBundle().getText("QM_CHAR_DETAIL_SPEC_VALUE", [sText, sTextAfterDot, sUnit]);
		// 	} else {
		// 		return this.getResourceBundle().getText("QM_CHAR_DETAIL_UNIT", [sText || sTextAfterDot, sUnit]);
		// 	}
		// },

		/**
		 * text formatter to concat inspect value and unit
		 * @param  {String} sText text
		 * @param  {String} sUnit unit
		 * @return {String}       formatted text
		 */
		// concatUnit: function(sText, sUnit) {
		// 	sText = sText || "";
		// 	sUnit = sUnit || "";
		// 	sUnit = sText ? sUnit : "";
		// 	return this.getResourceBundle().getText("QM_CHAR_DETAIL_UNIT", [sText, sUnit]);
		// },

		/**
		 * text formatter to concat inspect value and unit based on hasValue
		 * @param  {String} sText text
		 * @param  {String} sUnit unit
		 * @return {String}       formatted text
		 */
		// returnInspValue: function(sText, sUnit, hasValue, sDecimalplaces) {
		// 	if (hasValue) {
		// 		sText = sText || "";
		// 		sUnit = sUnit || "";
		// 		sUnit = sText ? sUnit : "";
		// 		return this.getResourceBundle().getText("QM_CHAR_DETAIL_UNIT", [this.formatter.quantityFormatter(sText, sDecimalplaces), sUnit]);
		// 	}
		// 	return "";
		// },

		/**
		 * return a boolean based on text passed in
		 * if text is empty, return false. if text is not empty, return true
		 * @param  {String} sText text
		 * @return {boolean}      boolean value
		 */
		// returnBooleanBasedOnText: function(sText) {
		// 	return !!sText;
		// },

		/**
		 * return a string based on text passed in
		 * if text is empty, return false. if text is not empty, return true
		 * @param  {String} sText text
		 * @return {String} long term or not
		 */
		returnInspSpecIsLongTermInspection: function(sText) {
			if (sText === '1') {
				return this._oResourceBundle.getText("QM_LONGTERM_INSPECTION");
			}
			return '';
		},

		/**
		 * return a string based on text passed in
		 * if text is empty, return false. if text is not empty, return true
		 * @param  {String} sText text
		 * @return {String} single result|no charac. Rec.|summ.recording
		 */
		returnInspSpecRecordingType: function(sText) {
			if (sText === '1') {
				return this._oResourceBundle.getText("QM_SINGLE_RESULT");
			} else if (sText === '2') {
				return this._oResourceBundle.getText("QM_NO_CHARAC_REC");
			}
			return this._oResourceBundle.getText("QM_SUMM_RECORDING");
		},

		/**
		 * return a string based on text passed in
		 * if text is empty, return false. if text is not empty, return true
		 * @param  {String} sText text
		 * @return {String} require char.|optional char|null
		 */
		returnInspSpecCharcCategory: function(sText) {
			if (sText === '1') {
				return this._oResourceBundle.getText("QM_REQUIRED_CHAR");
			} else if (sText === '2') {
				return this._oResourceBundle.getText("QM_OPTIONAL_CHAR");
			}
			return '';
		},

		/**
		 * return a string based on text passed in
		 * if text is empty, return false. if text is not empty, return true
		 * @param  {String} sText text
		 * @return {String} calc. charac.|input processing|null
		 */
		returnInspSpecResultCalculation: function(sText) {
			if (sText === '1') {
				return this._oResourceBundle.getText("QM_CALC_CHARAC");
			} else if (sText === '2') {
				return this._oResourceBundle.getText("QM_INPUT_PROCESSING");
			}
			return '';
		},

		/**
		 * return a opposite boolean based on text passed in
		 * if text is empty, return true. if text if not empty, return false
		 * @param  {String} sText text
		 * @return {boolean}      boolean value
		 */
		// returnOppositeBooleanBasedOnText: function(sText) {
		// 	return !sText;
		// },

		/**
		 * concat texts for result header information field - Inspect
		 * @param  {String} sInspect    inspect number
		 * @param  {String} sSampleSize sample size
		 * @param  {String} sSampleUnit sample unit
		 * @return {String}             formatted text
		 */
		concatInspect: function(sInspect, sSampleSize, sSampleUnit) {
			sInspect = sInspect || "";
			sSampleSize = sSampleSize || "";
			sSampleUnit = sSampleUnit || "";
			return sInspect && sSampleSize && sSampleUnit ? this.getResourceBundle().getText("QM_CHAR_DETAIL_INSPECT", [sInspect, sSampleSize,
				sSampleUnit
			]) : sInspect;
		},

		/**
		 * concat a number with a percentage sign
		 * @param  {Number} fNumber a float Number
		 * @param  {Number} iDecimalPlaces Decimal Places
		 * @return {String} formatted text
		 */
		// concatPercentage: function(fNumber, iDecimalPlaces) {
		// 	// get float instatnce based on decimal places
		// 	var oFloatFormat = NumberFormat.getFloatInstance({
		// 		decimals: iDecimalPlaces
		// 	});
		// 	var sText = oFloatFormat.format(fNumber * 100.0);

		// 	return this.getResourceBundle().getText("QM_CHAR_DETAIL_PERCENTAGE", [sText]);
		// },

		/**
		 * Characteristic detials state formatter - Characteristic Detail page
		 * @param  {String} value state value
		 * @return {String}       state value used in UI5
		 */
		charDetailsState: function(value) {
			value = value && value.toUpperCase();
			switch (value) {
				case 'R':
				case false:
				case 'false':
					value = 'Error';
					break;
				case 'A':
				case true:
				case 'true':
					value = 'Success';
					break;
				default:
					value = 'None';
					break;
			}
			return value;
		},

		/**
		 * Characteristic details document display name
		 * file description first, if empty then file name
		 * @param  {String} sName file name
		 * @param  {String} sDesc file description
		 * @return {String}       formatted string
		 */
		// charDetailFileNameDisplay: function(sName, sDesc) {
		// 	return sDesc || sName;
		// },

		/**
		 * Record results page code and code group. 
		 * template CodeGroup-Code
		 * @param  {String} sCodeGroup code group
		 * @param  {String} sCode code
		 * @return {String}       formatted code group and code
		 */
		rrGroupCodeDisplay: function(sCodeGroup, sCode) {
			if (sCodeGroup) {
				return sCodeGroup + " - " + sCode;
			}
			return "";
		},

		/**
		 * Characteristic details results table valuation flag formatter - Characteristic Detail page
		 * @param  {String} value valuation value
		 * @return {String}       icon URI of flag
		 */
		charDetailsResultFlag: function(value) {
			value = value && value.toUpperCase();
			switch (value) {
				case 'A':
					value = "sap-icon://accept";
					break;
				case 'R':
					value = "sap-icon://decline";
					break;
				default:
					value = "";
			}
			return value;
		},

		/**
		 * Valuation flag formatter - Result Recording page
		 * @param  {String} sValue valuation value
		 * @return {String}        icon URI of flag
		 */
		valuationResultFlag: function(sValue) {
			sValue = sValue && sValue.toUpperCase();
			switch (sValue) {
				case 'A':
					sValue = "sap-icon://accept";
					break;
				case 'R':
					sValue = "sap-icon://decline";
					break;
				default:
					sValue = "";
			}
			return sValue;
		},

		/**
		 * Valuation Status formatter
		 * In initialize, valuation status set to vlauation status text
		 * If data is changed, valuation satus set to 'Processed' 
		 * If valuation result is A or R, valuation status set to 'Valuated'
		 * @param  {String}  sValuationStausText valuation status text
		 * @param  {String}  sValuationResult    valuation result
		 * @param  {boolean} bIsDataChanged      is data changed flag
		 * @return {String}                      valuation status
		 */
		valuationStatus: function(sValuationStausText, sValuationResult, bIsDataChanged) {
			var sValuationStatus = sValuationStausText;
			if (bIsDataChanged) {
				sValuationResult = sValuationResult && sValuationResult.toUpperCase();
				switch (sValuationResult) {
					case 'A':
					case 'R':
						sValuationStatus = this._oResourceBundle.getText("QM_RESULT_VALUATED");
						break;
					default:
						sValuationStatus = this._oResourceBundle.getText("QM_FIELD_PROCESSED");
				}
			}
			return sValuationStatus;
		},

		/**
		 * characteristic details specification formatter
		 * for Quanlitative value show (Specification: select set)
		 * for Quantitative value show (Specification: low .. high unit) or (Specification: >= low unit) or (Specification: <= high unit)
		 * @param  {String} sIsQuantitative  quantitative value indicator (1 for quantitative, 0 for qualitative)
		 * @param  {String} sLowerLimit  lower limit text
		 * @param  {String} sUpperLimit  upper limit text
		 * @param  {String} sUnit        unit  text
		 * @param  {String} sSelectedSet select set text
		 * @return {String}              formatted string
		 */
		charDetailsSpec: function(sIsQuantitative, sLowerLimit, sUpperLimit, hasLowerLimit, hasUpperLimit, sUnit, sSelectedSet, sDecimalplaces) {
			var bIsQuanti = sIsQuantitative === "1";
			var sSpec = "";
			if (bIsQuanti) {
				sUnit = sUnit || "";
				if (hasLowerLimit && hasUpperLimit) {
					sSpec = this.getResourceBundle().getText("QM_CHAR_DETAIL_SPEC_VALUE", [this.formatter.quantityFormatter(sLowerLimit, sDecimalplaces), this.formatter.quantityFormatter(sUpperLimit, sDecimalplaces), sUnit]);
				} else if (hasLowerLimit) {
					sSpec = this.getResourceBundle().getText("QM_CHAR_DETAIL_GE", [this.formatter.quantityFormatter(sLowerLimit, sDecimalplaces), sUnit]);
				} else if (hasUpperLimit) {
					sSpec = this.getResourceBundle().getText("QM_CHAR_DETAIL_LE", [this.formatter.quantityFormatter(sUpperLimit, sDecimalplaces), sUnit]);
				}
			} else {
				sSpec = sSelectedSet || "";
			}
			return sSpec;
		},

		/**
		 * combine field of record results page characteristic table
		 * @param  {String} sLabel           name of the field
		 * @param  {String} sText           text of the field
		 * @param  {String} sInsideBrackets text inside brackets (optional)
		 * @return {String}                 formatted text
		 */
		// concatRecordResultsTableField: function(sText, sLabel, sInsideBrackets) {
		// 	sLabel = sLabel || "";
		// 	sText = sText || "";
		// 	var sFormattedText = this.getResourceBundle().getText("QM_RR_DETAIL_FIELD_COLON", [sLabel, sText]);
		// 	return sInsideBrackets ? this.getResourceBundle().getText("QM_RR_DETAIL_FIELD_BRACKETS", [sFormattedText, sInsideBrackets]) :
		// 		sFormattedText;
		// },

		/**
		 * combine label on the top of the input in Inspect Result column
		 * expected results based on charac type:
		 * 		Qualitative  - No code:                       Valuation
		 * 		Qualitative  - With code:                     Code Group - Code
		 * 		Quantitative - No Measure:                    Valuation
		 *    	Quantitative - Summarized value - With unit:  Mean Value (unit)
		 *    	Quantitative - Summarized value - No unit:    Mean Value
		 *     	Quantitative - Single value     - With unit:  Single Values (unit)
		 *     	Quantitative - Single value     - No unit:    Single Values
		 * @param  {boolean} bIsSum       summarized value indicator
		 * @param  {boolean} bIsQual      quantitative value indicator
		 * @param  {boolean} bIsWithCode  with code indicator
		 * @param  {boolean} bIsMeasure   measured value required indicator
		 * @param  {String}  sUnit        unit of the result
		 * @return {String}               formatted text
		 */
		concatInspectResultsLabel: function(bIsSum, bIsQual, bIsWithCode, bIsMeasure, sUnit) {
			var bWithoutUnit = !sUnit;

			var sCodeLabel = this.getResourceBundle().getText("QM_CODEGROUP_CODE_TITLE");
			var sValuationLabel = this.getResourceBundle().getText("QM_CHAR_RESULT_VALUATION");
			var sMeanValueLabel = this.getResourceBundle().getText("QM_RR_MEAN_VALUE");
			var sSingleValuesLabel = this.getResourceBundle().getText("QM_RR_SINGLE_VALUES");

			var sResult = "";
			if (bIsQual) {
				if (bIsWithCode) {
					sResult = sCodeLabel;
				} else {
					sResult = sValuationLabel;
				}
			} else {
				if (bIsMeasure) {
					var sResultLabel = bIsSum ? sMeanValueLabel : sSingleValuesLabel;
					sResult = bWithoutUnit ? sResultLabel : this.getResourceBundle().getText("QM_RR_DETAIL_FIELD_BRACKETS", [sResultLabel, sUnit]);
				} else {
					sResult = sValuationLabel;
				}
			}

			// add Colon to result value
			var oFormatter = this.formatter || this;
			return oFormatter.concatColon(sResult);
		},

		/**
		 * Convert nonstandard number to standard. Only used for saving. 
		 * Convert #.##0,00 to #,##0.00 
		 * @param  {String/Number} value       value
		 * @return {String}       formatted standard text
		 */
		toStandardNumber: function(oNumber) {
			if (typeof oNumber === "string") {
				var oFloatFormat = NumberFormat.getFloatInstance();
				var decimal = oFloatFormat.oFormatOptions.decimalSeparator;
				if (decimal === ',') {
					if (oNumber.indexOf(".") > 0) {
						oNumber = oNumber.replace(/\./g, "");
					} else if (oNumber.indexOf("\ ") > 0) {
						oNumber = oNumber.replace(/\ /g, "");
					}
					oNumber = oNumber.replace(/\,/g, ".");
				}
			}
			return oNumber;
		},

		/**
		 * format inline meanvalue (after result input field)
		 * @param  {String/Number} vMeanValue       mean value
		 * @param  {Number}        iDecimalPlaces   decimal places to display
		 * @return {String}                         formatted text
		 */
		recordResultsInlineMeanValue: function(vMeanValue, iDecimalPlaces) {
			// if mean value is empty, then return empty
			if (vMeanValue === "") {
				return vMeanValue;
			}
			// get float instatnce based on decimal places
			var oFloatFormat = NumberFormat.getFloatInstance({
				decimals: iDecimalPlaces
			});

			return oFloatFormat.format(vMeanValue);
		},

		/**
		 * format characteristic page meanvalue
		 * @param  {String/Number} vMeanValue       mean value
		 * @param  {Number}        iDecimalPlaces   decimal places to display
		 * @param  {String} sUnit unit
		 * @return {String}                         formatted text
		 */
		characDetailMeanValue: function(vMeanValue, iDecimalPlaces, sUnit) {
			// get float instatnce based on decimal places
			var oFloatFormat = NumberFormat.getFloatInstance({
				decimals: iDecimalPlaces
			});
			vMeanValue = Number(vMeanValue);
			var sText = oFloatFormat.format(vMeanValue);
			sUnit = sUnit || "";
			sUnit = sText ? sUnit : "";
			return this.getResourceBundle().getText("QM_CHAR_DETAIL_UNIT", [sText, sUnit]);
		},

		/**
		 * format inline meanvalue unit (after inline meanvalue)
		 * @param  {String/Number} vMeanValue  mean value
		 * @param  {String} sUnit              unit text
		 * @param  {String} sIsQuantitative    quantitative value indicator (1 for quantitative, 0 for qualitative)
		 * @return {String}                    formatted text
		 */
		recordResultsInlineMeanValueUnit: function(vMeanValue, sUnit, sIsQuantitative) {
			// if mean value is empty, then no unit needed
			if (vMeanValue === "") {
				return "";
			}
			var bIsQual = sIsQuantitative === "0";
			sUnit = sUnit || "";
			return bIsQual ? "" : sUnit;
		},

		/**
		 * fill zero in front of given string to given length
		 * @param  {String} sValue  given string
		 * @param  {Number} iLength total length after filling
		 * @return {String}         string after filling
		 */
		fillZeroFront: function(sValue, iLength) {
			return new Array(iLength - sValue.length + 1).join("0") + sValue;
		},

		/**
		 * Parse ISO Date to EDM:Date format for Gateway
		 * @param  {Date} Date Object for parsing
		 */
		// parseISODatetoEDMDate: function(oDate) {
		// 	return [oDate.getFullYear().toString(),
		// 		this.fillZeroFront((oDate.getMonth() + 1).toString(), 2),
		// 		this.fillZeroFront(oDate.getDate().toString(), 2)
		// 	].join("");
		// },
		/**
		 * Converts date time type to string according to user settings
		 * For every time format from user settings, there is a time pattern corresponding to it. Here is the relationship between time format and time pattern:
		 * Time format       Short Description                               Time pattern
		 *           0       24 Hour Format (Example: 12:05:10)              HH:mm:ss
		 *           1       12 Hour Format (Example: 12:05:10 PM)           hh:mm:ss a
		 *           2       12 Hour Format (Example: 12:05:10 pm)           hh:mm:ss a
		 *           3       Hours from 0 to 11 (Example: 00:05:10 PM)       KK:mm:ss a
		 *           4       Hours from 0 to 11 (Example: 00:05:10 pm)       KK:mm:ss a
		 * @public
		 * @param {Edm.Time} time object
		 * @returns {String} time string value.
		 */
		dateTimeFormatter: function(oTime) {
			if (!oTime || oTime.ms === 0) {
				return "";
			}

			var sPattern;
			// get time format of current user
			var sTimeFormat = sap.ui.getCore().getConfiguration().getFormatSettings().getLegacyTimeFormat();

			switch (sTimeFormat) {
				case "0":
					sPattern = "HH:mm:ss";
					break;
				case "1":
				case "2":
					sPattern = "hh:mm:ss a";
					break;
				case "3":
				case "4":
					sPattern = "KK:mm:ss a";
					break;
				default:
					sPattern = "HH:mm:ss";
			}

			var oTimeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern: sPattern
			});
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
			var sFormatedTime = oTimeFormat.format(new Date(oTime.ms + TZOffsetMs));

			// convert AM/PM part to lower case for these time formaters. By default, the AM/PM part is in upper case.
			if (sTimeFormat === "2" || sTimeFormat === "4") {
				sFormatedTime = sFormatedTime.toLowerCase();
			}

			return sFormatedTime;
		},
		/**
		 * Converts date in string type to string according to user settings
		 * For every date format from user settings, there is a date pattern corresponding to it. Here is the relationship between date format and date pattern:
		 * Date format       Short Description                               Date pattern
		 *           1       DD.MM.YYYY							             dd.MM.yyyy
		 *           2       MM/DD/YYYY								         MM/dd/yyyy
		 *           3       MM-DD-YYYY								         MM-dd-yyyy
		 *           4       YYYY.MM.DD									     yyyy.MM.dd
		 *           5       YYYY/MM/DD									     yyyy/MM/dd
		 *           6		 YYYY-MM-DD										 yyyy-MM-dd
		 *           7		 GYY.MM.DD     (Japanese Date)					 GYY.MM.DD
		 *           8		 GYY/MM/DD     (Japanese Date)					 GYY/MM/DD
		 *           9		 GYY-MM-DD     (Japanese Date)				 	 GYY-MM-DD
		 *           A		 YYYY/MM/DD   (Islamic Date 1)					 YYYY/MM/DD
		 *           B		 YYYY/MM/DD   (Islamic Date 2)					 YYYY/MM/DD
		 *           C		 YYYY/MM/DD   (Iranian Date)					 YYYY/MM/DD
		 *           Note: those date formats that are not based on the Gregorian calendar (Japanese date formats '7',
		 *           '8' and '9', Islamic date formats 'A' and 'B' and Iranian date format 'C') are not yet supported by UI5.
		 *           They are accepted by this method for convenience (user settings from ABAP system can be used without filtering),
		 *           but they are ignored. Instead, the formats from the current format locale will be used and a warning will be logged.
		 *
		 * @public
		 * @param {Edm.Date} date object
		 * @returns {String} date string value.
		 */
		dateFormatter: function(oDate) {
			if (!oDate) {
				return "";
			}
			if (typeof oDate === "string") {
				return oDate;
			}
			var sPattern;
			// get date format of current user
			var sDateFormat = sap.ui.getCore().getConfiguration().getFormatSettings().getLegacyDateFormat();

			switch (sDateFormat) {
				case "1":
					sPattern = "dd.MM.yyyy";
					break;
				case "2":
					sPattern = "MM/dd/yyyy";
					break;
				case "3":
					sPattern = "MM-dd-yyyy";
					break;
				case "4":
					sPattern = "yyyy.MM.dd";
					break;
				case "5":
					sPattern = "yyyy/MM/dd";
					break;
				case "6":
					sPattern = "yyyy-MM-dd";
					break;
				case "7":
				case "8":
				case "9":
				case "A":
				case "B":
				case "C":
				default:
					sPattern = "yyyy.MM.dd";
			}

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: sPattern
			});
			var sFormatedDate = "";
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
			sFormatedDate = oDateFormat.format(new Date(oDate.ms + TZOffsetMs));
			if (oDate) {
				sFormatedDate = oDateFormat.format(oDate);
			}

			return sFormatedDate;
		},
		/**
		 * format quantity numbers per decimal places extracted from unit of measure
		 * @param  {String/Number} vQuantity		quantity number
		 * @param  {Number}        iDecimalPlaces   decimal places to display
		 * @return {String}                         formatted text.
		 */
		quantityFormatter: function(vQuantity, iDecimalPlaces) {
			var formatterInstance = this.formatter || this;
			if (this._bIsInitDone) {
				vQuantity = formatterInstance.toStandardNumber(vQuantity);
			}

			// get float instatnce based on decimal places
			var oFloatFormat = NumberFormat.getFloatInstance({
				decimals: iDecimalPlaces
			});

			if (typeof(vQuantity) === "string") {
				vQuantity = vQuantity.trim();
				//return vQuantity directly if input value is still not standard number. Such as "2,4". And ignore x.xE+x.
				if (vQuantity.indexOf(",") !== -1) {
					vQuantity = formatterInstance.toStandardNumber(vQuantity);
				}
			}
			// format quantity with decimal places
			return oFloatFormat.format(vQuantity);
		},

		/**
		 * combine label on the header of the Characteristic detail page named Result of isQualitative summarized value
		 * @param  {String} sCodeTxt  Characteristic Attribute Code txt of isQualitative summarized value
		 * @param  {String} sCodeGrp  Characteristic Attribute Code Group of isQualitative summarized value 
		 * @param  {String} sCode   Characteristic Attribute Code of isQualitative summarized value 
		 * @return {String}                  formatted text example as "Green (Color - 1)"
		 */
		// concatQualiSummarizedResultLabel: function(sCodeTxt, sCodeGrp, sCode) {
		// 	var sFrmattedValue = "";
		// 	sCodeTxt = sCodeTxt || "";
		// 	sCodeGrp = sCodeGrp || "";
		// 	sCode = sCode || "";
		// 	if (sCodeTxt) {
		// 		sFrmattedValue = sCodeTxt + " ";
		// 	}
		// 	if (sCodeGrp && sCode) {
		// 		sFrmattedValue += this.getResourceBundle().getText("QM_START_ADDTIONAL_INFO") +
		// 			sCodeGrp +
		// 			" " +
		// 			this.getResourceBundle().getText("QM_JOINDATE") +
		// 			" " +
		// 			sCode +
		// 			this.getResourceBundle().getText("QM_END_ADDTIONAL_INFO");
		// 	} else if (sCodeGrp || sCode) {
		// 		sFrmattedValue += this.getResourceBundle().getText("QM_START_ADDTIONAL_INFO") +
		// 			sCodeGrp +
		// 			sCode +
		// 			this.getResourceBundle().getText("QM_END_ADDTIONAL_INFO");
		// 	}
		// 	return sFrmattedValue;
		// },

		/**
		 * clear leading zero for string or number.
		 * @param  {String} sNum 
		 * @return {String} formatted value, Example: '0001' will be formatted as '1'
		 */
		// clearLeadingZero: function(sNum) {
		// 	if (sNum) {
		// 		return sNum.toString().replace(/\b(0+)/g, "");
		// 	}
		// 	return "";
		// },

		/**
		 * Format file size of documents
		 * @public
		 * @param {string} sFileSize file size to be formatted
		 * @returns {string} formatted file size
		 */
		// formatFileSize: function(sFileSize) {
		// 	if (jQuery.isNumeric(sFileSize)) {
		// 		return FileSizeFormat.getInstance({
		// 			binaryFilesize: true,
		// 			maxFractionDigits: 1,
		// 			maxIntegerDigits: 4
		// 		}).format(sFileSize);
		// 	} else {
		// 		return sFileSize;
		// 	}
		// },
		/**
		 * Concat colon to the text specified.
		 * @public
		 * @param {string} sText
		 * @returns {string} the text with a colon concated
		 */
		concatColon: function(sText) {
			return sText + ":";
		},
		inspectedStatus: function(sMessage) {
			var oResourceBundle = this.getResourceBundle();
			if (sMessage === "") {
				return "None";
			}
			if (sMessage === oResourceBundle.getText("QM_RESULT_NOT_VALID_INSPECTED")) {
				return "Error";
			}
			return "Warning";
		},
		/**
		 * Join parts of strings with character " / "
		 * @public
		 * @param {string} parts of string.
		 * @returns {String} formatted string.
		 */
		// joinBySlash: function() {
		// 	return Array.prototype.join.apply(arguments,[" / "]);
		// }
	};

});