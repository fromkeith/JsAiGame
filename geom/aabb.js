define([], function () {
	"use strict";
	return function (x, y, width, height) {
		var aabb = {
				x : x,
				y : y,
				w : width,
				h : height,
				edges : [],
				init : function () {
					this.edges.push(Sylvester.Line.Segment.create([this.x, this.y], [this.x + this.width, this.y]));
					this.edges.push(Sylvester.Line.Segment.create([this.x + this.width, this.y], [this.x + this.width, this.y + this.height]));
					this.edges.push(Sylvester.Line.Segment.create([this.x + this.width, this.y + this.height], [this.x, this.y + this.height]));
					this.edges.push(Sylvester.Line.Segment.create([this.x, this.y + this.height], [this.x, this.y]));
				},
				/**
				 * @return true if the point is contained in this AABB box
				 */
				contains : function (point) {
					if (point.x > this.x && point.x < this.x + this.w) {
						if (point.y > this.y && point.y < this.y + this.h) {
							return true;
						}
					}
					return false;
				},
				/**
				 * @return true if these aabb's intersect
				 */
				intersects : function (aabb) {
					var xContains, yContains;
					xContains = (aabb.x > this.x && aabb.x < this.x + this.w);
					if (!xContains) {
						xContains = (aabb.x + aabb.w > this.x && aabb.x + aabb.w < this.x + this.w);
					}
					if (!xContains) {
						return false;
					}
					yContains = (aabb.y > this.y && aabb.y < this.y + this.h);
					if (!yContains) {
						yContains = (aabb.y + aabb.h > this.y && aabb.y + aabb.h < this.y + this.h);
					}
					return yContains;
				},
				/**
				 * @param ray - a line segment
				 * @return the intersection points
				 */
				ray : function (ray) {
					var intersections = [], i, p;
					if (this.contains({x: ray.start.elements[0], y: ray.start.elements[1]})) {
						intersections.push($V(ray.start));
					}
					for (i = 0; i < this.edges.length; i++) {
						p = this.edges[i].intersectionWith(ray);
						if (p !== null) {
							intersections.push(p);
						}
					}
					return intersections;

				}

			};
		aabb.init();
		return aabb;
	};
});