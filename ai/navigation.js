define(["geom/geom", "geom/polygon", "geom/quadTree"], function (geometry, Polygon, QuadTree) {
	"use strict";

	function displayAroundCorner(finalPath, point, lp) {
		var edge, e, disp, j, iDist, eDist, swit, newPoints = [];
		// we need to order the points correctly
		for (e = 0; e < point.edges.length; e++) {
			edge = point.edges[e];
			if (edge.parents.length > 1) {
				if (point === edge.points[0]) {
					disp = edge.seg.line.direction.multiply(40);
				} else {
					disp = edge.seg.line.direction.multiply(-40);
				}
				newPoints.push({
					x : (point.x + disp.elements[0]),
					y : (point.y + disp.elements[1]),
					displaced : Sylvester.Line.Segment.create(
						[point.x, point.y],
						[point.x + disp.elements[0], point.y + disp.elements[1]]
					)
				});
			}
		}
		// order the points
		for (j = 0; j < newPoints.length; j++) {
			iDist =
				(newPoints[j].x - lp.x) * (newPoints[j].x - lp.x) +
				(newPoints[j].y - lp.y) * (newPoints[j].y - lp.y);
			for (e = 0; e < newPoints.length; e++) {
				if (e === j) {
					continue;
				}
				eDist =
					(newPoints[e].x - lp.x) * (newPoints[e].x - lp.x) +
					(newPoints[e].y - lp.y) * (newPoints[e].y - lp.y);
				if (eDist > iDist) {
					swit = newPoints[j];
					newPoints[j] = newPoints[e];
					newPoints[e] = swit;
				}
			}
		}
		// add the new points to the final path
		for (j = 0; j < newPoints.length; j++) {
			finalPath.push(newPoints[j]);
		}
	}
	function getColor(iteration) {
		switch (iteration) {
		case 0:
			return "#F00";
		case 1:
			return "#0F0";
		case 2:
			return "#00F";
		default:
			return "#FFF";
		}
	}
	function needsDisplacement(point) {
		var e, edge;
		if (!point.edges) {
			return false;
		}
		for (e = 0; e < point.edges.length; e++) {
			edge = point.edges[e];
			// means i share an edge with a wall
			if (edge.parents.length === 1) {
				return true;
			}
		}
		return false;
	}
	function displaceAllPoints(path) {
		var i, finalPath = [];
		finalPath.push(path[0]);
		for (i = 1; i < path.length - 1; i++) {
			if (needsDisplacement(path[i])) {
				displayAroundCorner(finalPath, path[i], finalPath[finalPath.length - 1]);
			} else {
				finalPath.push(path[i]);
			}
		}
		finalPath.push(path[path.length - 1]);
		return finalPath;
	}
	/**
	 * Smooths the path, given the set of obsticles.
	 */
	function smoothNavigation(obsticles, path, iterations) {
		var finalPath = [path[0]], i, ray, ob, edge, lp;
		//Crafty.e("PolyDrawer").poly(path.concat([]), getColor(iterations));
		for (i = 1; i < path.length; i++) {
			lp = finalPath[finalPath.length - 1];
			ray = Sylvester.Line.Segment.create([lp.x, lp.y], [path[i].x, path[i].y]);
			ob = obsticles.ray(ray);
			// if there is an obstical, we need to use the previous point
			if (ob.length !== 0) {
				finalPath.push(path[i - 1]);
			} else if (path[i - 1].displaced) {
				// if the previous point was displaced, we need to make sure this line won't get too close
				// to the wall
				if (ray.intersects(path[i - 1].displaced) || path[i - 1].displaced.intersects(ray)) {
					finalPath.push(path[i - 1]);
				}
			}
		}
		finalPath.push(path[path.length - 1]);
		if (iterations > 0 && finalPath.length !== path.length) {
			return smoothNavigation(obsticles, finalPath, iterations - 1);
		}
		return finalPath;
	}
	function tuneNavigation(obsticles, path, iterations) {
		//Crafty.e("PolyDrawer").poly(path.concat([]), getColor(iterations + 1));
		return smoothNavigation(obsticles, displaceAllPoints(path), iterations);
	}

	return {
		navTree : null,
		obsticles : null,

		hashPoint : function (point) {
			return "x:" + point.x + "y:" + point.y;
		},

		reconstruct : function (cameFrom, currentNode) {
			if (cameFrom[this.hashPoint(currentNode)]) {
				return [currentNode].concat(this.reconstruct(cameFrom, cameFrom[this.hashPoint(currentNode)]));
			}
			return currentNode;
		},

		navigateScore : function (curNode, to) {
			return Math.sqrt(Math.pow((curNode.x - to.x), 2) + Math.pow((curNode.y - to.y), 2));
		},

		/**
		 * Finds and returns a route from entity to to
		 */
		navigate : function (entity, to) {
			var nodesVisited = [],
				nodesToEvaluate = {},
				cameFrom = {},
				gScore = {},
				hScore = {},
				fScore = {},
				findStartNode,
				findEndNode,
				endParent,
				startParent,
				curPoint,
				curPointHash,
				keys,
				i,
				otherHash,
				sharedPoints,
				neighbour,
				neighbourHash,
				useTentative,
				localGScore;

			findStartNode = this.navTree.find({x : entity.x, y : entity.y});
			if (findStartNode.length === 0) {
				return;
			}
			findEndNode = this.navTree.find({x : to.x, y : to.y});
			if (findEndNode.length === 0) {
				return;
			}
			endParent = findEndNode[0];
			startParent = findStartNode[0];
			curPoint = {x : entity.x, y : entity.y, parents : [startParent]};
			curPointHash = this.hashPoint(curPoint);
			nodesToEvaluate[curPointHash] = curPoint;
			gScore[curPointHash] = 0;
			hScore[curPointHash] = this.navigateScore(curPoint, to);
			fScore[curPointHash] = gScore[curPointHash] + hScore[curPointHash];

			while (Object.keys(nodesToEvaluate).length > 0) {
				// todo optimize
				keys = Object.keys(nodesToEvaluate);
				curPointHash = keys[0];
				curPoint = nodesToEvaluate[curPointHash];
				for (i = 1; i < keys.length; i++) {
					otherHash = keys[i];
					if (fScore[otherHash] < fScore[curPointHash]) {
						curPoint = nodesToEvaluate[otherHash];
						curPointHash = otherHash;
					}
				}
				if (endParent.contains(curPoint)) {
					// reconstruct path
					if (cameFrom[curPointHash]) {
						return tuneNavigation(this.obsticles,
							[to, curPoint].concat(this.reconstruct(cameFrom, cameFrom[curPointHash])), 2);
					} else {
						return [to, curPoint];
					}
				}
				// remove curPoint from nodesToEvaluate
				delete nodesToEvaluate[curPointHash];
				nodesVisited.push(curPointHash);
				// go over the shared points

				sharedPoints = [];
				for (i = 0; i < curPoint.parents.length; i++) {
					sharedPoints = sharedPoints.concat(curPoint.parents[i].points);
				}
				for (i = 0; i < sharedPoints.length; i++) {
					neighbour = sharedPoints[i];
					neighbourHash = this.hashPoint(neighbour);
					if (nodesVisited.indexOf(neighbourHash) >= 0) {
						continue;
					}
					useTentative = false;
					localGScore = gScore[curPointHash] + this.navigateScore(curPoint, neighbour);
					if (!(nodesToEvaluate.hasOwnProperty(neighbourHash))) {
						nodesToEvaluate[neighbourHash] = neighbour;
						hScore[neighbourHash] = this.navigateScore(neighbour, to);
						useTentative = true;
					} else if (localGScore < gScore[neighbourHash]) {
						useTentative = true;
					}
					if (useTentative) {
						cameFrom[neighbourHash] = curPoint;
						gScore[neighbourHash] = localGScore;
						fScore[neighbourHash] = localGScore + hScore[neighbourHash];
					}
				}
			}
			return [];
		}
	};
});