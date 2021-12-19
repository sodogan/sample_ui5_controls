/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Control","sap/suite/ui/microchart/StackedBarMicroChart"],function(C,S){return S.extend("i2d.qm.inspresults.records1.customcontrol.viz.StackedBar",{metadata:{properties:{"currentItems":{type:"object",defaultValue:[]},}},renderer:{},onBeforeRendering:function(){var b=this.getBars();this.oResourceBundle=this.getModel("i18n").getResourceBundle();var m=this.getModel();var c=this.getBindingContext();var a=this.getCurrentItems();if(!a||!a.length){return;}var d=[];var t=this.oResourceBundle.getText("QM_FIELD_PROGRESS_OF_CHARACTERISTIC")+" ";var s=0;for(var i=0;i<a.length;i++){var o=m.getProperty("/"+a[i],c);b[i].setValueColor(o.color);b[i].setValue(o.count);s+=o.count;t+=this.getCharProgressTooltip(o.color,o.count);d.push(o);}this.setTooltip(t);this.setMaxValue(s);S.prototype.onBeforeRendering.apply(this,arguments);},onAfterRendering:function(){var t=this.getTooltip();$("#"+this.getId()).attr("aria-label",t);S.prototype.onAfterRendering.apply(this,arguments);},getCharProgressTooltip:function(c,i){var t;switch(c){case"Good":t=this.oResourceBundle.getText("QM_ACCEPTED")+": "+i+"\n";break;case"Error":t=this.oResourceBundle.getText("QM_REJECTED")+": "+i+"\n";break;default:t=this.oResourceBundle.getText("QM_RR_POPOVER_OPEN_CHAR")+": "+i;}return t;}});});
