define(["ai/ai", "ai/actions"], function (ai, aiActions) {
	"use strict";
	// Creates a state object that will return the list
	// of actions possible to transite a state
	function advancedState(actionList) {
		var advState = {
			edges : actionList,
			preStateResult : {}, // a map of 'var-bool' : 'list of states', where 'var-bool' is the pre state
			// givenState - the current state of the agent
			// return - a list of actions the agent can take from the current State
			getPreActionList : function (givenState) {
				var possibleActions = {}, // map of 'actionName' : 'action'
					keys = Object.keys(givenState),
					i,
					targetPre,
					resultKeys,
					actions = [],
					p,
					actionName,
					givenStateHash = ai.hashState(givenState),
					checkStateHash;
				for (i = 0; i < keys.length; i++) {
					targetPre = keys[i] + "-" + givenState[keys[i]];
					if (this.preStateResult[targetPre]) {
						for (p = 0; p < this.preStateResult[targetPre].length; p++) {
							actionName = this.preStateResult[targetPre][p].name;
							possibleActions[actionName] = this.preStateResult[targetPre][p];
						}
					}
				}
				resultKeys = Object.keys(possibleActions);
				for (i = 0; i < resultKeys.length; i++) {
					checkStateHash = ai.hashState(ai.toFullState(givenState, possibleActions[resultKeys[i]].preconditions));
					if (checkStateHash !== givenStateHash) {
						continue; // the precondition state + the given state must be the same
					}
					actions.push(possibleActions[resultKeys[i]]);
				}
				return actions;
			},
			init : function () {
				var keys, i, k, key, stateEdgeKey;
				for (i = 0; i < actionList.length; i++) {
					keys = Object.keys(actionList[i].preconditions);
					for (k = 0; k < keys.length; k++) {
						key = keys[k];
						stateEdgeKey = key + "-" + actionList[i].preconditions[key];
						if (!this.preStateResult[stateEdgeKey]) {
							this.preStateResult[stateEdgeKey] = [];
						}
						this.preStateResult[stateEdgeKey].push(actionList[i]);
					}
				}
			}
		};
		advState.init();
		return advState;
	}
	Crafty.c("AI", {
		controller : null,
		enterFrame : function () {
			if (!this.controller) {
				return;
			}
			this.controller.update(this);
			if (this._path && this._path.length > 0) {
				this.pp.poly(this._path);
			}
		},
		init : function () {
			this.bind("EnterFrame", this.enterFrame);
			this.pp = Crafty.e("PolyDrawer");
		},
		setController : function (controller) {
			this.controller = controller;
		}
	});

	return function () {
		var ag = {
			state: {haveTarget : false, haveAmmo : false, haveGun : false, isAlarmed : false, isHurt : false, isGuarding : false},
			targetState : {haveTarget : true, isAlarmed : true},
			actions : [aiActions.patrolAction, aiActions.idleAction, aiActions.pickupGunAction, aiActions.attackAction],
			curActions : [],
			advState : {},
			update : function (entity) {
				if (this.curActions.length === 0) {
					this.curActions = ai.agentAStar(this, this.targetState);
					if (this.curActions.length === 0) {
						return;
					}
				}
				if (this.curActions[this.curActions.length - 1].doAction(this, entity)) {
					this.curActions.pop();
				}
			},
			perceive : function (entity) {

			}
		};
		ag.advState = advancedState(ag.actions);
		return ag;
	};
});