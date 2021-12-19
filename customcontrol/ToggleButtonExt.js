/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/m/ToggleButton"],function(T){"use strict";return T.extend("i2d.qm.inspresults.records1.customcontrol.ToggleButtonExt",{renderer:{},setPressed:function(p){this.bPressed=!!p;if(this.bPressed!==this.getPressed()){this.setProperty("pressed",p,true);this.$().attr("aria-pressed",p);}return this;},_activeButton:function(){this._bActive=this.getEnabled();if(this._bActive){if(this.getIcon()&&this.getActiveIcon()&&this._image){this._image.setSrc(this.getActiveIcon());}}},_inactiveButton:function(e){this._bActive=false;if(this.getEnabled()){if(this.getIcon()&&this.getActiveIcon()&&this._image){this._image.setSrc(this.getIcon());}}},onAfterRendering:function(e){var i=this.getIcon();if(i.indexOf('accept')!==-1&&this.getPressed()){this.$().children().first().removeClass('sapMBtnDefault');this.$().children().first().addClass('sapMBtnAccept');}if(i.indexOf('decline')!==-1&&this.getPressed()){this.$().children().first().removeClass('sapMBtnDefault');this.$().children().first().addClass('sapMBtnReject');}T.prototype.onAfterRendering.apply(this,arguments);}});});
