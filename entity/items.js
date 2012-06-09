define([], function () {
	"use strict";
	return {
		craftGuns : function () {
			// Guns
			Crafty.c("Pistol", {
				cleanName : "Pistol",
				init : function () {
					this.requires("BulletProducer");
				},
				equip : function (team) {
					this.bulletProducer(team, {
						maxBullets : 20,
						coolDown : 200,
						burst : 1,
						burstTime : 0,
						jitter : 0.5,
						jitterProb : 0.4,
						damage : 2,
						speed : 10
					});
				}
			});
			Crafty.c("MP5", {
				cleanName : "MP5",
				init : function () {
					this.requires("BulletProducer");
				},
				equip : function (team) {
					this.bulletProducer(team, {
						maxBullets : 30,
						coolDown : 300,
						burst : 3,
						burstTime : 100,
						jitter : 0.8,
						jitterProb : 0.7,
						damage : 4,
						speed : 20
					});
				}
			});
			Crafty.c("BulletProducer", {
				_bullets : [],
				_lastFire : 0,
				_bulletIndex : 0,
				ammo : 20,
				_FireProperties: {
					maxBullets : 20,
					cooldown : 500,
					burst : 3,
					burstTime : 100,
					jitter : 0.4,
					jitterProb : 1,
					damage : 5,
					speed : 10,
					init : function (options) {
						var key;
						for (key in options) {
							if (options.hasOwnProperty(key)) {
								this[key] = options[key];
							}
						}
					},
					particleEffects : {
						"destroy" : {duration : 10}
					}
				},
				addAmmo : function (newAmount) {
					this.ammo += newAmount;
				},
				init : function () {
					this._FireProperties = Crafty.clone(this._FireProperties);
					this.visible = false;
				},
				bulletProducer : function (team, options) {
					this._team = team;
					this._FireProperties.init(options);
					return this;
				},
				fire : function (x, y, angle) {
					var i, bullet, fireAngle;
					if (this.ammo <= 0) {
						return this.ammo;
					}
					if (this._FireProperties.cooldown > 0) {
						if (Date.now() - this._lastFire < this._FireProperties.cooldown) {
							return this.ammo; // can't fire now
						}
						this._lastFire = Date.now();
					}
					for (i = 0; i < this._FireProperties.burst && this.ammo > 0; i++, this.ammo--) {
						if (this._bullets.length < this._FireProperties.maxBullets) {
							bullet = Crafty.e("Bullet, bulletSprite")
								.attr({w: 10, h: 10, x: this.x, y: this.y, visible: false})
								.bullet(this._team, this._FireProperties.damage, this._FireProperties.particleEffects);
							this._bullets.push(bullet);
						}
						bullet = this._bullets[this._bulletIndex];
						this._bulletIndex = (this._bulletIndex + 1) % this._FireProperties.maxBullets;
						fireAngle = angle + this._FireProperties.jitter * (Math.random() - 0.5) * (Math.random() < this._FireProperties.jitterProb ? Math.random() : 0);
						setTimeout(this._fireFunc(bullet, x, y, fireAngle, this._FireProperties.speed), i * this._FireProperties.burstTime);
					}
					return this.ammo;
				},
				_fireFunc : function (bullet, x, y, fireAngle, speed) {
					return function () {
						bullet.fire(x, y, fireAngle, speed);
					};
				}
			});
			Crafty.c("Bullet", {
				_damage : 0,
				_team : null,
				_angle : 0,
				_speed : 0,
				_effects : 0,
				_active : false,
				_destroyParticle : null,
				_enterFrame : function () {
					this.x = this.x + this._speed * Math.cos(this._angle);
					this.y = this.y + this._speed * Math.sin(this._angle);
				},
				_destroy : function () {
					if (this._active === false) {
						return;
					}
					this._active = false;
					this.unbind("EnterFrame", this._enterFrame);
					if (this._effects.destroy) {
						if (this._destroyParticle !== null) {
							this._destroyParticle.destroy();
						}

						this._destroyParticle =
							Crafty.e("2D, Canvas, particles")
							.attr({x: this.x, y: this.y})
							.particles({lifeSpan: 20, fastMode: true, size: 10, sizeRandom: 5, maxParticles: 10, duration: 5});

					}
					this.x = -100;
					this.y = -100;
					this.visible = false;
				},
				init : function () {
					this.requires("2D, Canvas, Collision");
					this.onHit("wall", this._destroy);
				},
				fire : function (x, y, angle, speed) {
					this.x = x;
					this.y = y;
					this.visible = true;
					this._angle = angle;
					this._speed = speed;
					this._active = true;
					this.rotation = this._angle * 180 / Math.PI;
					this.unbind("EnterFrame", this._enterFrame);
					this.bind("EnterFrame", this._enterFrame);
					return this;
				},
				bullet : function (team, damage, effects) {
					this._team = team;
					this._damage = damage;
					this._effects = effects;
					return this;
				}
			});

		},

		craftPickups : function () {
			Crafty.c("PistolPickup", {
				forWeapon : "Pistol",
				forWeaponCrafty : "Pistol",
				amount : 45,
				init : function () {
					this.requires("WeaponPickup, pistol");
				}
			});
			Crafty.c("MP5Pickup", {
				forWeapon : "MP5",
				forWeaponCrafty : "MP5",
				amount : 80,
				init : function () {
					this.requires("WeaponPickup, uzi");
				}
			});

			Crafty.c("WeaponPickup", {
				//forWeapon : "",
				//forWeaponCrafty : "",
				//amount : 40,
				pickup : function (collInfo) {
					var j, person;
					for (j = 0; j < collInfo.length; j++) {
						person = collInfo[j].obj;
						if (person.giveWeapon(this)) {
							this.destroy();
							return;
						}
					}
				},
				init : function () {
					this.requires("2D, Canvas, Collision");
					this.onHit("Person", this.pickup);
				}
			});

		}
	};
});