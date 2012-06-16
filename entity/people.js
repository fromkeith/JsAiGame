define([], function () {
	"use strict";
	Crafty.c("PlayerDirectional", {
		_angle : 0,
		_speed : 5,
		_keysDown : {},
		_keys : {},
		_mouse : {x : 0, y : 0},
		_keydown : function (e) {
			if (this._keys[e.key]) {
				this._keysDown[e.key] = this._keys[e.key];
			}
			if (' '.charCodeAt(0) === e.key) {
				this.fire(this.x, this.y, this._angle);
			}
		},
		_keyup : function (e) {
			if (this._keysDown[e.key]) {
				delete this._keysDown[e.key];
			}
			if (this._subkeyup) {
				this._subkeyup(e);
			}
		},
		_enterFrame : function () {
			var deltaX = 0,
				deltaY = 0,
				newX = 0,
				newY = 0,
				key,
				oldX,
				oldY,
				dx;
			for (key in this._keysDown) {
				if (this._keys.hasOwnProperty(key)) {
					deltaX += this._keys[key][0] * this._speed;//this._keys[key][1] * this._speed * Math.cos(this._angle + Math.PI/2 * this._keys[key][0]);
					deltaY += this._keys[key][1] * this._speed;//this._keys[key][1] * this._speed * Math.sin(this._angle + Math.PI/2 * this._keys[key][0]);
				}
			}
			if (deltaX !== 0 || deltaY !== 0) {
				oldX = this.x;
				oldY = this.y;
				newX = this.x + deltaX;
				newY = this.y + deltaY;
				this.attr({x : newX, y : newY});
				this.trigger("Moved", {"from" : {"x" : oldX, "y" : oldY}, "to": {"x" : newX, "y" : newY}});

			}
			dx = this._mouse.x - (this.x + this._origin.x);
			this._angle = Math.atan((this._mouse.y - (this.y + this._origin.y)) / dx);
			if (dx < 0) {
				this._angle -= Math.PI;
			}
			//this.rotation = (this._angle * 180 / Math.PI) + 90;
		},
		_mouseOver : function (e) {
			this._mouse.x = -Crafty.viewport.x + e.x;
			this._mouse.y = -Crafty.viewport.y + e.y;
		},
		init : function () {
			this.requires("Person");
			this._keys['W'.charCodeAt(0)] = [0, -1];
			this._keys['S'.charCodeAt(0)] = [0, 1];
			this._keys['A'.charCodeAt(0)] = [-1, 0];
			this._keys['D'.charCodeAt(0)] = [1, 0];
		},
		playerDirectional : function () {
			// nothing for now
			this.bind("EnterFrame", this._enterFrame);
			return this;
		},
		enableControl: function () {
			this.bind("KeyDown", this._keydown);
			this.bind("KeyUp", this._keyup);
			Crafty.addEvent(this, Crafty.stage.elem, "mousemove", this._mouseOver);
			return this;
		},
		disableControl: function () {
			this.unbind("KeyDown", this._keydown);
			this.unbind("KeyUp", this._keyup);
			Crafty.removeEvent(this, Crafty.stage.elem, "mousemove", this._mouseOver);
			return this;
		}
	});


	Crafty.c("Person", {
		_health : 100,
		_team : null,
		_equipedWeapon : null,
		_weapons : [],
		_moved : function (info) {
			if (this.hit("wall")) {
				this.attr({x : info.from.x, y : info.from.y});
			}
		},
		_shot : function (info) {
			var i;
			for (i = 0; i < info.length; i++) {
				if (info[i].obj._team !== this._team || this._team === null) {
					this._health -= info[i].obj._damage;
					info[i].obj._destroy();
				}

			}
			if (this._health < 0) {
				this.destroy();
			}
		},
		init : function () {
			this.requires("Collision");
			this.bind("Moved", this._moved);
			this.onHit("Bullet", this._shot);
		},
		person : function (team) {
			this._team = team;
			return this;
		},
		giveWeapon : function (giveGun) {
			if (this.giveAmmo(giveGun)) {
				return true;
			}
			this._weapons.push(Crafty.e(giveGun.forWeaponCrafty));
			this.giveAmmo(giveGun);
			if (this._weapons.length === 1) {
				this.equip(this._weapons[0]);
			}
			return true;
		},
		giveAmmo : function (giveAmmo) {
			var i, weapon;
			for (i = 0; i < this._weapons.length; i++) {
				weapon = this._weapons[i];
				if (weapon.cleanName === giveAmmo.forWeapon || giveAmmo.forWeapon === null) {
					weapon.addAmmo(giveAmmo.amount);
					return true;
				}
			}
			return false;
		},
		equip : function (weapon) {
			this._equipedWeapon = weapon;
			if (this._equipedWeapon !== null) {
				this._equipedWeapon.equip(this._team);
			}
			this.trigger("Equip", weapon);
			return this;
		},
		fire : function (x, y, angle) {
			var ammoLeft;
			if (this._equipedWeapon !== null) {
				ammoLeft = this._equipedWeapon.fire(x, y, angle);
				this.trigger("AmmoLeft", ammoLeft);
			}
			return this;
		}
	});

	Crafty.c("PathFollower", {
		_xspeed : 0,
		_yspeed : 0,
		_maxSpeed : 2,
		_path : [],
		enterFrame : function () {
			var oldX, oldY, end;
			if (this._path.length === 0) {
				return;
			}
			oldX = this.x;
			oldY = this.y;
			this.x += this._xspeed;
			this.y += this._yspeed;
			this.trigger("Moved", {"from" : {"x" : oldX, "y" : oldY}, "to" : {"x" : this.x, "y" : this.y}});

			if (this._closeEnoughToPoint()) {
				end = this._path.length - 1;
				this._path.pop();
				this._nextPoint();
			}
		},
		_closeEnoughToPoint : function () {
			var end = this._path.length - 1;
			return Math.abs(this._path[end].x - this.x - this.w / 2) < this.w / 4
				&&
				Math.abs(this._path[end].y - this.y - this.h / 2) < this.h / 4;
		},
		_nextPoint : function () {
			var end = this._path.length - 1,
				unitVector;
			if (end < 0) {
				return;
			}
			unitVector = $V([this._path[end].x - this.x - this.w / 2, this._path[end].y - this.y - this.h / 2]).toUnitVector();
			this._xspeed = unitVector.elements[0] * this._maxSpeed;
			this._yspeed = unitVector.elements[1] * this._maxSpeed;
		},
		init : function () {
			this.bind("EnterFrame", this.enterFrame);
		},
		givePath : function (path) {
			this._path = path;
			if (this._path) {
				this._nextPoint();
			}
			if (this.poly) {
				this.poly(path);
			}
		},
		hasPath : function () {
			return this._path && this._path.length !== 0;
		}
	});
	Crafty.c("PolyDrawer", {
		ready : false,//required otherwise draw will never occur
		_color : "#8ED6FF",
		_fill : false,
		polygon : [],
		_draw : function (e) {
			var ctx, i;
			if (this.polygon.length === 0) {
				return;
			}
			ctx = e.ctx;
			ctx.save();
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.fillStyle = this._color;
			ctx.strokeStyle = this._color;
			ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
			for (i = 1; i < this.polygon.length; i++) {
				ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
				if (!this._fill) {
					ctx.moveTo(this.polygon[i].x, this.polygon[i].y);
				}
			}
			if (!this._fill) {
				//ctx.lineTo(this.polygon[0].x, this.polygon[0].y);
				ctx.stroke();
			} else {
				ctx.closePath();
				ctx.fill();
			}
			ctx.beginPath();
			for (i = 0; i < this.polygon.length; i++) {
				ctx.arc(this.polygon[i].x, this.polygon[i].y, 2, 0, 2 * Math.PI, false);
			}
			ctx.fillStyle = this._color;
			ctx.fill();
			ctx.restore();
		},
		init : function () {
			this.requires("2D, Canvas");
			this.bind("Draw", this._draw).bind("RemoveComponent", function (id) {
				if (id === "PolyDrawer") {
					this.unbind("Draw", this._draw);
				}
			});
		},
		poly : function (poly, c) {
			var maxX, maxY, i;
			if (c) {
				this._color = c;
			}
			this.polygon = poly;
			maxX = this.polygon[0].x;
			maxY = this.polygon[0].y;
			for (i = 1; i < this.polygon.length; i++) {
				if (this.polygon[i].x > maxX) {
					maxX = this.polygon[i].x;
				}
				if (this.polygon[i].y > maxY) {
					maxY = this.polygon[i].y;
				}
			}
			this.attr({x : 0, y : 0, w : maxX, h : maxY});
			this.ready = true;
			this.trigger("Change");
			return this;
		}
	});
});