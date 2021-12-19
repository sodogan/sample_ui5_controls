/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([],function(){"use strict";return{calculateMeanValue:function(v,d){if(!v||v.length===0){return 0;}var t=0;v.forEach(function(a){t+=a;});return(t/v.length).toFixed(d);},checkMeanValue:function(h,a,l,u,m){var r=h&&l>m;var R=a&&m>u;return!r&&!R;}};});
