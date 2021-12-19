/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
/*
 * This customized controller is used to display column Progress of Characteristics in worklist page. 
 * There are three kinds of characteristics. Accepted(green color), Rejected(red color) and Open(grey color). 
 */
sap.ui.define(["sap/ui/core/Control", "sap/ui/thirdparty/d3"],
	function(Control, d3) {
		return Control.extend("i2d.qm.inspresults.records1.customcontrol.viz.Comparison", {
			metadata: {
				properties: {
					"data": {
						type: "object",
						bindable: "bindable",
						group: "Data",
						defaultValue: null
					},
					"height": {
						type: "sap.ui.core.CSSSize",
						group: "Misc",
						defaultValue: "50"
					},
					"showLabel": {
						type: "boolean",
						defaultValue: true
					}
				}
			},

			renderer: function(rm, ctrl) {
				rm.write("<div tabindex=\"0\" ");
				rm.writeControlData(ctrl);
				rm.write(">");
				rm.write("</div>");
			},

			onAfterRendering: function() {
				this.height = parseInt(this.getHeight(), 10);
				//register resize handler
				sap.ui.core.ResizeHandler.register(this, this.handleOnResize);
				this.oResourceBundle = this.getModel("i18n").getResourceBundle();
				var oControlDomRef = $("#" + this.getId());

				var clientRect = oControlDomRef[0].getBoundingClientRect();
				this.drawGraph(clientRect.width, this.height);
			},

			handleOnResize: function() {
				var oControl = $("#" + this.oControl.getId());
				//clear content before redrawing on resizing
				oControl.html("");
				this.oControl.drawGraph(this.iWidth, this.oControl.height);
			},

			/**
			 * Set colors for different key. 
			 * @param  {String} colorKey
			 * @return {String} color
			 */
			getColorCode: function(colorKey) {
				var oColorCode;
				switch (colorKey) {
					case "Good":
						oColorCode = "#61A656";
						break;
					case "Error":
						oColorCode = "#D32030";
						break;
					default:
						oColorCode = "#848f94";
				}
				return oColorCode;
			},

			/**
			 * get tool tips, including type and related count. 
			 * @param  {String} colorKey
			 * @return {String} color
			 */
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
			},

			drawGraph: function(w, h) {
				var oModel = this.getModel();
				var oContext = this.getBindingContext();
				var aChPrgsItems = oModel.getProperty("ChPrgsItems", oContext);
				if (aChPrgsItems === undefined) {
					aChPrgsItems = oModel.getProperty("ChPrgsItemsByOp", oContext);
				}
				if (aChPrgsItems === undefined) {
					aChPrgsItems = oModel.getProperty("ChPrgsItemsByMs", oContext);
				}
				if (aChPrgsItems === undefined) {
					aChPrgsItems = oModel.getProperty("MastCharPgItem", oContext);
				}
				if (!aChPrgsItems) {
					return;
				}
				var aChartArray = [];

				var sTooltips = this.oResourceBundle.getText("QM_FIELD_PROGRESS_OF_CHARACTERISTIC") + " ";
				for (var i = 0; i < aChPrgsItems.length; i++) {
					var oChPrgsItem = oModel.getProperty("/" + aChPrgsItems[i], oContext);
					var objArray = [];
					var objItem = {};
					objItem.color = this.getColorCode(oChPrgsItem.color);
					sTooltips += this.getCharProgressTooltip(oChPrgsItem.color, oChPrgsItem.count);
					objItem.y = parseInt(oChPrgsItem.value, 10);
					objArray.push(objItem);
					aChartArray.push(objArray);
				}
				$("#" + this.getId()).attr("title", sTooltips);
				var dataset = aChartArray;
				//Set up stack method
				var stack = d3.layout.stack();
				//Data, stacked
				stack(dataset);
				//Set up scales
				var xScale = d3.scale.linear()
					.domain([0, d3.max(dataset, function(d) {
						return d3.max(d, function(d) {
							return d.y0 + d.y;
						});
					})])
					.range([0, w]);
				//Set up scales
				var svgHeight = h;
				if (this.getShowLabel()) {
					svgHeight = h + 20; //20px for labels
				}
				//Create SVG element
				var svg = d3.select("#" + this.getId())
					.append("svg")
					.attr("width", w)
					.attr("focusable", false)
					.attr("height", svgHeight);
				// Add a group for each row of data
				var groups = svg.selectAll("g")
					.data(dataset)
					.enter()
					.append("g")
					.style("fill", function(d, i) {
						for (var i = 0; i < d.length; i++) {
							return d[i].color;
						}
					});
				// Add a rect for each data value
				groups.selectAll("rect")
					.data(function(d) {
						return d;
					})
					.enter()
					.append("rect")
					.attr("x", function(d) {
						return xScale(d.y0);
					})
					.attr("y", 0)
					.attr("height", h)
					.attr("width", function(d) {
						if (d.y !== 0) {
							d.width = xScale(d.y - 1);
							return d.width;
						} else {
							d.width = xScale(d.y);
							return d.width;
						}
					});

				if (h === 15) {
					groups.selectAll("text")
						.data(function(d) {
							return d;
						}).enter()
						.append("text")
						.attr("fill", "white")
						.attr("class", "rangeLabel")
						.attr("x", function(d) {
							//16px for two characters, hence 8 px is identified as margin left to make text visible near to center  
							return xScale(d.y0) + xScale(d.y) / 2 - 8;
						}).attr("y", parseInt(this.getHeight()) / 2 + 4)
						.text(function(d) {
							//20px is min width required to display bar label like '250'
							if (d.width > 20) {
								return "";
							} else {
								return "";
							}
						});
				} else {
					groups.selectAll("text")
						.data(function(d) {
							return d;
						}).enter()
						.append("text")
						.attr("fill", "white")
						.attr("class", "rangeLabel")
						.attr("x", function(d) {
							//16px for two characters, hence 8 px is identified as margin left to make text visible near to center  
							return xScale(d.y0) + xScale(d.y) / 2 - 8;
						}).attr("y", parseInt(this.getHeight(), 10) / 2 + 7)
						.text(function(d) {
							//20px is min width required to display bar label like '250'
							if (d.width > 20) {
								return "";
							} else {
								return "";
							}
						});
				}

				if (this.getShowLabel()) {
					groups.selectAll("g")
						.data(function(d) {
							return d;
						}).enter()
						.append("text")
						.attr("class", "xLabel")
						.attr("x", function(d) {
							return xScale(d.y0);
						}).attr("y", $.proxy(function(d) {
							//add 15px extra to display label below bar
							if (this.getShowLabel()) {
								return this.height + 15;
							}
							return this.height;
						}, this))
						.text(function(d) {
							//68px is min width required to display label like '02 oct 2014'
							if (d.xLabel && d.width > 68) {
								return d.xLabel;
							} else {
								return "";
							}
						});
				}

			}
		});
	});