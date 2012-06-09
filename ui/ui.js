define([], function () {
	"use strict";
	return {
		craftUI : function () {
			Crafty.c("UINotifer", {
				_ui_equip : function (gun) {
					if (gun !== null) {
						Crafty.trigger("EquipText", gun.cleanName);
					} else {
						Crafty.trigger("EquipText", "");
					}
				},
				_ui_ammo_left : function (ammoLeft) {
					Crafty.trigger("AmmoLeftText", ammoLeft);
				},
				init : function () {
					this.bind("Equip", this._ui_equip);
					this.bind("AmmoLeft", this._ui_ammo_left);
				}
			});

			Crafty.c("UI", {
				_equip : function (gun) {
					document.getElementById("gun").innerHTML = gun;
				},
				_ammo : function (ammo) {
					document.getElementById("ammo").innerHTML = ammo;
				},
				init : function () {
					this.bind("EquipText", this._equip);
					this.bind("AmmoLeftText", this._ammo);
				}
			});
		}
	};
});