/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/routing/Router","sap/ui/core/routing/History"],function(R,H){"use strict";return{navTo:function(r,n,p,b){if(r&&r instanceof R){r.navTo(n,p,b);}},navBack:function(){var h=H.getInstance(),p=h.getPreviousHash();var c=sap.ushell.Container.getService("CrossApplicationNavigation");if(p!==undefined){history.go(-1);}else{history.go(-1);}}};});
