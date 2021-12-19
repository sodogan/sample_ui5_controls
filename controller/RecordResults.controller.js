/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["i2d/qm/inspresults/records1/controller/BaseController","i2d/qm/inspresults/records1/model/formatter","i2d/qm/inspresults/records1/util/CalculationHelper","i2d/qm/inspresults/records1/util/NumberFormat","sap/ui/model/Filter","sap/ui/model/json/JSONModel","sap/m/MessageBox","sap/m/MessagePopover","sap/m/MessagePopoverItem"],function(B,f,C,N,F,J,M,a,b){"use strict";return B.extend("i2d.qm.inspresults.records1.controller.RecordResults",{formatter:f,CalculationHelper:C,NumberFormat:N,oSavePayloadKeys:{ignoreKeys:["ValuationErrorMessage","Insporiginresultvaluecount","IsQual","IsLower","IsMeasure","IsSum","IsUpper","IsWithCode","HasTarget","IsDataChanged","CodeGroupCodeErrorMessage","TemplateId","CodeGroupCodeValuation","RemarkErrorMessage","IsEditable"],formatKeys:["Inspectionresultmeanvalue"]},openStatusKeys:["0","1","2","3"],onInit:function(e){this._oView=this.getView();this._oRouter=this.getRouter();this._oDataModel=this.getOwnerComponent().getModel();this.setModel(this._oDataModel,"serviceModel");this._oResourceBundle=this.getResourceBundle();this._oResultsTable=this.byId("QR_RR_CHARAC_TABLE");this._oSaveBtn=this.byId("QR_SAVE");this._oMsgPopoverBtn=this.byId("QR_MSG_POPOVER_BTN");this._iInspResultColumnIndex=2;this._iManualValuationColumnIndex=3;this._oRouter.getRoute("recordResults").attachMatched(this.onRecordResultsRouteMatch,this);this._fnNavBack=undefined;var v=new J({});this.setModel(v,"recordResultsModel");},resetMessages:function(){this._aCallbackMessages=[];this.getModel("recordResultsModel").setProperty("/messageCount",0);},onRecordResultsRouteMatch:function(e){this._oInspectionResultVHMap={};this._oRRRemovedTokenMap=[];this._oErrorStatusInputs=[];this.replaceHeadNavBack();this.resetMessages();this._bIsInitDone=false;this.getModel("recordResultsModel").setProperty("/allDataHeader",this._oResourceBundle.getText("QM_RR_ALL_DATA_HEADER_EMPTY")+"  ");this.getModel("recordResultsModel").setProperty("/openDataHeader",this._oResourceBundle.getText("QM_RR_OPEN_DATA_HEADER_EMPTY")+"  ");this.oStatusTab=this.byId("QR_RR_STATUS_TAB").setSelectedKey("allData");this._oSelectedModel=this.getOwnerComponent().getModel("selectedModelForRecording")&&this.getOwnerComponent().getModel("selectedModelForRecording").getData()||{items:[],filters:[]};var A=e.getParameter("arguments");var c=A&&A.fromTab&&A.fromTab===this.Constants.WorkListTabKey.MIC;if(c){this.retrieveCharacForSelectedMIC(this._oSelectedModel).then(this.onCharInfoRequestSuccess.bind(this));}else{this.retrieveCharacTableData(this._oSelectedModel).then(this.onCharInfoRequestSuccess.bind(this));}},replaceHeadNavBack:function(){var o=sap.ui.getCore().byId("backBtn");this._fnNavBack=o.onclick;var c=sap.ui.getCore().getEventBus();c.publish("i2d.qm.inspresults.records1.event","replaceNavBack",{navBackHandler:o.onclick});var d=function(e){this.onHeadNavBack(o);}.bind(this);o.onclick=d;},onHeadNavBack:function(o){var r=this.getResourceBundle();var c=!!this.getView().$().closest(".sapUiSizeCompact").length;if(this._aInspectionResultSaveMap&&this._aInspectionResultSaveMap.length>0){M.show(r.getText("QM_CHAR_LEAVE_CONFIRM_MSG"),{icon:M.Icon.QUESTION,title:r.getText("QM_CHAR_LEAVE_CONFIRM_TITLE"),styleClass:c?"sapUiSizeCompact":"",actions:[r.getText("QM_CHAR_LEAVE_CONFIRM_OK"),r.getText("addSample.form.cancel")],initialFocus:r.getText("addSample.form.cancel"),onClose:(function(A){if(A===r.getText("QM_CHAR_LEAVE_CONFIRM_OK")){this._clearAndNavBack();o.onclick=this._fnNavBack;this._fnNavBack=undefined;}}).bind(this)});}else{this._clearAndNavBack();o.onclick=this._fnNavBack;this._fnNavBack=undefined;}},_clearAndNavBack:function(){this.byId("QR_RR_STATUS_TAB").setEnabled(true);this._oResultsTable.removeAllItems();this.NavHelper.navBack();},refreshBindingFields:function(m,c){var c=c||["Inspectionvaluationresult","IsDataChanged","ValuationErrorMessage","InspRsltAboveToleranceValsNmbr","InspRsltBelowToleranceValsNmbr","Inspectionresultmeanvalue","InspResultValidValuesNumber","InspRsltNonconformingValsNmbr"];c.forEach(function(s){m.aBindings.forEach(function(o){if(o.getPath()===s){o.refresh();}});});},handleSaveMap:function(o,r){o.IsDataChanged=true;var i=o.Inspectionlot+o.Inspplanoperationinternalid+o.Inspectioncharacteristic+o.Inspectionsubsetinternalid;var c=false;this._aInspectionResultSaveMap.forEach(function(n){if(n.key===i){n.value=o;c=true;return;}});if(r&&r.length>0){this._addRRRemovedTokenMap(i,r);}if(!c){this._aInspectionResultSaveMap.push({key:i,value:o});}this._oSaveBtn.setEnabled(true);this.byId("QR_RR_STATUS_TAB").setEnabled(true);if(this._oErrorStatusInputs.length>0){this._oSaveBtn.setEnabled(false);this.byId("QR_RR_STATUS_TAB").setEnabled(false);}},_addRRRemovedTokenMap:function(k,i){var c=JSON.parse(JSON.stringify(i));c.forEach(function(e){e.Inspectionresultattribute="/";});var d=this._oRRRemovedTokenMap.filter(function(e){return e.key===k;})[0];if(d){d.value=c;}else{this._oRRRemovedTokenMap.push({key:k,value:c});}},applyValuation10:function(o){var r=this.valuationRule10(o);if(r==="Accept"){o.Inspectionvaluationresult="A";o.ValuationErrorMessage="";}else if(r==="Reject"){o.Inspectionvaluationresult="R";o.ValuationErrorMessage="";}else if(r){o.Inspectionvaluationresult="";o.ValuationErrorMessage=r;}},applyValuation70:function(o){var h=false;var v=o.Inspectionresultmeanvalue;if(!o.IsSum&&o.to_ResultDetails.results.length>0){h=true;}if(o.IsSum&&!isNaN(v)&&v!==""){h=true;}if(!h){o.Inspectionvaluationresult="";}else{var i=this.CalculationHelper.checkMeanValue(o.IsLower,o.IsUpper,o.Inspspeclowerlimit,o.Inspspecupperlimit,v);o.Inspectionvaluationresult=i?"A":"R";}},applyValuation40:function(o){o.Inspectionvaluationresult=o.CodeGroupCodeValuation;},onRequestError:function(r){M.error(r.responseText,{title:this._oResourceBundle.getText("QM_CHAR_ERROR_TITLE")});},onCharInfoRequestSuccess:function(r){var R=new J(r);r.results.forEach(function(o){if(!o.InspectionResultHasMeanValue){o.Inspectionresultmeanvalue="";}});R.setSizeLimit(1000);this._oResultsTable.setModel(R);var g=function(q,s,m,d,w){if(!q&&s&&m&&d){return 1;}if(!q&&s&&m&&!d){return 2;}if(!q&&!s&&m&&d){return 3;}if(!q&&!s&&m&&!d){return 4;}if(!q&&s&&!m&&d){return 5;}if(!q&&s&&!m&&!d){return 6;}if(!q&&!s&&!m){return 7;}if(q&&s&&w){return 8;}if(q&&!s&&w){return 9;}if(q&&s&&!w){return 10;}return 11;};this._oResultsTable.bindItems("/results",function(i,d){var o=d.getObject();o.IsEditable=o.Displayonly!=="X";o.ValuationErrorMessage="";o.IsQual=o.Inspspecisquantitative==="0";o.IsSum=o.Inspspecrecordingtype==="";o.IsWithCode=o.Inspspeccontrolindicators.substr(2,1)==="X";o.IsMeasure=o.InspSpecIsMeasuredValueRqd==="X";o.IsUpper=o.Inspspechasupperlimit==="X";o.IsLower=o.Inspspechaslowerlimit==="X";o.HasTarget=o.Inspspechastargetvalue==="X";o.Inspspeclowerlimit=parseFloat(o.Inspspeclowerlimit);o.Inspspecupperlimit=parseFloat(o.Inspspecupperlimit);var e=new sap.ui.xmlfragment("i2d.qm.inspresults.records1.view.fragments.RecordResultsTableItemTemplate",this);var t=g(o.IsQual,o.IsSum,o.IsMeasure,o.IsUpper||o.IsLower,o.IsWithCode);o.TemplateId=t;o.RemarkErrorMessage="";var h=sap.ui.controller("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsRowItem"+t);h.oRRController=this;h.getResourceBundle=function(){return this.oRRController._oResourceBundle;};h._oResourceBundle=this._oResourceBundle;h.formatter._oResourceBundle=this._oResourceBundle;if(h.onInit){h.onInit();}var I=new sap.ui.xmlfragment("i2d.qm.inspresults.records1.view.fragments.RecrodResultsRowItemTemplate"+t,h);e.getCells()[this._iInspResultColumnIndex].addItem(I);var m=sap.ui.controller("i2d.qm.inspresults.records1.controller.fragments.RecrodResultsManualValuation");m.oRRController=this;h.getResourceBundle=function(){return this.oRRController._oResourceBundle;};m._oResourceBundle=this._oResourceBundle;m.formatter._oResourceBundle=this._oResourceBundle;var j=new sap.ui.xmlfragment("i2d.qm.inspresults.records1.view.fragments.RecordResultsStatusValuation",m);e.getCells()[this._iManualValuationColumnIndex].addItem(j);return e;}.bind(this));var A=this._oResourceBundle.getText("QM_RR_ALL_DATA_HEADER",[r.results.length]);var c=this.getModel("recordResultsModel");c.setProperty("/allDataHeader",A);this.resetOpenStatusCount(r);c.setProperty("/resultsTableModel",r);c.setProperty("/messageCount",0);this._bIsInitDone=true;this._aInspectionResultSaveMap=[];this._oSaveBtn.setEnabled(false);this._oResultsTable.setBusy(false);this._oView.setBusy(false);this._setAriaForMessageButton();},resetOpenStatusCount:function(r){var s=0;if(r){r.results.forEach(function(i){if(this.openStatusKeys.indexOf(i.Inspectionresultstatus)>=0){s++;}}.bind(this));}var o=this._oResourceBundle.getText("QM_RR_OPEN_DATA_HEADER",[s]);this.getModel("recordResultsModel").setProperty("/openDataHeader",o);},retrieveDataByFilters:function(e){this._bIsOpenTab=false;if(e.getParameter("key")==="openStatusData"){this._bIsOpenTab=true;this.filterbyOpenStatus();if(!this._oResultsTable.getItems().length){this.displayNoDataText();}}else{if(this._oResultsTable.getBinding("items")){this._oResultsTable.getBinding("items").filter([]);}else{this.displayNoDataText();}}},displayNoDataText:function(){if(this._bIsOpenTab){this._oResultsTable.setNoDataText(this._oResourceBundle.getText("QM_RR_NO_OPEN_CHAR"));}else{this._oResultsTable.setNoDataText(this._oResourceBundle.getText("QM_RR_NO_CHAR"));}},filterbyOpenStatus:function(){var o=[];this.openStatusKeys.forEach(function(I){o.push(new F("Inspectionresultstatus",sap.ui.model.FilterOperator.EQ,I));});var i=this._oResultsTable.getBinding("items");if(i){i.filter([new F({filters:o,and:false})]);}},_setAriaForMessageButton:function(){var A=this.byId("QR_HIDDEN_MSG");this._oMsgPopoverBtn.rerender();$("#"+this._oMsgPopoverBtn.getId()).attr("aria-label",A.getText());},addErrorInputIntoErrorStatusInputs:function(i){var I=this._oErrorStatusInputs.indexOf(i);if(I<0){this._oErrorStatusInputs.push(i);}},removeNoErrorInputFromErrorStatusInputs:function(i){var I=this._oErrorStatusInputs.indexOf(i);if(I<0){return;}this._oErrorStatusInputs.splice(I,1);},valuationRule10:function(o){var i=parseInt(o.InspResultValidValuesNumber||0,10);var I=parseInt(o.InspRsltNonconformingValsNmbr||0,10);var c=parseInt(o.Inspsampleacceptancenumber,10);var d=parseInt(o.Inspsamplerejectionnumber,10);var e=parseInt(o.Inspectionsamplesize,10);var g=o.IsSum;if(I<=c&&i>=e){return"Accept";}if(I>=d&&i<=e){return"Reject";}var u=e-i+I;if(i===e){return"Accept";}if(i<e){if(u<=c){return"Accept";}if(u<d&&I>c){return"Accept";}if(g){return this._oResourceBundle.getText("QM_RESULT_NOT_ENOUGH_INSPECTED");}return this._oResourceBundle.getText("QM_RESULT_NOT_ENOUGH_INSPECTED_SINGLE_VALUE");}if(u>=d){return"Reject";}if(u>c&&I<d){return"Accept";}if(g){return this._oResourceBundle.getText("QM_RESULT_TOO_MANY_INSPECTED");}return this._oResourceBundle.getText("QM_RESULT_TOO_MANY_INSPECTED_SINGLE_VALUE");},retrieveCharacForSelectedMIC:function(s){var d=this.getNewODataModel();var p=this.formatter.fillZeroFront;this._oView.setBusy(true);var S=[];var r=function(m){m.InspectionMethodVersion=m.InspectionMethodVersion&&p(m.InspectionMethodVersion,6);var u=["/InspectionCharacteristicSet(InspectionSpecificationPlant='",m.InspectionSpecificationPlant,"',InspectionSpecification='",encodeURIComponent(m.InspectionSpecification),"',InspectionSpecificationVersion='",p(m.InspectionSpecificationVersion,6),"')"].join("");d.read(u,{filters:s.filters,urlParameters:"$select=MastCharNavRR&$expand=MastCharNavRR/to_ResultDetails",success:function(R){S=S.concat(R.MastCharNavRR&&R.MastCharNavRR.results||[]);S.forEach(function(i){if(!i.to_ResultDetails){i.to_ResultDetails={results:[]};}i.to_ResultDetails.results4Binding=[];Array.prototype.push.apply(i.to_ResultDetails.results4Binding,i.to_ResultDetails.results.filter(function(o){return o.Inspectionvaluationresult!=="F";}));});}});};return new Promise((function(c,e){s.items.forEach(r,this);d.attachBatchRequestCompleted(function(E){c({results:S,hasFilter:false});});d.attachBatchRequestFailed(e);}).bind(this));},onChangeForValuationByBindingData:function(o,A){if(!o.InspSampleValuationRule){o.ValuationErrorMessage="";return;}if(o.InspSampleValuationRule==="10"){this.applyValuation10(o);return;}if(o.InspSampleValuationRule==="70"){this.applyValuation70(o);return;}if(o.InspSampleValuationRule==="40"){this.applyValuation40(o);return;}},onRemarkChange:function(e){var o=e.getSource().getBindingContext().getObject();this.handleSaveMap(o);},validateRemark:function(o){var i=false;var v=o.Inspectionvaluationresult;switch(o.Inspresultisdocumentationrqd){case".":i=v==="R";break;case"+":i=v==="R"||v==="A";break;default:break;}var e=(o.Inspectionresulttext.trim()===""&&i)?this.getModel("i18n").getResourceBundle().getText("QM_INSPECTION_ENTER_A_REMARK"):"";o.RemarkErrorMessage=e;return!e;},retrieveCharacTableData:function(s){var t=this.getNewODataModel();var c={results:[]};var r=function(i){var d=[];var I=i.InspectionLot&&new F("Inspectionlot",sap.ui.model.FilterOperator.EQ,i.InspectionLot);d.push(I);var o=i.InspectionOperation&&new F("Inspectionoperation",sap.ui.model.FilterOperator.EQ,i.InspectionOperation);if(o){d.push(o);}var S=i.MaterialSample&&new F("Materialsample",sap.ui.model.FilterOperator.EQ,i.MaterialSample);if(S){d.push(S);}this._oResultsTable.setBusy(true);t.read("/CharInfoSet",{filters:d,urlParameters:"$expand=to_ResultDetails",success:function(R){c.results=c.results.concat(R.results);c.results.forEach(function(e){if(!e.to_ResultDetails){e.to_ResultDetails={results:[]};}e.to_ResultDetails.results4Binding=[];Array.prototype.push.apply(e.to_ResultDetails.results4Binding,e.to_ResultDetails.results.filter(function(g){return g.Inspectionvaluationresult!=="F";}));});}});};return new Promise((function(d,e){s.items.forEach(r,this);t.attachBatchRequestCompleted(function(E){d(c);});t.attachBatchRequestFailed(e);}).bind(this));},handleCharPopoverPress:function(e){if(!this._oPopover){this._oPopover=sap.ui.xmlfragment("i2d.qm.inspresults.records1.view.fragments.RecordResultsPopover",this);this.getView().addDependent(this._oPopover);}var c=e.getSource().getBindingContext().getObject()||{};this._oPopover.setModel(new J(c));this._oPopover.openBy(e.getSource());},onPressShowSavedMessage:function(e){this._showSavedMessage();},_showSavedMessage:function(){var m=new J();m.setData(this._aCallbackMessages);if(!this.oMessagePopover){var o=new b({type:"{type}",title:"{title}",description:"{description}"});this.oMessagePopover=new a({items:{path:"/",template:o}});}this.oMessagePopover.destroyItems();this.oMessagePopover.setModel(m);this.oMessagePopover.openBy(this._oMsgPopoverBtn);},_generateSavePayload:function(m){var t=this;var p={"d":{}};p.d=JSON.parse(JSON.stringify(m));this.oSavePayloadKeys.ignoreKeys.forEach(function(n){delete p.d[n];});if(p.d["Inspectionresultmeanvalue"]===""){p.d["Inspectionresultmeanvalue"]=0;p.d["InspectionResultHasMeanValue"]="";}else{p.d["InspectionResultHasMeanValue"]="X";}this.oSavePayloadKeys.formatKeys.forEach(function(n){p.d[n]=t.formatter.toStandardNumber(p.d[n]);});if(m.to_ResultDetails.results){var i=p.d.Inspectionlot+p.d.Inspplanoperationinternalid+p.d.Inspectioncharacteristic+p.d.Inspectionsubsetinternalid;p.d.to_ResultDetails=m.to_ResultDetails.results;this._oRRRemovedTokenMap.forEach(function(I){if(I.key===i){Array.prototype.push.apply(p.d.to_ResultDetails,I.value);}});}p.d.InspectionNonconformingRatio=parseFloat(m.InspectionNonconformingRatio);return p;},handleCancelButtonPress:function(e){var r=this.getResourceBundle();var c=!!this.getView().$().closest(".sapUiSizeCompact").length;if(this._aInspectionResultSaveMap&&this._aInspectionResultSaveMap.length>0){M.show(r.getText("QM_CHAR_DISCARD_CONFIRM_MSG"),{icon:M.Icon.QUESTION,title:r.getText("QM_CHAR_DISCARD_CONFIRM_TITLE"),styleClass:c?"sapUiSizeCompact":"",actions:[r.getText("QM_CHAR_DISCARD_CONFIRM_OK"),r.getText("addSample.form.cancel")],initialFocus:r.getText("addSample.form.cancel"),onClose:function(A){if(A===r.getText("QM_CHAR_DISCARD_CONFIRM_OK")){history.go(-1);}}});}else{history.go(-1);}},handleSaveButtonPress:function(E){var d=false;if(this.oMessagePopover){this.oMessagePopover.close();}var r=true;this._aInspectionResultSaveMap.forEach(function(s){if(!this.validateRemark.call(this,s.value)){r=false;}}.bind(this));this.refreshBindingFields(this._oResultsTable.getModel(),["RemarkErrorMessage"]);if(!r){return;}this._iMessageCount=0;var p=null;var m=this.getNewODataModel();m.setUseBatch(true);var o={};for(var i=0;i<this._aInspectionResultSaveMap.length;i++){var R=this._aInspectionResultSaveMap[i].value;p=this._generateSavePayload(R);var t=this;m.create("/CharInfoSet",p,{changeSetId:i,success:(function(c,e){var g=false;this.inspectionLot=c.Inspectionlot;this.operation=c.Inspectionoperation;this.characteristic=c.Inspectioncharacteristic;this.refreshResultData(c);for(i=0;i<sap.ui.getCore().getMessageManager().getMessageModel().getData().length;i++){var h=sap.ui.getCore().getMessageManager().getMessageModel().oData[i].message;if(h.search(this.inspectionLot)!==-1){if(d===false){if(sap.ui.getCore().getMessageManager().getMessageModel().oData[i].code!=undefined&&sap.ui.getCore().getMessageManager().getMessageModel().oData[i].code==="Q5/043"){M.warning(this.getResourceBundle().getText("QM_DIGITAL_SIGNATURE_REQUIRED"),{actions:[sap.m.MessageBox.Action.OK],});this._iMessageCount++;d=true;if(g===false){o={type:sap.ui.core.MessageType.Warning,title:this.getResourceBundle().getText("QM_DIGITAL_SIGNATURE_MESSAGE"),description:this.getResourceBundle().getText("QM_DIGITAL_SIGNATURE",[this.inspectionLot,this.operation,this.characteristic])};this._aCallbackMessages.push(o);g=true;}}}else{if(g===false){this._iMessageCount++;o={type:sap.ui.core.MessageType.Warning,title:this.getResourceBundle().getText("QM_DIGITAL_SIGNATURE_MESSAGE"),description:this.getResourceBundle().getText("QM_DIGITAL_SIGNATURE",[this.inspectionLot,this.operation,this.characteristic])};this._aCallbackMessages.push(o);g=true;}}}}this._iMessageCount++;o={type:sap.ui.core.MessageType.Success,title:this.getResourceBundle().getText("QM_CHAR_SAVE_SUCCEEDED"),description:this.getResourceBundle().getText("QM_RR_DETAIL_FIELD_COLON",[this.getResourceBundle().getText("QM_LOTS_TEXT"),c.Inspectionlot])+"\n"+this.getResourceBundle().getText("QM_RR_DETAIL_FIELD_COLON",[this.getResourceBundle().getText("QM_OPERATION_TEXT"),c.Inspectionoperation])+"\n"+this.getResourceBundle().getText("QM_RR_DETAIL_FIELD_BRACKETS",[c.Inspectionspecificationtext,c.Inspectioncharacteristic])};this._aCallbackMessages.push(o);var j=c.Inspectionlot+c.Inspplanoperationinternalid+c.Inspectioncharacteristic+c.Inspectionsubsetinternalid;this.removeMapElement(this._aInspectionResultSaveMap,j);this.removeMapElement(this._oRRRemovedTokenMap,j);}).bind(this),error:(function(c){this._iMessageCount++;if(c&&c.statusCode==="400"){try{var g=JSON.parse(c.responseText);var s=g.error.innererror.errordetails[0]&&g.error.innererror.errordetails[0].message;o={type:sap.ui.core.MessageType.Error,title:this.getResourceBundle().getText("QM_CHAR_SAVE_FAILED"),description:s};}catch(e){jQuery.sap.error(e);}}else{o={type:sap.ui.core.MessageType.Error,title:this.getResourceBundle().getText("QM_CHAR_SAVE_FAILED"),description:c.responseText};}this._aCallbackMessages.push(o);}).bind(this)});}this.resetMessages();m.submitChanges();m.attachBatchRequestCompleted(function(){this.getModel("recordResultsModel").setProperty("/messageCount",this._iMessageCount);this._oView.setBusy(false);this._showMessagePopover();if(this._bIsOpenTab){this.filterbyOpenStatus();}this.resetOpenStatusCount(this.getModel("recordResultsModel").getProperty("/resultsTableModel"));this._setAriaForMessageButton();}.bind(this));this._oSaveBtn.setEnabled(false);this._oView.setBusy(true);},removeMapElement:function(m,s){for(var i=0;i<m.length;i++){if(m[i].key==s){m.splice(i,1);}}},_showMessagePopover:function(){var e=this._aCallbackMessages.some(function(o){if(o.type===sap.ui.core.MessageType.Error){this._showSavedMessage();return true;}}.bind(this));if(!e){var m=this.getResourceBundle().getText("QM_CHAR_SAVE_SUCCEEDED");sap.m.MessageToast.show(m);}},refreshResultData:function(r){var c=this._oResultsTable.getModel().oData.results;var p=-1;var d=this._oResultsTable.getItems();d.forEach(function(h,i){var j=h.getBindingContext();if(j.getProperty("Inspectionlot")==r.Inspectionlot&&j.getProperty("Inspplanoperationinternalid")==r.Inspplanoperationinternalid&&j.getProperty("Inspectioncharacteristic")==r.Inspectioncharacteristic&&j.getProperty("Inspectionsubsetinternalid")==r.Inspectionsubsetinternalid){j.getObject().Inspectionresultstatustext=r.Inspectionresultstatustext;j.getObject().Inspectionresultstatus=r.Inspectionresultstatus;j.getObject().IsDataChanged=false;p=i;}});if(p===-1){return;}var e=d[p].getBindingContext();var o;var g;this._oResultsTable.getModel().aBindings.forEach(function(h){if(h.getPath()==="Inspectionresultstatustext"&&h.oContext===e){g=h;}if(h.getPath()==="IsDataChanged"&&h.oContext===e){o=h;}});o.refresh();g.refresh();var s=e.getPath();var m=e.getModel();if(r.Inspspecrecordingtype){r.to_ResultDetails=r.to_ResultDetails||{"results":[]};var R=[];Array.prototype.push.apply(R,r.to_ResultDetails.results.filter(function(h){return h.Inspectionvaluationresult!=="F";}));m.setProperty(s+"/to_ResultDetails/results4Binding",R);m.setProperty(s+"/to_ResultDetails/results",r.to_ResultDetails.results);m.setProperty(s+"/Inspresultvaluecount",r.Inspresultvaluecount);this._oResultsTable.getItems()[p].getCells()[2].getItems()[0].getContent()[0].getContent()[1].reset();}},navToOtherApp:function(s,A,p){var c=sap.ushell.Container.getService("CrossApplicationNavigation");var h=(c&&c.hrefForExternal({target:{semanticObject:s,action:A},params:p}));if(h){sap.m.URLHelper.redirect(h,false);}else{c.toExternal({target:{shellHash:"#"}});}}});});
