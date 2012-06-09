define(["require", "geom/aabb"], function (require, AABB) {
	"use strict";
	// alows us to use the 'new' when creating a Polygon
	return function (points, generateEdges) {
		var finalPoly = {
			renderable : null,
			points : points,
			edges : [],
			_aabb : null,
			_shared : [],
			/**
			 * Creates a crafty renderable, to display this polygon
			 */
			render : function () {
				this.renderable = Crafty.e("PolyDrawer")
					.poly(this.points);
			},
			makeEdges : function () {
				var i, e, nextP;
				this.edges = [];
				for (i = 0; i < this.points.length; i++) {
					nextP = this.points[(i + 1) % this.points.length];
					e = {seg:
							Sylvester.Line.Segment.create([this.points[i].x, this.points[i].y], [nextP.x, nextP.y]),
							points : [this.points[i], nextP]
							};
					this.edges.push(e);
				}
			},
			/**
			 * @return the AABB for this polygon, calculates it if it hasn't done so yet
			 */
			aabb : function () {
				var minX, minY, maxX, maxY, i;
				if (this._aabb !== null) {
					return this._aabb;
				}
				if (this.points.length === 0) {
					return null;
				}
				minX = this.points[0].x;
				minY = this.points[0].y;
				maxX = minX;
				maxY = minY;
				for (i = 1; i < this.points.length; i++) {
					if (this.points[i].x < minX) {
						minX = this.points[i].x;
					} else if (this.points[i].x > maxX) {
						maxX = this.points[i].x;
					}
					if (this.points[i].y < minY) {
						minY = this.points[i].y;
					} else if (this.points[i].y > maxY) {
						maxY = this.points[i].y;
					}
				}
				this._aabb = new AABB(minX, minY, maxX - minX, maxY - minY);
				return this._aabb;

			},
			/**
			 * @return true if the given point is inside this convex polygon.
			 */
			contains : function (point) {
				var i, first, second, result;
				for (i = 0; i < this.points.length; i++) {
					first = this.points[i];
					second = this.points[(i + 1) % this.points.length];
					result =
						(second.x - point.x) * (first.y - point.y)
						-
						(first.x - point.x) * (second.y - point.y);
					if (result > 0) {// flip if points are in counter-clockwise
						return false;
					}
				}
				return true;
			},
			getShared : function () {
				return this._shared;
			},
			/**
			 * @param ray - a Sylvester line segment
			 * @return the intersections points of ray
			 */
			ray : function (ray) {
				var intersections = [], i, point;
				for (i = 0; i < this.edges.length; i++) {
					point = ray.intersectionWith(this.edges[i].seg);
					if (point !== null) {
						intersections.push({v: point});
					}
				}
				return intersections;
			}
		};
		if (generateEdges) {
			finalPoly.makeEdges();
		}
		return finalPoly;
	};
});