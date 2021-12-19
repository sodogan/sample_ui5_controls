/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/m/ToggleButton"
], function(ToggleButton) {
	"use strict";
	return ToggleButton.extend("i2d.qm.inspresults.records1.customcontrol.ToggleButtonExt", {
		renderer: { 
		},
		setPressed: function(bPressed) {
			this.bPressed = !!bPressed;
			if(this.bPressed !== this.getPressed()) {
				this.setProperty("pressed", bPressed, true);
				this.$().attr("aria-pressed", bPressed);
			} 
			return this;			
		}, 
		_activeButton: function() {
			this._bActive = this.getEnabled();
			if(this._bActive) {
				if(this.getIcon() && this.getActiveIcon() && this._image) {
					this._image.setSrc(this.getActiveIcon());
				}
			}
		},
		_inactiveButton: function(oEvent) {
			this._bActive = false;
			if(this.getEnabled()) {
				if(this.getIcon() && this.getActiveIcon() && this._image) {
					this._image.setSrc(this.getIcon());
				}
			}
		},
		onAfterRendering: function(oEvent) { 
			var icon = this.getIcon();
			if(icon.indexOf('accept')!==-1 && this.getPressed()){
				this.$().children().first().removeClass('sapMBtnDefault');
				this.$().children().first().addClass('sapMBtnAccept');
			}
			if(icon.indexOf('decline')!==-1 && this.getPressed()){
				this.$().children().first().removeClass('sapMBtnDefault');
				this.$().children().first().addClass('sapMBtnReject');
			}			
			ToggleButton.prototype.onAfterRendering.apply(this, arguments);
		}
	});
});