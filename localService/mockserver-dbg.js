/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/util/MockServer"
], function(MockServer) {
	"use strict";
	var oMockServer,
		_sAppModulePath = "i2d/qm/inspresults/records1/",
		_sJsonFilesModulePath = _sAppModulePath + "localService/mockdata";

	return {

		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */
		init: function() {
			var oUriParameters = jQuery.sap.getUriParameters(),
				sJsonFilesUrl = jQuery.sap.getModulePath(_sJsonFilesModulePath),
				sManifestUrl = jQuery.sap.getModulePath(_sAppModulePath + "manifest", ".json"),
				sEntity = "ZCoco_Sflight",
				sErrorParam = oUriParameters.get("errorType"),
				iErrorCode = sErrorParam === "badRequest" ? 400 : 500,
				oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data,
				oMainDataSource = oManifest["sap.app"].dataSources.mainService,
				oDataSource = oManifest["sap.app"].dataSources,
				sMetadataUrl = jQuery.sap.getModulePath(_sAppModulePath + oMainDataSource.settings.localUri.replace(".xml", ""), ".xml"),
				// ensure there is a trailing slash
				sMockServerUrl = /.*\/$/.test(oMainDataSource.uri) ? oMainDataSource.uri : oMainDataSource.uri + "/",
				aAnnotations = oMainDataSource.settings.annotations;
			oMockServer = new MockServer({
				rootUri: sMockServerUrl
			});
			var that = this;
			var originalLoadMetadata = oMockServer._loadMetadata;

			oMockServer._loadMetadata = function(url) {
				var oMetadata = originalLoadMetadata.apply(oMockServer, [url]);
				oMetadata = that._transformMetadataXML.apply(that, [oMetadata]);
				oMockServer._sMetadata = new XMLSerializer().serializeToString(oMetadata);
				return oMetadata;
			};
			// configure mock server with a delay of 1s
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: (oUriParameters.get("serverDelay") || 1000)
			});

			// load local mock data
			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl: sJsonFilesUrl,
				bGenerateMissingMockData: true
			});

			var aRequests = oMockServer.getRequests();
			// aRequests.push({
			// 	method: "GET",
			// 	path: new RegExp("InspectionLotsSet(.*\).*"),
			// 	response: function(oXhr, sUrlParams) {
			// 		debugger;
			// 		var sPath ="/sap/opu/odata/SAP/QM_RR_SRV/InspectionLotsSet?$skip=0&$top=20&$select=InspectionLot%2cMaterial%2cBatch%2cMaterialSampleCount%2cInspCharCount%2cChPrgsItems%2cOpPrgsItems%2cOpCmptItems%2cInspectionLotEndDate%2cInspectionLot%2cInspLotQuantityUnitDecPlaces%2cInspLotSampleQtyUnitDecPlaces%2cInspLotContainerUnitDecPlaces&$expand=ChPrgsItems%2cOpPrgsItems%2cOpCmptItems&$inlinecount=allpages";
			// 			// var sPath ="/sap/opu/odata/SAP/QM_RR_SRV/InspectionLotsSet";
			// 		var oResponse = jQuery.sap.sjax({
			// 			url: sPath
			// 		});
			// 		if (oResponse.status === "error") {
			// 			oXhr.respond(oResponse.statusCode, {
			// 				"Content-Type": "text/plain;charset=utf-8"
			// 			}, oResponse.errorResponse);
			// 		} else {
			// 			oXhr.respondJSON(200, {}, JSON.stringify(oResponse.data));
			// 		}
			// 		return true;

			// 	}.bind(this)
			// });
			var fnResponse = function(iErrCode, sMessage, aRequest) {
				aRequest.response = function(oXhr) {
					oXhr.respond(iErrCode, {
						"Content-Type": "text/plain;charset=utf-8"
					}, sMessage);
				};
			};

			// handling the metadata error test
			if (oUriParameters.get("metadataError")) {
				aRequests.forEach(function(aEntry) {
					if (aEntry.path.toString().indexOf("$metadata") > -1) {
						fnResponse(500, "metadata Error", aEntry);
					}
				});
			}

			// Handling request errors
			if (sErrorParam) {
				aRequests.forEach(function(aEntry) {
					if (aEntry.path.toString().indexOf(sEntity) > -1) {
						fnResponse(iErrorCode, sErrorParam, aEntry);
					}
				});
			}
			oMockServer.setRequests(aRequests);
			oMockServer.start();

			jQuery.sap.log.info("Running the app with mock data");
			aAnnotations.forEach(function(sAnnotationName) {
				var oAnnotation = oDataSource[sAnnotationName],
					sUri = oAnnotation.uri,
					sLocalUri = jQuery.sap.getModulePath(_sAppModulePath + oAnnotation.settings.localUri.replace(".xml", ""), ".xml");

				///annotiaons
				new MockServer({
					rootUri: sUri,
					requests: [{
						method: "GET",
						path: new RegExp("([?#].*)?"),
						response: function(oXhr) {
							jQuery.sap.require("jquery.sap.xml");

							var oAnnotations = jQuery.sap.sjax({
								url: sLocalUri,
								dataType: "xml"
							}).data;

							oXhr.respondXML(200, {}, jQuery.sap.serializeXML(oAnnotations));
							return true;
						}
					}]

				}).start();
			});
		},

		/**
		 * @public returns the mockserver of the app, should be used in integration tests
		 * @returns {sap.ui.core.util.MockServer} the mockserver instance
		 */
		getMockServer: function() {
			return oMockServer;
		},
		
			_transformMetadataXML: function(document) {
			var oTransformedMetadata = document;
			oTransformedMetadata = this._addRefConstraint(document,
				"QM_RR_SRV",
				"InspectionLots", ["InspectionLot"],
				"ComparisonItem", ["InspectionLot"]
			);
			oTransformedMetadata = this._addRefConstraint(document,
				"QM_RR_SRV",
				"InspectionLots", ["InspectionLot"],
				"ComparisonItem", ["InspectionLot"]
			);
			oTransformedMetadata = this._addRefConstraint(document,
			"QM_RR_SRV",
				"InspectionLots", ["InspectionLot"],
				"ComparisonItem", ["InspectionLot"]
			);
			return oTransformedMetadata;
		},
			_addRefConstraint: function(document, sNamespace,
			sPrincipalEntityTypeName, aPrincipalEntityTypeFKPropertyNames,
			sDependentEntityTypeName, aDependentEntityTypeKeyPropertyNames) {
			var oAssocDetail = this._getAssociationDetail(document, sNamespace,
				sPrincipalEntityTypeName, sDependentEntityTypeName);
			var oRefConstraint = this._getRefConstraint(document,
				oAssocDetail.sFromRoleName, aPrincipalEntityTypeFKPropertyNames,
				oAssocDetail.sToRoleName, aDependentEntityTypeKeyPropertyNames);

			/*eslint-disable sap-no-dom-insertion*/
			oAssocDetail.oAssoc.appendChild(oRefConstraint);
			/*eslint-enable sap-no-dom-insertion*/
			return document;
		},
		
		_getAssociationDetail: function(document, sNamespace,
			sPrincipalEntityTypeName, sDependentEntityTypeName) {
			var aAssocs = document.querySelectorAll("Association");
			for (var i = 0; i < aAssocs.length; i++) {
				var oFromEnd = aAssocs.item(i).firstElementChild;
				var oToEnd = aAssocs.item(i).lastElementChild;
				if (oFromEnd.getAttribute("Type") === sNamespace + "." + sPrincipalEntityTypeName && oToEnd.getAttribute("Type") === sNamespace + "." +
					sDependentEntityTypeName) {
					var oAssoc = aAssocs.item(i);
					var sFromRoleName = oFromEnd.getAttribute("Role");
					var sToRoleName = oToEnd.getAttribute("Role");
					break;
				}
			}

			//Should be unnecessary as we are dealing with XML DOM here, but to prevent popping up as potential XSS vulnerability we encode the content put into the metadata xml
			sFromRoleName = jQuery.sap.encodeXML(sFromRoleName);
			sToRoleName = jQuery.sap.encodeXML(sToRoleName);

			return {
				oAssoc: oAssoc,
				sFromRoleName: sFromRoleName,
				sToRoleName: sToRoleName
			};
		},
			_getRefConstraint: function(document,
			sFromRoleName, aPrincipalEntityTypeFKPropertyNames,
			sToRoleName, aDependentEntityTypeKeyPropertyNames) {
			//dom operations necessary for constructing element
			//no guideline violation as the dom is just a mere xml and not a html
			/*eslint-disable sap-no-dom-insertion*/
			/*eslint-disable sap-browser-api-error*/
			/*eslint-disable sap-no-element-creation*/
			var oPrincipal = document.createElement("Principal");
			oPrincipal.setAttribute("Role", sFromRoleName);
			for (var i = 0; i < aPrincipalEntityTypeFKPropertyNames.length; i++) {
				var oPropertyRef = document.createElement("PropertyRef");
				oPropertyRef.setAttribute("Name", aPrincipalEntityTypeFKPropertyNames[i]);
				oPrincipal.appendChild(oPropertyRef);
			}
			var oDependent = document.createElement("Dependent");
			oDependent.setAttribute("Role", sToRoleName);
			for (i = 0; i < aDependentEntityTypeKeyPropertyNames.length; i++) {
				oPropertyRef = document.createElement("PropertyRef");
				oPropertyRef.setAttribute("Name", aDependentEntityTypeKeyPropertyNames[i]);
				oDependent.appendChild(oPropertyRef);
			}
			var oRefConstraint = document.createElement("ReferentialConstraint");
			/*eslint-enable sap-browser-api-error*/
			/*eslint-enable sap-no-element-creation*/
			oRefConstraint.appendChild(oPrincipal);
			oRefConstraint.appendChild(oDependent);
			/*eslint-enable sap-no-dom-insertion*/
			return oRefConstraint;
		}

	};

});