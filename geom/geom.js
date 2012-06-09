define(["geom/polygon"], function (Polygon, AABB) {
	"use strict";
	return {
		pointSimplifier : function () {
			return {
				points : {},
				edges : {},
				addPoint : function (p) {
					var roundedX, roundedY, hash;
					roundedX = Math.round(p.x * 100) / 100;
					roundedY = Math.round(p.y * 100) / 100;
					hash = roundedX + "," + roundedY;
					if (!this.points.hasOwnProperty(hash)) {
						this.points[hash] = p;
						this.points[hash].parents = [];
						this.points[hash].edges = [];
					}
					return this.points[hash];
				},
				addEdge : function (p1, p2) {
					var hash, hash2, edge;
					hash = p1.x + "," + p1.y + "," + p2.x + "," + p2.y;
					hash2 = p2.x + "," + p2.y + "," + p1.x + "," + p1.y;
					if (this.edges.hasOwnProperty(hash)) {
						return this.edges[hash];
					} else if (this.edges.hasOwnProperty(hash2)) {
						return this.edges[hash2];
					} else {
						edge = {seg:
							Sylvester.Line.Segment.create([p1.x, p1.y], [p2.x, p2.y]),
							points : [p1, p2]
							};
						this.edges[hash] = edge;
						this.edges[hash].parents = [];
						p1.edges.push(edge);
						p2.edges.push(edge);
					}
					return this.edges[hash];
				}
			};
		}
	};
});