/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/m/Input","sap/ui/model/json/JSONModel","sap/ui/model/odata/v2/ODataModel","sap/ui/model/Filter","sap/ui/model/Sorter","i2d/qm/inspresults/records1/model/formatter"],function(I,J,O,F,S,f){"use strict";return I.extend("i2d.qm.inspresults.records1.customcontrol.CodeGroupInput",{metadata:{properties:{"codeGroup":{type:"string"},"code":{type:"string"}},events:{"valueChange":{}}},onSearch:function(e){this._filterByGrpCodeAndTxt.call(e.getSource().getBinding("items"),e.getParameter("value"));},onConfirm:function(e){var c=e.getParameter("selectedContexts");if(c.length){var g=c[0].getObject()[this._bindingPath.codeGroup];var C=c[0].getObject()[this._bindingPath.code];var t=this.formatter.rrGroupCodeDisplay(g,C);this.setValue(t);this.setCodeGroup(g);this.setCode(C);this.fireValueChange({"codeGroup":g,"code":C,"valuation":c[0].getObject().CharcAttributeValuation});}},renderer:{},init:function(){this.setModel(new J({"results":[]}),"suggestModel");this._bInitialLoading=true;I.prototype.init.apply(this,arguments);},formatter:f,onBeforeRendering:function(){I.prototype.onBeforeRendering.apply(this,arguments);},onAfterRendering:function(){if(this._bInitialLoading){if(!this.formatter._oResourceBundle||!this._oResourceBundle){this._oResourceBundle=this.getModel("i18n").getResourceBundle();this.formatter._oResourceBundle=this._oResourceBundle;}var s=this.formatter.rrGroupCodeDisplay(this.getCodeGroup(),this.getCode());this.setValue(s);this._bindingPath={"code":this.getBinding("code").getPath(),"codeGroup":this.getBinding("codeGroup").getPath()};this.attachChange(this._onType);this.attachSuggest(this._suggest);this.attachValueHelpRequest(this._performValueHelp);this.attachSuggestionItemSelected(this._onSelect);this._oDataModel=this.getModel("serviceModel");this._bInitialLoading=false;}var d=$("#"+this.getId()+"-labelledby");if(d&&d.length){var l=this.getParent().getContent()[0]&&this.getParent().getContent()[0].getText();d.text(l);}I.prototype.onAfterRendering.apply(this,arguments);},_suggest:function(e){this.getModel("suggestModel").setProperty("/results",[]);if(this._vHMap){this.getModel("suggestModel").setProperty("/results",this._vHMap.results||[]);}else{this._getAllValueHelp(e,function(){this.getModel("suggestModel").setProperty("/results",this._vHMap.results||[]);}.bind(this));}(this._filterByGrpCodeAndTxt.call(this.getBinding("suggestionRows"),e.getParameter("suggestValue")));},_performValueHelp:function(e){var t=this.getValue();if(!this._dialog){this._dialog=sap.ui.xmlfragment("i2d.qm.inspresults.records1.view.fragments.RecordResultsCodeGroupDialog",this);this.addDependent(this._dialog);if(this._dialog.getAggregation("_dialog")!==null){this._dialog.getAggregation("_dialog").setProperty("draggable",true);}}else{this._dialog.removeAllItems();}if(this._vHMap){this._dialog.setModel(new J(this._vHMap),"groupCodeVH");this._dialog.fireSearch({value:t});this._dialog.open(t);}else{var u=function(r){this._dialog.setModel(new J(this._vHMap),"groupCodeVH");this._dialog.fireSearch({value:t});this._dialog._oTable.removeStyleClass("sapMSelectDialogListHide");this._dialog._oBusyIndicator.$().css("display","none");}.bind(this);this._getAllValueHelp(e,u);this._dialog.open(t);this._dialog._oTable.addStyleClass("sapMSelectDialogListHide");this._dialog._oBusyIndicator.$().css("display","inline-block");}},_filterByGrpCodeAndTxt:function(v){if(!v){this.filter([]);return;}if(v.indexOf("-")>=0){var c=v.substr(0,v.lastIndexOf("-"));var C=v.substr(v.lastIndexOf("-")+1);var s=[new F("CharacteristicAttributeCodeGrp",sap.ui.model.FilterOperator.Contains,c.trim()),new F("CharacteristicAttributeCode",sap.ui.model.FilterOperator.Contains,C.trim())];this.filter(s);if(this.getLength()){return;}}var e=v.trim();var E=[new F({filters:[new F("CharacteristicAttributeCodeGrp",sap.ui.model.FilterOperator.Contains,e),new F("CharacteristicAttributeCode",sap.ui.model.FilterOperator.Contains,e),new F("CharacteristicAttributeCodeTxt",sap.ui.model.FilterOperator.Contains,e)],and:false})];this.filter(E);},_filterByLotIdInternalIdAndChar:function(s){var a=[];a.push(new sap.ui.model.Filter("InspectionLot",sap.ui.model.FilterOperator.EQ,s.Inspectionlot));a.push(new sap.ui.model.Filter("InspPlanOperationInternalID",sap.ui.model.FilterOperator.EQ,s.Inspplanoperationinternalid));a.push(new sap.ui.model.Filter("InspectionCharacteristic",sap.ui.model.FilterOperator.EQ,s.Inspectioncharacteristic));return a;},_splitCodeAndGroup:function(v,s){var i=v.lastIndexOf(s);var V=[];if(i!==-1){V.push(v.substring(0,i));V.push(v.substring(i+s.length,v.length));}else{V.push(v);}return V;},_getAllValueHelp:function(e,c){var s=this.getBindingContext().getObject();this._oDataModel.read("/C_Chargroupcode_Valuehelp",{filters:this._filterByLotIdInternalIdAndChar(s),sorters:[new S("CharacteristicAttributeCode",false)],success:(function(r){this._vHMap=r;if(c){c();}}).bind(this)});},_onType:function(e){var s=this.getBinding("suggestionRows").oList;var t=this.getValue().toUpperCase();var v=this._splitCodeAndGroup(t,"-");var a="";var b="";var g=v[0]||"";g=g.trim();var c=v[1]||"";c=c.trim();var d=function(r){return g===r[this._bindingPath.codeGroup]&&c===r[this._bindingPath.code];};var m=s.filter(d.bind(this))[0];if(m){a=this.formatter.rrGroupCodeDisplay(g,c);b=m.CharcAttributeValuation;}else{c="";g="";}this.setValue(a);this.setCodeGroup(g);this.setCode(c);this.fireValueChange({"codeGroup":g,"code":c,"valuation":b});},_onSelect:function(e){var s=e.getParameters().selectedRow.getTable().getSelectedContexts()[0].getObject();var g=s[this._bindingPath.codeGroup].trim();var c=s[this._bindingPath.code].trim();this.setCodeGroup(g);this.setCode(c);var a=this.formatter.rrGroupCodeDisplay(g,c);this.setValue(a);this.fireValueChange({"codeGroup":g,"code":c,"valuation":s.CharcAttributeValuation});}});});