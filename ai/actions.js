define(["ai/navigation"], function (aiNavigation) {
	"use strict";
	//!!!!!
	// None of these objects are meant to retain state. Use 'agent' for that!
	//!!!!!
	return {
		patrolAction : {
			preconditions : {isAlarmed : false, haveTarget : false, haveGun : true, haveAmmo : true},
			postconditions : {isAlarmed : true, haveTarget : true},
			calcCost : function () { return 2; },
			doAction : function (agent, entity) {
				if (!entity.hasPath()) {
					this._findPatrolPath(entity);
				}
				// todo: invalidate the state!
				return false;
			},
			name : "patrolAction",
			_findPatrolPath : function (entity) {
				var path, end;
				end = {x : Math.random() * 1020, y : Math.random() * 1020};
				path = aiNavigation.navigate(entity, end);
				console.log(end.x + " " + end.y);
				if (path) {
					entity.givePath(path);
				}
			}
		},
		idleAction : {
			preconditions : {haveTarget : false, isAlarmed : false},
			postconditions : {},
			calcCost : function () { return 10; },
			doAction : function (agent, entity) { return true; },
			name : "idleAction"
		},
		pickupGunAction : {
			preconditions : {haveAmmo : false},
			postconditions : {haveGun : true, haveAmmo : true},
			calcCost : function () { return 2; },
			doAction : function (agent, entity) { return true; },
			name : "pickupGunAction"
		},
		attackAction : {
			preconditions : {isAlarmed : true, haveGun : true, haveAmmo : true, haveTarget : true},
			postconditions : {haveTarget : false},
			calcCost : function () { return 1; },
			doAction : function (agent, entity) { return true; },
			name : "attackAction"
		}
	};
});