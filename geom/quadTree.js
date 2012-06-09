define(["geom/aabb"], function (AABB) {
	"use strict";
	return function CreateQuadTree(x, y, width, height) {
		return {
			_x : x,
			_y : y,
			_w : width,
			_h : height,
			_aabb : new AABB(x, y, width, height),
			polygons : [],
			_northWest : null,
			_northEast : null,
			_southWest : null,
			_southEast : null,
			insert : function (polygon) {
				var inNorthWest, inNorthEast, inSouthWest, inSouthEast, oldList, i;
				if (this._northWest === null) {
					this.polygons.push(polygon);
					if (this.polygons.length <= 4) {
						return;
					}
					this._northWest = new CreateQuadTree(x, y, width / 2, height / 2);
					this._northEast = new CreateQuadTree(x + width / 2, y, width / 2, height / 2);
					this._southWest = new CreateQuadTree(x, y + height / 2, width / 2, height / 2);
					this._southEast = new CreateQuadTree(x + width / 2, y + height / 2, width / 2, height / 2);
					oldList = this.polygons;
					this.polygons = [];
					for (i = 0; i < oldList.length; i++) {
						this.insert(oldList[i]);
					}
					return;
				}
				inNorthWest = this._northWest._aabb.intersects(polygon.aabb());
				inNorthEast = this._northEast._aabb.intersects(polygon.aabb());
				inSouthWest = this._southWest._aabb.intersects(polygon.aabb());
				inSouthEast = this._southEast._aabb.intersects(polygon.aabb());
				if (inNorthWest + inNorthEast + inSouthWest + inSouthEast > 1) {
					this.polygons.push(polygon);
					return;
				}
				if (inNorthWest) {
					this._northWest.insert(polygon);
				} else if (inNorthEast) {
					this._northEast.insert(polygon);
				} else if (inSouthEast) {
					this._southEast.insert(polygon);
				} else if (inSouthWest) {
					this._southWest.insert(polygon);
				}
			},
			find : function (point) {
				var found = [], i;
				for (i = 0; i < this.polygons.length; i++) {
					if (this.polygons[i].contains(point)) {
						found.push(this.polygons[i]);
					}
				}
				if (this._northWest !== null) {
					if (this._northWest._aabb.contains(point)) {
						found = found.concat(this._northWest.find(point));
					} else if (this._northEast._aabb.contains(point)) {
						found = found.concat(this._northEast.find(point));
					} else if (this._southWest._aabb.contains(point)) {
						found = found.concat(this._southWest.find(point));
					} else if (this._southEast._aabb.contains(point)) {
						found = found.concat(this._southEast.find(point));
					}
				}
				return found;
			},
			ray : function (ray) {
				var found = [], i, intersections;
				for (i = 0; i < this.polygons.length; i++) {
					intersections = this.polygons[i].ray(ray);
					if (intersections.length > 0) {
						found.push(this.polygons[i]);
					}
				}
				if (this._northWest !== null) {
					if (this._northWest._aabb.ray(ray)) {
						found = found.concat(this._northWest.rayFind(ray));
					} else if (this._northEast._aabb.ray(ray)) {
						found = found.concat(this._northEast.rayFind(ray));
					} else if (this._southWest._aabb.ray(ray)) {
						found = found.concat(this._southWest.rayFind(ray));
					} else if (this._southEast._aabb.ray(ray)) {
						found = found.concat(this._southEast.rayFind(ray));
					}
				}
				return found;
			}
		};
	};
});