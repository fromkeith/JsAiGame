define(["ai/navigation", "world/map", "ai/agent", "ai/navigation", "entity/people"], function (aiNavigation, Map, Agent, navigation, people) {
	"use strict";
	return {
		loadMap : function () {
			var mapDetails, map, wallQuadTree, navQuadTree;
			mapDetails = {w: 1024, h: 1024, border: "wallSprite",
					walls : [
					{sp: "wallSprite", w: 400, h: 16,  x: 200, y: 200},
					{sp: "wallSprite", w: 16,  h: 302, x: 600, y: 0},
					{sp: "wallSprite", w: 400, h: 16,  x: 400, y: 600},
					{sp: "wallSprite", w: 16,  h: 400, x: 800, y: 400}
				]
				};
			map = new Map(mapDetails);
			wallQuadTree = map.objects;
			navQuadTree = map.nav;
			navigation.navTree = navQuadTree;
			navigation.obsticles = wallQuadTree;
		},
		init : function () {
			this.loadMap();
			Crafty.e("2D, Canvas, personSprite, Person, PlayerDirectional, UINotifer")
				.origin(16, 16)
				.attr({ w: 32, h: 32, x: 100, y: 100})
				.playerDirectional()
				.enableControl()
				.person("home")
				.bind("Moved", function (info) {
					Crafty.viewport.x = 400 - info.to.x;
					Crafty.viewport.y = 300 - info.to.y;
				});
			Crafty.viewport.x = 400 - 100;
			Crafty.viewport.y = 300 - 100;
			Crafty.e("2D, Canvas, badPersonSprite, Person, PathFollower, AI")//bad guy!
				.origin(16, 16)
				.person("bad")
				.attr({ w: 32, h: 32, x: 350, y: 100})
				.setController(new Agent());
			Crafty.e("PistolPickup")
				.attr({w: 16, h: 16, x: 300, y: 50});
			Crafty.e("MP5Pickup")
				.attr({w: 16, h: 16, x: 200, y: 50});

		}
	};
});