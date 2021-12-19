/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["i2d/qm/inspresults/records1/controller/BaseController","sap/ui/model/json/JSONModel"],function(B,J){"use strict";return B.extend("i2d.qm.inspresults.records1.controller.App",{onInit:function(){var v,s;v=new J({busy:true,bAsync:false,delay:0});this.setModel(v,"appView");s=function(){v.setProperty("/busy",false);v.setProperty("/delay",this.getView().getBusyIndicatorDelay());}.bind(this);this.getOwnerComponent().getModel().metadataLoaded().then(s);this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());}});});
