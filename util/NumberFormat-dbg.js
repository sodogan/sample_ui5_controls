/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/format/NumberFormat"
], function(NumberFormat) {
	"use strict";

	/*
	 * Constructor for i2d.qm.i2d.qm.inspresults.records1.util.NumberFormat
	 *
	 * @class
	 * Use this NumberFormat to proxy standard sap.ui.core.format.NumberFormat
	 * Get format instances with format settings came from ushell (core.configuration)
	 *
	 * @extends sap.ui.core.format.NumberFormat
	 */
	var ProxiedNumberFormat = NumberFormat.extend("i2d.qm.inspresults.records1.util.NumberFormat", {
		constructor: function(oFormatOptions) {
			NumberFormat.prototype.constructor.call(this, oFormatOptions);
		}
	});

	/*
	 * format settings loaded from fiori unified shell
	 * @private
	 */
	ProxiedNumberFormat._oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();

	/*
	 * Decimal nootations relationship mapping
	 * (refer to USR01-Dec.Format)
	 */
	ProxiedNumberFormat.mDecimalNotations = {
		"": {
			groupingSeparator: ".",
			decimalSeparator: ","
		},
		"X": {
			groupingSeparator: ",",
			decimalSeparator: "."
		},
		"Y": {
			groupingSeparator: " ",
			decimalSeparator: ","
		}
	};

	/**
	 * Proxy function getFloatInstance, set format options with settings got from ushell
	 * @param  {object} oFormatOptions                         Object which defines the format options
	 * @param  {sap.ui.core.Locale} oLocale                    Locale to get the formatter for
	 * @return {i2d.qm.inspresults.records1.util.NumberFormat} float instance of the NumberFormat
	 * @static
	 * @public
	 */
	ProxiedNumberFormat.getFloatInstance = function(oFormatOptions, oLocale) {
		var mFormatOptions = this._combineFormatOptions(oFormatOptions);
		return NumberFormat.getFloatInstance(mFormatOptions, oLocale);
	};

	/**
	 * Proxy function getIntegerInstance, set format options with settings got from unshell
	 * @param  {object} oFormatOptions                         Object which defines the format options
	 * @param  {sap.ui.core.Locale} oLocale                    Locale to get the formatter for
	 * @return {i2d.qm.inspresults.records1.util.NumberFormat} integer instance of the NumberFormat
	 * @static
	 * @public
	 */
	ProxiedNumberFormat.getIntegerInstance = function(oFormatOptions, oLocale) {
		var mFormatOptions = this._combineFormatOptions(oFormatOptions);
		return NumberFormat.getIntegerInstance(mFormatOptions, oLocale);
	};

	/**
	 * Combine a format option with settings got from ushell (deeply copy)
	 * @param  {object} oFormatOptions Object which defines the format options
	 * @return {object}                combined format options
	 * @static
	 * @private
	 */
	ProxiedNumberFormat._combineFormatOptions = function(oFormatOptions) {
		var mFormatOptions;
		if (this._oFormatSettings && this._oFormatSettings.getLegacyNumberFormat) {
			var sDecimalNotation = this._oFormatSettings.getLegacyNumberFormat() || "";
			mFormatOptions = this.mDecimalNotations[sDecimalNotation];
			// deeply copy use jQuery
			mFormatOptions = jQuery.extend(false, {}, mFormatOptions, oFormatOptions);
		}
		return mFormatOptions;
	};

	return ProxiedNumberFormat;
});
