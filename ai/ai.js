define(["ai/navigation"], function (aiNavigation) {
	"use strict";
	return {
		/*
		 * World State:
		 *
		 * haveTarget
		 * haveAmmo
		 * haveGun
		 * isAlarmed
		 * isHurt
		 * isGuarding
		 *
		 * Need to update hashState & toFullState when this changes!
		 */

		hashState : function (state) {
			return "tagahg" +
				state.haveTarget  +
				state.haveAmmo +
				state.haveGun +
				state.isAlarmed +
				state.isHurt +
				state.isGuarding;
		},

		ifNotDefined : function (obj, key, def) {
			if (obj === undefined) { return def[key]; }
			if (obj[key] === undefined) { return def[key]; }
			return obj[key];
		},

		toFullState : function (base, changes) {
			return {
				haveTarget : this.ifNotDefined(changes, "haveTarget", base),
				haveAmmo : this.ifNotDefined(changes, "haveAmmo", base),
				haveGun : this.ifNotDefined(changes, "haveGun", base),
				isAlarmed : this.ifNotDefined(changes, "isAlarmed", base),
				isHurt : this.ifNotDefined(changes, "isHurt", base),
				isGuarding : this.ifNotDefined(changes, "isGuarding", base)
			};
		},

		// the estimation of how close these two states are
		hTransitionCost : function (curState, targetState) {
			var delta = 0, keys, i;
			keys = Object.keys(curState);
			for (i = 0; i < keys.length; i++) {
				if (curState[keys[i]] !== targetState[keys[i]]) {
					delta *= 2;
				}
			}
			return delta;
		},

		// the cost to travel from 'curState', to 'targetState', using 'action'
		stateTransitionScore : function (curState, targetState, action) {
			return this.hTransitionCost(curState, targetState) + action.calcCost();
		},

		reconstructAgent : function (cameFrom, stateActionPair) {
			var hashedState = this.hashState(stateActionPair.prev);
			if (cameFrom[hashedState]) {
				return [stateActionPair.edge].concat(this.reconstructAgent(cameFrom, cameFrom[hashedState]));
			}
			return [stateActionPair.edge];
		},

		/**
		 *
		 * Each node is a state.
		 * Each action is an edge.
		 */
		agentAStar : function (agent, targetState) {
			var statesVisited = [],
				statesToEvaluate = {},
				cameFrom = {},
				gScore = {},
				hScore = {},
				fScore = {},
				curStateHash = this.hashState(agent.state),
				curState = agent.state,
				endStateHash = this.hashState(this.toFullState(agent.state, targetState)),
				keys,
				i,
				otherHash,
				availableActions,
				neighbour,
				neighbourHash,
				useTentative,
				localGScore;

			statesToEvaluate[curStateHash] = curState;
			gScore[curStateHash] = 0;
			hScore[curStateHash] = this.hTransitionCost(curState, this.toFullState(curState, targetState));
			fScore[curStateHash] = gScore[curStateHash] + hScore[curStateHash];

			while (Object.keys(statesToEvaluate).length > 0) {
				// todo optimize
				keys = Object.keys(statesToEvaluate);
				curStateHash = keys[0];
				curState = statesToEvaluate[curStateHash];
				for (i = 1; i < keys.length; i++) {
					otherHash = keys[i];
					if (fScore[otherHash] < fScore[curStateHash]) {
						curState = statesToEvaluate[otherHash];
						curStateHash = otherHash;
					}
				}
				endStateHash = this.hashState(this.toFullState(curState, targetState));
				if (endStateHash === curStateHash) {
					if (cameFrom[curStateHash]) {
						// reconstruct path
						return this.reconstructAgent(cameFrom, cameFrom[curStateHash]);
					}
					return [];
				}
				// remove curState from statesToEvaluate
				delete statesToEvaluate[curStateHash];
				statesVisited.push(curStateHash);
				// go over the shared points

				availableActions = agent.advState.getPreActionList(curState);
				for (i = 0; i < availableActions.length; i++) {
					neighbour = this.toFullState(curState, availableActions[i].postconditions);
					neighbourHash = this.hashState(neighbour);
					if (statesVisited.indexOf(neighbourHash) >= 0) { // maybe need tweaking here
						continue;
					}
					useTentative = false;
					localGScore = gScore[curStateHash] + this.stateTransitionScore(curState, neighbour, availableActions[i]);
					if (!(statesToEvaluate.hasOwnProperty(neighbourHash))) {
						statesToEvaluate[neighbourHash] = neighbour;
						hScore[neighbourHash] = this.hTransitionCost(neighbour, this.toFullState(neighbour, targetState));
						useTentative = true;
					} else if (localGScore < gScore[neighbourHash]) {
						useTentative = true;
					}
					if (useTentative) {
						cameFrom[neighbourHash] = {prev : curState, edge : availableActions[i]};
						gScore[neighbourHash] = localGScore;
						fScore[neighbourHash] = localGScore + hScore[neighbourHash];
					}
				}
			}
			return [];
		}
	};
});
