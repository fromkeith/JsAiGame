define(["require", "entity/items", "ui/ui", "level/level1"], function (require, items, ui) {
	"use strict";
	/**
	 * @author Keith
	 */
	window.onload = function () {
		var lvl1 = require("level/level1");
		Crafty.init(800, 600);
		Crafty.canvas.init(800, 600);
		Crafty.scene("main", function () {
			Crafty.background("#000");

			items.craftPickups();
			items.craftGuns();
			ui.craftUI();

			Crafty.sprite(17, "MeteorRepository1Icons_0-16x16.png", {
				personSprite : [5, 8],
				wallSprite: {tile : [2, 2], repeat : true},
				badPersonSprite: [9, 8],
				pistol : [0, 3],
				magnum : [1, 3],
				uzi : [2, 3],
				shotgun : [3, 3],
				ak47 : [4, 3],
				rpg : [5, 3],
				health : [6, 0]

			});
			Crafty.sprite(12, "MeteorRepository1Icons_0-12x12.png", {
				bulletSprite : [6, 2]
			});
			Crafty.e("UI");

			lvl1.init();

		});
		Crafty.scene("main");

	};
});