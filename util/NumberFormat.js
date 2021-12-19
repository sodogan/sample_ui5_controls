/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/format/NumberFormat"],function(N){"use strict";var P=N.extend("i2d.qm.inspresults.records1.util.NumberFormat",{constructor:function(f){N.prototype.constructor.call(this,f);}});P._oFormatSettings=sap.ui.getCore().getConfiguration().getFormatSettings();P.mDecimalNotations={"":{groupingSeparator:".",decimalSeparator:","},"X":{groupingSeparator:",",decimalSeparator:"."},"Y":{groupingSeparator:" ",decimalSeparator:","}};P.getFloatInstance=function(f,l){var F=this._combineFormatOptions(f);return N.getFloatInstance(F,l);};P.getIntegerInstance=function(f,l){var F=this._combineFormatOptions(f);return N.getIntegerInstance(F,l);};P._combineFormatOptions=function(f){var F;if(this._oFormatSettings&&this._oFormatSettings.getLegacyNumberFormat){var d=this._oFormatSettings.getLegacyNumberFormat()||"";F=this.mDecimalNotations[d];F=jQuery.extend(false,{},F,f);}return F;};return P;});
