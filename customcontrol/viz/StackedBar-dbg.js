/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Control", "sap/suite/ui/microchart/StackedBarMicroChart"],
	function(Control, StackedBarMicroChart) {
		return StackedBarMicroChart.extend("i2d.qm.inspresults.records1.customcontrol.viz.StackedBar", {
			metadata: {
				properties: {
					"currentItems": {
						type: "object",
						defaultValue: []
					},
				}
			},

			renderer: {},
			onBeforeRendering: function() {
				var aBars = this.getBars();
				this.oResourceBundle = this.getModel("i18n").getResourceBundle();
				var oModel = this.getModel();
				var oContext = this.getBindingContext();
				var aChPrgsItems = this.getCurrentItems();
				if (!aChPrgsItems || !aChPrgsItems.length) {
					return;
				}

				var aChartArray = [];
				var sTooltip = this.oResourceBundle.getText("QM_FIELD_PROGRESS_OF_CHARACTERISTIC") + " ";

				var iSum = 0;
				for (var i = 0; i < aChPrgsItems.length; i++) {
					var oChPrgsItem = oModel.getProperty("/" + aChPrgsItems[i], oContext);
					aBars[i].setValueColor(oChPrgsItem.color);
					aBars[i].setValue(oChPrgsItem.count);
					iSum += oChPrgsItem.count;
					sTooltip += this.getCharProgressTooltip(oChPrgsItem.color, oChPrgsItem.count);
					aChartArray.push(oChPrgsItem);
				}
				this.setTooltip(sTooltip);
				this.setMaxValue(iSum);
				StackedBarMicroChart.prototype.onBeforeRendering.apply(this, arguments);
			},
			onAfterRendering: function() {
				var sTooltip = this.getTooltip();
				$("#" +this.getId()).attr("aria-label",sTooltip);
				StackedBarMicroChart.prototype.onAfterRendering.apply(this, arguments);
			},
			getCharProgressTooltip: function(colorKey, iCount) {
				var sTooltipItem;
				switch (colorKey) {
					case "Good":
						sTooltipItem = this.oResourceBundle.getText("QM_ACCEPTED") + ": " + iCount + "\n";
						break;
					case "Error":
						sTooltipItem = this.oResourceBundle.getText("QM_REJECTED") + ": " + iCount + "\n";
						break;
					default:
						sTooltipItem = this.oResourceBundle.getText("QM_RR_POPOVER_OPEN_CHAR") + ": " + iCount;
				}
				return sTooltipItem;
			}
		});
	});